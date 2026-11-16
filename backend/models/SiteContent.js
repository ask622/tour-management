import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ["home", "about", "contact", "footer", "settings"],
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("SiteContent", siteContentSchema);
