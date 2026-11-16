import express from "express";
import { getPublicSiteContent } from "../controllers/siteContentController.js";

const router = express.Router();

router.get("/:key", getPublicSiteContent);

export default router;
