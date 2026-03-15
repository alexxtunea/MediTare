const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : user;
  delete plainUser.password;
  return plainUser;
};

const updateTeacherRating = async (teacherId) => {
  const reviews = await Review.find({ teacher: teacherId });
  const ratingsCount = reviews.length;
  const averageRating = ratingsCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingsCount
    : 0;

  await User.findByIdAndUpdate(teacherId, {
    averageRating,
    ratingsCount,
  });
};

const cleanupUserRelations = async (user) => {
  if (!user) {
    return;
  }

  const bookings = await Booking.find({
    $or: [{ student: user._id }, { teacher: user._id }],
  }).select("_id teacher");

  const bookingIds = bookings.map((booking) => booking._id);
  const teacherIdsToUpdate = new Set(
    bookings.map((booking) => booking.teacher?.toString()).filter(Boolean)
  );

  const relatedReviews = await Review.find({
    $or: [
      { student: user._id },
      { teacher: user._id },
      { booking: { $in: bookingIds } },
    ],
  }).select("teacher");

  relatedReviews.forEach((review) => {
    if (review.teacher) {
      teacherIdsToUpdate.add(review.teacher.toString());
    }
  });

  await Review.deleteMany({
    $or: [
      { student: user._id },
      { teacher: user._id },
      { booking: { $in: bookingIds } },
    ],
  });

  await Booking.deleteMany({
    $or: [{ student: user._id }, { teacher: user._id }],
  });

  for (const teacherId of teacherIdsToUpdate) {
    if (teacherId !== user._id.toString()) {
      await updateTeacherRating(teacherId);
    }
  }
};

// GET ALL USERS - admin only
router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE USER - admin only
router.post("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      subjects,
      description,
      profileImage,
      experienceLevel,
      teachesAt,
      sessionDuration,
      sessionType,
      groupSize,
      pricePerSession,
      availability,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      subjects: Array.isArray(subjects) ? subjects : [],
      description: description || "",
      profileImage: profileImage || "",
      experienceLevel: experienceLevel || "",
      teachesAt: teachesAt || "",
      sessionDuration: sessionDuration || "",
      sessionType: sessionType || "",
      groupSize: Number(groupSize) || 1,
      pricePerSession: Number(pricePerSession) || 0,
      availability: Array.isArray(availability) ? availability : [],
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE USER - admin only
router.put("/users/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      password,
      role,
      subjects,
      description,
      profileImage,
      experienceLevel,
      teachesAt,
      sessionDuration,
      sessionType,
      groupSize,
      pricePerSession,
      availability,
    } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Another user already uses this email" });
      }
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.subjects = Array.isArray(subjects) ? subjects : user.subjects;
    user.description = description ?? user.description;
    user.profileImage = profileImage ?? user.profileImage;
    user.experienceLevel = experienceLevel ?? user.experienceLevel;
    user.teachesAt = teachesAt ?? user.teachesAt;
    user.sessionDuration = sessionDuration ?? user.sessionDuration;
    user.sessionType = sessionType ?? user.sessionType;
    user.groupSize = groupSize !== undefined ? Number(groupSize) || 1 : user.groupSize;
    user.pricePerSession =
      pricePerSession !== undefined ? Number(pricePerSession) || 0 : user.pricePerSession;
    user.availability = Array.isArray(availability) ? availability : user.availability;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE USER - admin only
router.delete("/users/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await cleanupUserRelations(user);
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL BOOKINGS - admin only
router.get("/bookings", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("student", "name email role")
      .populate("teacher", "name email role subjects pricePerSession")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE BOOKING - admin only
router.put("/bookings/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("student", "name email role")
      .populate("teacher", "name email role subjects pricePerSession");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { subject, date, timeSlot, price, status, paymentStatus } = req.body;

    booking.subject = subject ?? booking.subject;
    booking.date = date ?? booking.date;
    booking.timeSlot = timeSlot ?? booking.timeSlot;
    booking.price = price !== undefined ? Number(price) || 0 : booking.price;
    booking.status = status ?? booking.status;
    booking.paymentStatus = paymentStatus ?? booking.paymentStatus;

    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE BOOKING - admin only
router.delete("/bookings/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const relatedReviews = await Review.find({ booking: booking._id }).select("teacher");
    const teacherIdsToUpdate = new Set(
      relatedReviews.map((review) => review.teacher?.toString()).filter(Boolean)
    );

    await Review.deleteMany({ booking: booking._id });
    await Booking.findByIdAndDelete(req.params.id);

    for (const teacherId of teacherIdsToUpdate) {
      await updateTeacherRating(teacherId);
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL REVIEWS - admin only
router.get("/reviews", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("student", "name email")
      .populate("teacher", "name email")
      .populate("booking", "subject date timeSlot")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE REVIEW - admin only
router.put("/reviews/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("student", "name email")
      .populate("teacher", "name email")
      .populate("booking", "subject date timeSlot");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      review.rating = Number(rating);
    }

    review.comment = comment ?? review.comment;

    await review.save();
    await updateTeacherRating(review.teacher._id);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE REVIEW - admin only
router.delete("/reviews/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const teacherId = review.teacher?.toString();

    await Review.findByIdAndDelete(req.params.id);

    if (teacherId) {
      await updateTeacherRating(teacherId);
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
