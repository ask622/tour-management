import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    distance: { type: Number, required: true },
    image: { type: String, required: true },  // ✅ Required Field
    description: { type: String, required: true }, // ✅ Required Field
    price: { type: Number, required: true },
    maxPeople: { type: Number, required: true }, // ✅ Required Field
    featured: { type: Boolean, default: false },
    discountPrice: { type: Number, min: 0, default: null },
    duration: { type: String, trim: true, maxlength: 120, default: "" },
    availableDates: { type: [Date], default: [] },
    itinerary: { type: [String], default: [] },
    includedServices: { type: [String], default: [] },
    excludedServices: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    categoryId: { type: mongoose.Types.ObjectId, ref: "Category", default: null },
    destinationId: { type: mongoose.Types.ObjectId, ref: "Destination", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema);
