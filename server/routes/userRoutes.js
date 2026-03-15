const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// GET ALL TEACHERS
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET TEACHER BY ID
router.get("/teachers/:id", async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "teacher",
    }).select("-password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE MY PROFILE
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;

    if (user.role === "teacher") {
      user.subjects = req.body.subjects || user.subjects;
      user.description = req.body.description || user.description;
      user.profileImage = req.body.profileImage ?? user.profileImage;
      user.experienceLevel = req.body.experienceLevel ?? user.experienceLevel;
      user.teachesAt = req.body.teachesAt ?? user.teachesAt;
      user.sessionDuration = req.body.sessionDuration ?? user.sessionDuration;
      user.sessionType = req.body.sessionType ?? user.sessionType;
      user.groupSize = req.body.groupSize ?? user.groupSize;
      user.pricePerSession =
        req.body.pricePerSession ?? user.pricePerSession;
      user.availability = req.body.availability || user.availability;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      subjects: updatedUser.subjects,
      description: updatedUser.description,
      profileImage: updatedUser.profileImage,
      experienceLevel: updatedUser.experienceLevel,
      teachesAt: updatedUser.teachesAt,
      sessionDuration: updatedUser.sessionDuration,
      sessionType: updatedUser.sessionType,
      groupSize: updatedUser.groupSize,
      pricePerSession: updatedUser.pricePerSession,
      availability: updatedUser.availability,
      averageRating: updatedUser.averageRating,
      ratingsCount: updatedUser.ratingsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OPTIONAL: TEACHER ONLY PROFILE UPDATE
router.put(
  "/teacher/profile",
  protect,
  authorizeRoles("teacher"),
  async (req, res) => {
    try {
      const teacher = await User.findById(req.user._id);

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      teacher.name = req.body.name || teacher.name;
      teacher.subjects = req.body.subjects || teacher.subjects;
      teacher.description = req.body.description || teacher.description;
      teacher.profileImage = req.body.profileImage ?? teacher.profileImage;
      teacher.experienceLevel =
        req.body.experienceLevel ?? teacher.experienceLevel;
      teacher.teachesAt = req.body.teachesAt ?? teacher.teachesAt;
      teacher.sessionDuration = req.body.sessionDuration ?? teacher.sessionDuration;
      teacher.sessionType = req.body.sessionType ?? teacher.sessionType;
      teacher.groupSize = req.body.groupSize ?? teacher.groupSize;
      teacher.pricePerSession =
        req.body.pricePerSession ?? teacher.pricePerSession;
      teacher.availability = req.body.availability || teacher.availability;

      const updatedTeacher = await teacher.save();

      res.json({
        _id: updatedTeacher._id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        role: updatedTeacher.role,
        subjects: updatedTeacher.subjects,
        description: updatedTeacher.description,
        profileImage: updatedTeacher.profileImage,
        experienceLevel: updatedTeacher.experienceLevel,
        teachesAt: updatedTeacher.teachesAt,
        sessionDuration: updatedTeacher.sessionDuration,
        sessionType: updatedTeacher.sessionType,
        groupSize: updatedTeacher.groupSize,
        pricePerSession: updatedTeacher.pricePerSession,
        availability: updatedTeacher.availability,
        averageRating: updatedTeacher.averageRating,
        ratingsCount: updatedTeacher.ratingsCount,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
