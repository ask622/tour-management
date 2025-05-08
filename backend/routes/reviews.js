import express from "express";
import { createReview } from "../controllers/reviewController.js";

const router = express.Router();

// POST request to create a review
router.post("/:tourId", createReview);

export default router;