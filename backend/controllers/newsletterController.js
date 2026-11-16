import NewsletterSubscription from "../models/NewsletterSubscription.js";

export const subscribeToNewsletter = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Provide a valid email address" });
  }

  try {
    const subscription = await NewsletterSubscription.findOneAndUpdate(
      { email },
      { $setOnInsert: { email } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("email subscribedAt");

    res.status(200).json({
      success: true,
      message: "You’re subscribed to Yatraventure travel updates.",
      data: { email: subscription.email, subscribedAt: subscription.subscribedAt },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: "This email is already subscribed." });
    }
    console.error("Newsletter subscription failed:", error.message);
    res.status(500).json({ success: false, message: "Could not save your newsletter subscription" });
  }
};
