const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    date: {
      type: String,
      required: [true, "Date is required"],
    },

    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending_approval", "approved", "pending_payment", "cancelled", "completed"],
      default: "pending_approval",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
