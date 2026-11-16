import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

export const calculateCouponDiscount = (coupon, amount) => {
  const rawDiscount = coupon.discountType === "percentage"
    ? amount * coupon.discountValue / 100
    : coupon.discountValue;
  const cappedDiscount = coupon.maxDiscountAmount == null
    ? rawDiscount
    : Math.min(rawDiscount, coupon.maxDiscountAmount);
  return Math.min(amount, Number(cappedDiscount.toFixed(2)));
};

const couponIsUsable = (coupon, amount, now = new Date()) => {
  if (!coupon || !coupon.isActive) return "Coupon is invalid or inactive";
  if (coupon.startsAt > now) return "Coupon is not active yet";
  if (coupon.expiresAt < now) return "Coupon has expired";
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return "Coupon usage limit has been reached";
  if (amount < coupon.minOrderAmount) return `Minimum order amount is ₹${coupon.minOrderAmount}`;
  return "";
};

export const getCouponDiscount = async (code, amount) => {
  const coupon = await Coupon.findOne({ code: normalizeCode(code) }).lean();
  const error = couponIsUsable(coupon, amount);
  if (error) return { error };
  return { coupon, discountAmount: calculateCouponDiscount(coupon, amount) };
};

export const reserveCouponDiscount = async (code, amount) => {
  const normalizedCode = normalizeCode(code);
  const existingCoupon = await Coupon.findOne({ code: normalizedCode }).lean();
  const error = couponIsUsable(existingCoupon, amount);
  if (error) throw new Error(error);

  const now = new Date();
  const reservedCoupon = await Coupon.findOneAndUpdate(
    {
      _id: existingCoupon._id,
      isActive: true,
      startsAt: { $lte: now },
      expiresAt: { $gte: now },
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  ).lean();
  if (!reservedCoupon) throw new Error("Coupon is no longer available");
  return {
    coupon: reservedCoupon,
    discountAmount: calculateCouponDiscount(reservedCoupon, amount),
  };
};

export const validateCoupon = async (req, res) => {
  const amount = Number(req.body.orderAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Order amount must be greater than zero" });
  }
  try {
    const result = await getCouponDiscount(req.body.code, amount);
    if (result.error) return res.status(400).json({ success: false, message: result.error });
    res.status(200).json({
      success: true,
      data: {
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        totalAfterDiscount: Number((amount - result.discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Coupon validation failed:", error.message);
    res.status(500).json({ success: false, message: "Could not validate coupon" });
  }
};

export const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error("Loading coupons failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to load coupons" });
  }
};

const couponInput = (body, partial = false) => {
  const fields = ["code", "discountType", "discountValue", "minOrderAmount", "maxDiscountAmount", "startsAt", "expiresAt", "usageLimit", "isActive"];
  const input = {};
  for (const field of fields) {
    if (body[field] === undefined) continue;
    if (field === "isActive") {
      if (typeof body[field] !== "boolean") throw new Error("isActive must be a boolean");
      input[field] = body[field];
    } else if (field === "code") {
      if (typeof body[field] !== "string" || !body[field].trim()) throw new Error("Coupon code is required");
      input.code = normalizeCode(body[field]);
    } else if (field === "discountType") {
      if (!["percentage", "fixed"].includes(body[field])) throw new Error("Discount type must be percentage or fixed");
      input.discountType = body[field];
    } else if (field === "maxDiscountAmount" && (body[field] === null || body[field] === "")) {
      input[field] = null;
    } else if (["startsAt", "expiresAt"].includes(field)) {
      const date = new Date(body[field]);
      if (Number.isNaN(date.getTime())) throw new Error(`${field} must be a valid date`);
      input[field] = date;
    } else {
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value < 0 || (["discountValue"].includes(field) && value === 0)) {
        throw new Error(`${field} must be a valid non-negative number`);
      }
      input[field] = value;
    }
  }
  if (!partial && (!input.code || !input.discountType || input.discountValue === undefined || !input.expiresAt)) {
    throw new Error("Code, discount type/value, and expiry are required");
  }
  if (input.discountType === "percentage" && input.discountValue > 100) {
    throw new Error("Percentage discount cannot exceed 100");
  }
  return input;
};

const sendCouponError = (res, error, action) => {
  if (error.message && /required|valid|must be|cannot exceed|non-negative/.test(error.message)) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.code === 11000) return res.status(409).json({ success: false, message: "Coupon code already exists" });
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ success: false, message: error.message });
  console.error(`${action} failed:`, error.message);
  return res.status(500).json({ success: false, message: `${action} failed` });
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(couponInput(req.body));
    res.status(201).json({ success: true, message: "Coupon created", data: coupon });
  } catch (error) {
    sendCouponError(res, error, "Creating coupon");
  }
};

export const updateCoupon = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid coupon ID" });
  try {
    const input = couponInput(req.body, true);
    if (!Object.keys(input).length) return res.status(400).json({ success: false, message: "No coupon changes were provided" });
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.status(200).json({ success: true, message: "Coupon updated", data: coupon });
  } catch (error) {
    sendCouponError(res, error, "Updating coupon");
  }
};

export const deleteCoupon = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid coupon ID" });
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    sendCouponError(res, error, "Deleting coupon");
  }
};
