import express from "express";
import {
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create", createBooking);
router.get("/:id", getBooking);
router.get("/", getAllBookings);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;
