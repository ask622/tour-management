import express from "express";
import {
  createBooking,
  getBooking,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createBooking);
router.get("/mine", verifyToken, getMyBookings);
router.patch("/:id/cancel", verifyToken, cancelMyBooking);
router.get("/:id", verifyToken, getBooking);
router.get("/", verifyAdmin, getAllBookings);
router.put("/:id", verifyAdmin, updateBooking);
router.delete("/:id", verifyAdmin, deleteBooking);

export default router;
