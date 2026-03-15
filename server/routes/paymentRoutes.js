const express = require("express");
const Booking = require("../models/Booking");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// PAY FOR A BOOKING - student only
router.put("/:bookingId/pay", protect, authorizeRoles("student"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("student", "name email")
      .populate("teacher", "name email subjects pricePerSession");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only pay for your own booking" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    if (
      booking.status !== "approved" &&
      booking.status !== "completed" &&
      booking.status !== "pending_payment"
    ) {
      return res.status(400).json({
        message: "Booking can be paid only after the teacher approves it",
      });
    }

    if (booking.status === "pending_payment") {
      booking.status = "approved";
    }

    booking.paymentStatus = "paid";

    await booking.save();

    res.json({
      message: "Payment successful",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
