import express from "express";
import { createReview, getTourReviews } from "../controllers/reviewController.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/:tourId", getTourReviews);
router.post("/:tourId", verifyToken, createReview);

export default router;
