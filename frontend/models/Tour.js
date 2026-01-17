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
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema);
