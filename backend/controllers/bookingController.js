import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      fullName,
      phone,
      tourId,
      guestSize,
      bookAt,
      paymentMethod,
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      upiId,
      totalAmount,
    } = req.body;

    // Validation
    if (!userId || !userEmail || !fullName || !phone || !tourId || !bookAt || !paymentMethod || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (guestSize < 1) {
      return res.status(400).json({
        success: false,
        message: "Guest size must be at least 1",
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    // Validate payment method details
    if (paymentMethod === "credit-card" || paymentMethod === "debit-card") {
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        return res.status(400).json({
          success: false,
          message: "Card details are required for this payment method",
        });
      }

      if (cardNumber.length !== 16) {
        return res.status(400).json({
          success: false,
          message: "Card number must be 16 digits",
        });
      }

      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in MM/YY format",
        });
      }

      if (cvv.length !== 3) {
        return res.status(400).json({
          success: false,
          message: "CVV must be 3 digits",
        });
      }
    }

    if (paymentMethod === "upi") {
      if (!upiId || !upiId.includes("@")) {
        return res.status(400).json({
          success: false,
          message: "Valid UPI ID is required",
        });
      }
    }

    // Create booking
    const newBooking = new Booking({
      userId,
      userEmail,
      fullName,
      phone,
      tourId,
      guestSize,
      bookAt: new Date(bookAt),
      paymentMethod,
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      upiId,
      totalAmount,
      paymentStatus: paymentMethod === "razorpay" ? "pending" : "pending",
      bookingStatus: "pending",
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: err.message,
    });
  }
};

export const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("tourId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: err.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("tourId");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, bookingStatus } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus, bookingStatus },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: err.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: err.message,
    });
  }
};
