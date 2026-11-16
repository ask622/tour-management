import mongoose from "mongoose";

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("NewsletterSubscription", newsletterSubscriptionSchema);
