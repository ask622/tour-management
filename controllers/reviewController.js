import express from 'express';
import { createReview} from '../controllers/reviewController.js';
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";

const router = express.Router();
router.post('/:tourId', createReview);

export const createReview = async (req, res) => {
  const { tourId } = req.params;
  const { username, reviewText, rating } = req.body;

  try {
    const review = new Review({ productId: tourId, username, reviewText, rating });
    const savedReview = await review.save();

    res.status(201).json({ success: true, message: "Review added successfully", data: savedReview });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add review", error: err.message });
  }
};

export default router;