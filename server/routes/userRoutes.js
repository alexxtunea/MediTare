const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  subjects: user.subjects,
  description: user.description,
  profileImage: user.profileImage,
  age: user.age,
  educationLevel: user.educationLevel,
  experienceLevel: user.experienceLevel,
  teachesAt: user.teachesAt,
  sessionDuration: user.sessionDuration,
  sessionType: user.sessionType,
  groupSize: user.groupSize,
  pricePerSession: user.pricePerSession,
  availability: user.availability,
  averageRating: user.averageRating,
  ratingsCount: user.ratingsCount,
});

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

router.get("/students/:id", protect, async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
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
    user.profileImage = req.body.profileImage ?? user.profileImage;
    user.age = req.body.age !== undefined ? Number(req.body.age) || null : user.age;
    user.educationLevel = req.body.educationLevel ?? user.educationLevel;
    user.description = req.body.description ?? user.description;

    if (user.role === "teacher") {
      user.subjects = req.body.subjects || user.subjects;
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

    res.json(serializeUser(updatedUser));
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

      res.json(serializeUser(updatedTeacher));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
