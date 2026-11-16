import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    country: { type: String, trim: true, maxlength: 100, default: "India" },
    region: { type: String, trim: true, maxlength: 120, default: "" },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    image: { type: String, trim: true, maxlength: 2048, default: "" },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Destination", destinationSchema);
