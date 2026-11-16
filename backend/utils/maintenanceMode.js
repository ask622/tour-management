import mongoose from "mongoose";
import SiteContent from "../models/SiteContent.js";

const isAllowedDuringMaintenance = (req) => {
  if (req.path.startsWith("/api/v1/admin/")) return true;
  if (req.method === "GET" && req.path === "/api/v1/site-content/settings") return true;
  return req.method === "POST" && [
    "/api/v1/auth/login",
    "/api/v1/auth/admin-login",
    "/api/v1/auth/logout",
    "/api/v1/auth/setup-admin",
  ].includes(req.path);
};

const maintenanceMode = async (req, res, next) => {
  if (isAllowedDuringMaintenance(req) || mongoose.connection.readyState !== 1) return next();

  try {
    const settings = await SiteContent.findOne({ key: "settings" }).select("data.maintenanceMode").lean();
    if (settings?.data?.maintenanceMode === true) {
      return res.status(503).json({
        success: false,
        message: "The website is temporarily unavailable for maintenance. Please try again later.",
      });
    }
    return next();
  } catch (error) {
    console.error("Checking maintenance mode failed:", error.message);
    return res.status(503).json({ success: false, message: "The website is temporarily unavailable" });
  }
};

export default maintenanceMode;
