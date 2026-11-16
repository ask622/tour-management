import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { reserveCouponDiscount } from "./couponController.js";

const BOOKING_SERVICE_FEE = 830;

export const createBooking = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      tourId,
      guestSize,
      bookAt,
      paymentMethod,
    } = req.body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2 ||
        !phone || !tourId || !bookAt || paymentMethod !== "pay-on-arrival") {
      return res.status(400).json({
        success: false,
        message: "Provide a valid name, phone, tour, date, and payment method",
      });
    }

    const parsedGuestSize = Number(guestSize);
    if (!Number.isInteger(parsedGuestSize) || parsedGuestSize < 1) {
      return res.status(400).json({
        success: false,
        message: "Guest size must be at least 1",
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    if (!mongoose.isValidObjectId(tourId)) {
      return res.status(400).json({ success: false, message: "Invalid tour ID" });
    }

    const bookingDate = new Date(bookAt);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: "Choose a valid future travel date" });
    }

    const [user, tour] = await Promise.all([
      User.findById(req.user.id).select("email isActive"),
      Tour.findById(tourId).select("price discountPrice maxPeople status availableDates"),
    ]);
    if (!user || user.isActive === false) return res.status(401).json({ success: false, message: "User account not found or inactive" });
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    if (tour.status === "inactive") return res.status(409).json({ success: false, message: "This tour is not currently available for booking" });
    if (parsedGuestSize > tour.maxPeople) {
      return res.status(400).json({ success: false, message: `This tour allows up to ${tour.maxPeople} travelers` });
    }
    if (tour.availableDates.length > 0) {
      const requestedDate = bookingDate.toISOString().slice(0, 10);
      const isAvailable = tour.availableDates.some((date) => new Date(date).toISOString().slice(0, 10) === requestedDate);
      if (!isAvailable) {
        return res.status(400).json({ success: false, message: "This tour is not available on the selected date" });
      }
    }

    const pricePerTraveler = tour.discountPrice ?? tour.price;
    const subtotal = Number((pricePerTraveler * parsedGuestSize).toFixed(2));
    if (req.body.couponCode !== undefined && typeof req.body.couponCode !== "string") {
      return res.status(400).json({ success: false, message: "Coupon code must be a string" });
    }

    let reservedCoupon = null;
    let discountAmount = 0;
    const couponCode = String(req.body.couponCode || "").trim();
    if (couponCode) {
      try {
        const reservation = await reserveCouponDiscount(couponCode, subtotal);
        reservedCoupon = reservation.coupon;
        discountAmount = reservation.discountAmount;
      } catch (couponError) {
        return res.status(400).json({ success: false, message: couponError.message });
      }
    }

    const newBooking = new Booking({
      userId: String(user._id),
      userEmail: user.email,
      fullName: fullName.trim(),
      phone: String(phone),
      tourId,
      guestSize: parsedGuestSize,
      bookAt: bookingDate,
      paymentMethod,
      totalAmount: Number((subtotal + BOOKING_SERVICE_FEE - discountAmount).toFixed(2)),
      couponCode: reservedCoupon?.code || "",
      discountAmount,
      paymentStatus: "pending",
      paymentVerified: false,
      bookingStatus: "pending",
    });

    try {
      await newBooking.save();
    } catch (saveError) {
      if (reservedCoupon) {
        try {
          await Coupon.updateOne({ _id: reservedCoupon._id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
        } catch (rollbackError) {
          console.error("Coupon usage rollback failed:", rollbackError.message);
        }
      }
      throw saveError;
    }

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

    if (req.user.role !== "admin" && booking.userId !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this booking" });
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

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: String(req.user.id) })
      .select("fullName userEmail phone tourId guestSize bookAt paymentMethod totalAmount couponCode discountAmount paymentStatus paymentVerified bookingStatus createdAt")
      .populate("tourId", "title city image")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch your bookings" });
  }
};

export const cancelMyBooking = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid booking ID" });
  }

  try {
    const booking = await Booking.findOneAndUpdate({
      _id: req.params.id,
      userId: String(req.user.id),
      bookingStatus: "pending",
    }, { $set: { bookingStatus: "cancelled" } }, { new: true, runValidators: true });

    if (!booking) {
      const ownedBooking = await Booking.exists({ _id: req.params.id, userId: String(req.user.id) });
      if (!ownedBooking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      return res.status(409).json({
        success: false,
        message: "Only pending booking requests can be cancelled online. Please contact us for help.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking request cancelled",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to cancel booking" });
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
    if (Object.prototype.hasOwnProperty.call(req.body, "paymentStatus")) {
      return res.status(400).json({
        success: false,
        message: "Payment status can only change after a verified payment event",
      });
    }

    const updates = {};
    if (req.body.bookingStatus !== undefined) {
      if (!["pending", "confirmed", "cancelled", "completed"].includes(req.body.bookingStatus)) {
        return res.status(400).json({ success: false, message: "Invalid booking status" });
      }
      updates.bookingStatus = req.body.bookingStatus;
    }
    if (req.body.adminNotes !== undefined) {
      if (typeof req.body.adminNotes !== "string" || req.body.adminNotes.length > 2000) {
        return res.status(400).json({ success: false, message: "Admin notes must be 2000 characters or fewer" });
      }
      updates.adminNotes = req.body.adminNotes.trim();
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Provide a booking status or admin note to update" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select("-cardNumber -cardHolder -expiryDate -cvv -upiId");

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
