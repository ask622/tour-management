import express from "express";
import {
  getAdminBookings,
  getAdminOverview,
  updateAdminBooking,
} from "../controllers/adminController.js";
import {
  deleteAdminReview,
  getAdminReviews,
  updateAdminReview,
} from "../controllers/reviewController.js";
import {
  createCategory,
  createDestination,
  deleteCategory,
  deleteDestination,
  getAdminCategories,
  getAdminDestinations,
  updateCategory,
  updateDestination,
} from "../controllers/catalogController.js";
import {
  createCoupon,
  deleteCoupon,
  getAdminCoupons,
  updateCoupon,
} from "../controllers/couponController.js";
import {
  deleteAdminEnquiry,
  getAdminEnquiries,
  updateAdminEnquiry,
} from "../controllers/enquiryController.js";
import {
  getAdminSiteContent,
  updateAdminSiteContent,
} from "../controllers/siteContentController.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

router.use(verifyAdmin);
router.get("/overview", getAdminOverview);
router.get("/bookings", getAdminBookings);
router.patch("/bookings/:id", updateAdminBooking);
router.get("/reviews", getAdminReviews);
router.patch("/reviews/:id", updateAdminReview);
router.delete("/reviews/:id", deleteAdminReview);
router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.get("/destinations", getAdminDestinations);
router.post("/destinations", createDestination);
router.put("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);
router.get("/coupons", getAdminCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.get("/enquiries", getAdminEnquiries);
router.patch("/enquiries/:id", updateAdminEnquiry);
router.delete("/enquiries/:id", deleteAdminEnquiry);
router.get("/content", getAdminSiteContent);
router.put("/content/:key", updateAdminSiteContent);

export default router;
