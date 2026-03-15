const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  normalizeDayName,
  getCanonicalDayFromDate,
} = require("../utils/availability");

const router = express.Router();

// CREATE BOOKING - student only
router.post("/", protect, authorizeRoles("student"), async (req, res) => {
  try {
    const { teacher, subject, date, timeSlot } = req.body;

    if (!teacher || !subject || !date || !timeSlot) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const teacherUser = await User.findOne({ _id: teacher, role: "teacher" });

    if (!teacherUser) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const requestedSubject = subject.trim();
    const teacherSubjects = Array.isArray(teacherUser.subjects)
      ? teacherUser.subjects
          .map((teacherSubject) => teacherSubject.trim())
          .filter(Boolean)
      : [];

    if (teacherSubjects.length === 0) {
      return res.status(400).json({
        message: "This teacher cannot receive bookings until they add subjects",
      });
    }

    const teachesRequestedSubject = teacherSubjects.some(
      (teacherSubject) =>
        teacherSubject.toLowerCase() === requestedSubject.toLowerCase()
    );

    if (!teachesRequestedSubject) {
      return res.status(400).json({
        message: "Selected subject is not taught by this teacher",
      });
    }

    const bookingDay = getCanonicalDayFromDate(date);

    if (!bookingDay) {
      return res.status(400).json({ message: "Selected date is invalid" });
    }

    const teacherAvailability = Array.isArray(teacherUser.availability)
      ? teacherUser.availability.filter(
          (slot) => normalizeDayName(slot.day) === bookingDay
        )
      : [];

    if (teacherAvailability.length > 0) {
      const hasMatchingTimeSlot = teacherAvailability.some(
        (slot) => `${slot.day}: ${slot.start} - ${slot.end}` === timeSlot
      );

      if (!hasMatchingTimeSlot) {
        return res.status(400).json({
          message: "Selected time slot does not match the chosen date",
        });
      }
    }

    const booking = await Booking.create({
      student: req.user._id,
      teacher: teacherUser._id,
      subject: requestedSubject,
      date,
      timeSlot,
      price: teacherUser.pricePerSession,
      status: "pending_payment",
      paymentStatus: "unpaid",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("student", "name email role")
      .populate(
        "teacher",
        "name email role subjects pricePerSession sessionDuration sessionType groupSize"
      );

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MY BOOKINGS - student only
router.get(
  "/my-bookings",
  protect,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ student: req.user._id })
        .populate(
          "teacher",
          "name email subjects pricePerSession description sessionDuration sessionType groupSize"
        )
        .sort({ createdAt: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET BOOKINGS FOR LOGGED-IN TEACHER
router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ teacher: req.user._id })
        .populate("student", "name email")
        .sort({ createdAt: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
