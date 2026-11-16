import mongoose from "mongoose";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";

export const getTourReviews = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.tourId)) {
    return res.status(400).json({ success: false, message: "Invalid tour ID" });
  }
  try {
    const reviews = await Review.find({
      productId: req.params.tourId,
      isApproved: true,
      isHidden: false,
    })
      .select("username reviewText rating createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

export const createReview = async (req, res) => {
  const { tourId } = req.params;
  const reviewText = typeof req.body.reviewText === "string" ? req.body.reviewText.trim() : "";
  const rating = Number(req.body.rating);
  if (!mongoose.isValidObjectId(tourId)) {
    return res.status(400).json({ success: false, message: "Invalid tour ID" });
  }
  if (!reviewText || reviewText.length > 2000 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Review text and a rating from 1 to 5 are required" });
  }

  try {
    const [tour, user] = await Promise.all([
      Tour.findById(tourId).select("_id"),
      User.findById(req.user.id).select("username isActive"),
    ]);
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: "An active account is required to submit a review" });
    }

    const review = await Review.create({
      productId: tourId,
      userId: user._id,
      username: user.username,
      reviewText,
      rating,
      isApproved: false,
      isHidden: false,
    });
    res.status(201).json({
      success: true,
      message: "Review submitted and is awaiting administrator approval",
      data: review,
    });
  } catch (err) {
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid review details" : "Failed to submit review",
    });
  }
};

export const getAdminReviews = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = {};
  const conditions = [];
  const status = String(req.query.status || "");

  if (status === "pending") conditions.push({ $or: [{ isApproved: false }, { isApproved: { $exists: false } }] });
  else if (status === "approved") filter.isApproved = true;
  else if (status === "hidden") filter.isHidden = true;
  else if (status && status !== "all") {
    return res.status(400).json({ success: false, message: "Invalid review status" });
  }

  if (req.query.rating !== undefined && req.query.rating !== "") {
    const rating = Number(req.query.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be from 1 to 5" });
    }
    filter.rating = rating;
  }
  if (req.query.tourId) {
    if (!mongoose.isValidObjectId(req.query.tourId)) {
      return res.status(400).json({ success: false, message: "Invalid tour ID" });
    }
    filter.productId = req.query.tourId;
  }

  const search = String(req.query.search || "").trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(escaped, "i");
    conditions.push({ $or: [{ username: expression }, { reviewText: expression }] });
  }
  if (conditions.length) filter.$and = conditions;

  try {
    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .select("productId userId username reviewText rating isApproved isHidden createdAt")
        .populate("productId", "title city")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

export const updateAdminReview = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid review ID" });
  }
  const updates = {};
  for (const field of ["isApproved", "isHidden"]) {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] !== "boolean") {
        return res.status(400).json({ success: false, message: `${field} must be a boolean` });
      }
      updates[field] = req.body[field];
    }
  }
  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, message: "Provide an approval or visibility update" });
  }

  try {
    const review = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .select("productId username reviewText rating isApproved isHidden createdAt")
      .populate("productId", "title city")
      .lean();
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.status(200).json({ success: true, message: "Review updated successfully", data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
};

export const deleteAdminReview = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid review ID" });
  }
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};
