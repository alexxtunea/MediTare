const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    description: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    experienceLevel: {
      type: String,
      default: "",
      trim: true,
    },

    teachesAt: {
      type: String,
      default: "",
      trim: true,
    },

    sessionDuration: {
      type: String,
      default: "",
      trim: true,
    },

    sessionType: {
      type: String,
      enum: ["individual", "group", ""],
      default: "",
    },

    groupSize: {
      type: Number,
      default: 1,
      min: 1,
    },

    pricePerSession: {
      type: Number,
      default: 0,
      min: 0,
    },

    availability: [availabilitySchema],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
