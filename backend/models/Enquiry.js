import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["pending", "replied", "resolved"], default: "pending" },
    adminNotes: { type: String, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.model("Enquiry", enquirySchema);
