import mongoose from "mongoose";
import Enquiry from "../models/Enquiry.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createEnquiry = async (req, res) => {
  const fields = ["name", "email", "subject", "message"];
  const values = {};
  for (const field of fields) {
    if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
      return res.status(400).json({ success: false, message: `${field} is required` });
    }
    values[field] = req.body[field].trim();
  }
  if (values.name.length > 120 || values.subject.length > 160 || values.message.length > 5000) {
    return res.status(400).json({ success: false, message: "Enquiry fields exceed the allowed length" });
  }
  values.email = values.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 254) {
    return res.status(400).json({ success: false, message: "Provide a valid email address" });
  }
  values.phone = typeof req.body.phone === "string" ? req.body.phone.trim().slice(0, 40) : "";

  try {
    const enquiry = await Enquiry.create(values);
    res.status(201).json({ success: true, message: "Your enquiry has been sent", data: { id: enquiry._id } });
  } catch (error) {
    console.error("Creating enquiry failed:", error.message);
    res.status(500).json({ success: false, message: "Could not send your enquiry" });
  }
};

export const getAdminEnquiries = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.status) {
    if (!["pending", "replied", "resolved"].includes(req.query.status)) {
      return res.status(400).json({ success: false, message: "Invalid enquiry status" });
    }
    filter.status = req.query.status;
  }
  const search = String(req.query.search || "").trim();
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: expression }, { email: expression }, { subject: expression }, { message: expression }];
  }

  try {
    const [total, enquiries] = await Promise.all([
      Enquiry.countDocuments(filter),
      Enquiry.find(filter)
        .select("name email phone subject message status adminNotes createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Loading enquiries failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to load enquiries" });
  }
};

export const updateAdminEnquiry = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid enquiry ID" });
  const updates = {};
  if (req.body.status !== undefined) {
    if (!["pending", "replied", "resolved"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid enquiry status" });
    }
    updates.status = req.body.status;
  }
  if (req.body.adminNotes !== undefined) {
    if (typeof req.body.adminNotes !== "string" || req.body.adminNotes.length > 2000) {
      return res.status(400).json({ success: false, message: "Admin notes must be 2000 characters or fewer" });
    }
    updates.adminNotes = req.body.adminNotes.trim();
  }
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Provide a status or internal note to update" });

  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select("name email phone subject message status adminNotes createdAt updatedAt")
      .lean();
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
    res.status(200).json({ success: true, message: "Enquiry updated", data: enquiry });
  } catch (error) {
    console.error("Updating enquiry failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to update enquiry" });
  }
};

export const deleteAdminEnquiry = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid enquiry ID" });
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
    res.status(200).json({ success: true, message: "Enquiry deleted" });
  } catch (error) {
    console.error("Deleting enquiry failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete enquiry" });
  }
};
