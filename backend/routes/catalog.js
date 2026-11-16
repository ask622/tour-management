import express from "express";
import {
  getPublicCategories,
  getPublicDestinations,
} from "../controllers/catalogController.js";

const router = express.Router();

router.get("/categories", getPublicCategories);
router.get("/destinations", getPublicDestinations);

export default router;
