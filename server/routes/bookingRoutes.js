const express = require("express");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  normalizeDayName,
  getCanonicalDayFromDate,
} = require("../utils/availability");

const router = express.Router();

const normalizeTimeSlotValue = (value = "") => {
  const separatorIndex = value.indexOf(":");
  const rawDay =
    separatorIndex === -1 ? value : value.slice(0, separatorIndex);
  const rawInterval =
    separatorIndex === -1 ? "" : value.slice(separatorIndex + 1);
  const normalizedDay = normalizeDayName(rawDay);
  const normalizedInterval = rawInterval.trim().replace(/\s+/g, " ");

  return {
    day: normalizedDay,
    interval: normalizedInterval,
  };
};

const enrichBookingsWithParticipants = async (bookings) => {
  const enrichedBookings = await Promise.all(
    bookings.map(async (bookingDocument) => {
      const booking = bookingDocument.toObject ? bookingDocument.toObject() : bookingDocument;

      const sessionParticipants = await Booking.find({
        teacher: booking.teacher?._id || booking.teacher,
        subject: booking.subject,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: { $ne: "cancelled" },
      })
        .populate(
          "student",
          "name email profileImage age educationLevel description"
        )
        .select("student status paymentStatus")
        .sort({ createdAt: 1 });

      return {
        ...booking,
        sessionParticipants: sessionParticipants
          .map((participantBooking) => participantBooking.student)
          .filter(Boolean),
      };
    })
  );

  return enrichedBookings;
};

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
      const selectedTimeSlot = normalizeTimeSlotValue(timeSlot);

      const hasMatchingTimeSlot = teacherAvailability.some(
        (slot) => {
          const teacherSlot = normalizeTimeSlotValue(
            `${slot.day}: ${slot.start} - ${slot.end}`
          );

          return (
            teacherSlot.day === bookingDay &&
            selectedTimeSlot.day === bookingDay &&
            teacherSlot.interval === selectedTimeSlot.interval
          );
        }
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
      status: "pending_approval",
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

      const bookingIds = bookings.map((booking) => booking._id);
      const existingReviews = await Review.find({
        student: req.user._id,
        booking: { $in: bookingIds },
      }).select("booking");

      const reviewedBookingIds = new Set(
        existingReviews.map((review) => review.booking.toString())
      );

      const bookingsWithParticipants = await enrichBookingsWithParticipants(bookings);

      res.json(
        bookingsWithParticipants.map((booking) => ({
          ...booking,
          hasReview: reviewedBookingIds.has(booking._id.toString()),
        }))
      );
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/:bookingId/approve",
  protect,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.bookingId)
        .populate("student", "name email")
        .populate(
          "teacher",
          "name email role subjects pricePerSession sessionDuration sessionType groupSize"
        );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.teacher._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can approve only your own bookings" });
      }

      if (booking.status !== "pending_approval") {
        return res.status(400).json({
          message: "Only bookings waiting for approval can be accepted",
        });
      }

      booking.status = "approved";
      await booking.save();

      res.json({
        message: "Booking approved successfully",
        booking,
      });
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
        .populate(
          "teacher",
          "name email role subjects pricePerSession description sessionDuration sessionType groupSize"
        )
        .sort({ createdAt: -1 });

      const bookingsWithParticipants = await enrichBookingsWithParticipants(bookings);

      res.json(bookingsWithParticipants);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
