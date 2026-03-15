const express = require("express");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

const updateTeacherRating = async (teacherId) => {
  const reviews = await Review.find({ teacher: teacherId });

  const ratingsCount = reviews.length;

  const averageRating =
    ratingsCount === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / ratingsCount;

  await User.findByIdAndUpdate(teacherId, {
    averageRating,
    ratingsCount,
  });
};

// ADD REVIEW - student only
router.post("/", protect, authorizeRoles("student"), async (req, res) => {
  try {
    const { teacher, booking, rating, comment } = req.body;

    if (!teacher || !booking || !rating) {
      return res.status(400).json({ message: "Teacher, booking and rating are required" });
    }

    const bookingExists = await Booking.findById(booking);

    if (!bookingExists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (bookingExists.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can review only your own bookings" });
    }

    if (bookingExists.teacher.toString() !== teacher) {
      return res.status(400).json({ message: "Teacher does not match booking" });
    }

    if (bookingExists.paymentStatus !== "paid" && bookingExists.status !== "completed") {
      return res.status(400).json({
        message: "You can review only paid or completed bookings",
      });
    }

    const existingReview = await Review.findOne({
      booking,
      student: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this booking" });
    }

    const review = await Review.create({
      student: req.user._id,
      teacher,
      booking,
      rating,
      comment: comment || "",
    });

    await updateTeacherRating(teacher);

    const populatedReview = await Review.findById(review._id)
      .populate("student", "name email")
      .populate("teacher", "name email")
      .populate("booking");

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET REVIEWS FOR ONE TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const reviews = await Review.find({ teacher: req.params.teacherId })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;