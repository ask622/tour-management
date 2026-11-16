import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 40 },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0.01 },
    minOrderAmount: { type: Number, min: 0, default: 0 },
    maxDiscountAmount: { type: Number, min: 0, default: null },
    startsAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, min: 0, default: 0 },
    usedCount: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.pre("validate", function validateCoupon(next) {
  if (this.expiresAt && this.startsAt && this.expiresAt <= this.startsAt) {
    this.invalidate("expiresAt", "Expiry must be after the start date");
  }
  if (this.discountType === "percentage" && this.discountValue > 100) {
    this.invalidate("discountValue", "Percentage discount cannot exceed 100");
  }
  next();
});

export default mongoose.model("Coupon", couponSchema);
