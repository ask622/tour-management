import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    tourId: {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    guestSize: {
      type: Number,
      required: true,
    },
    bookAt: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit-card", "debit-card", "upi", "razorpay", "wallet", "pay-on-arrival"],
      required: true,
    },
    cardNumber: { type: String, select: false },
    cardHolder: { type: String, select: false },
    expiryDate: { type: String, select: false },
    cvv: { type: String, select: false },
    upiId: { type: String, select: false },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
