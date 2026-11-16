import mongoose from "mongoose";
import SiteContent from "../models/SiteContent.js";

const isSafeWebUrl = (value) => /^https?:\/\/[^\s]+$/i.test(value);
const isSafeContentLink = (value) =>
  isSafeWebUrl(value) ||
  (/^\/(?!\/)[^\\\s]*$/.test(value)) ||
  /^(mailto|tel):[^\s]+$/i.test(value);

const fieldRules = {
  home: {
    heroHeading: "text",
    heroDescription: "text",
    heroImage: "image",
    heroImageSecondary: "image",
    promotionalBanner: "text",
    featuredTourIds: "ids",
    featuredDestinationIds: "ids",
    testimonials: "testimonials",
  },
  about: {
    introduction: "text",
    mission: "text",
    vision: "text",
    image: "image",
    team: "team",
  },
  contact: {
    email: "text",
    phone: "text",
    address: "text",
    socialLinks: "linksMap",
  },
  footer: {
    description: "text",
    socialLinks: "linksMap",
    usefulLinks: "links",
  },
  settings: {
    websiteName: "text",
    logo: "image",
    favicon: "image",
    maintenanceMode: "boolean",
  },
};

const sanitizeField = (field, value, rule) => {
  if (rule === "boolean") {
    if (typeof value !== "boolean") throw new Error(`${field} must be a boolean`);
    return value;
  }
  if (rule === "image" || rule === "text") {
    if (typeof value !== "string") throw new Error(`${field} must be a string`);
    const maxLength = rule === "image" ? 2048 : 5000;
    if (value.length > maxLength) throw new Error(`${field} is too long`);
    const text = value.trim();
    if (rule === "image" && text && !isSafeContentLink(text)) throw new Error(`${field} must be a safe URL or local path`);
    return text;
  }
  if (rule === "ids") {
    if (!Array.isArray(value) || value.length > 30 || value.some((id) => !mongoose.isValidObjectId(id))) {
      throw new Error(`${field} must be a list of valid record IDs`);
    }
    return [...new Set(value.map(String))];
  }
  if (rule === "linksMap") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object of link URLs`);
    const entries = Object.entries(value);
    if (entries.length > 20 || entries.some(([key, url]) => !/^[a-z0-9_-]{1,30}$/i.test(key) || typeof url !== "string" || url.length > 2048 || (url && !isSafeWebUrl(url)))) {
      throw new Error(`${field} contains an invalid social link`);
    }
    return Object.fromEntries(entries.map(([key, url]) => [key, url.trim()]));
  }
  if (rule === "links") {
    if (!Array.isArray(value) || value.length > 30) throw new Error(`${field} must be a list of links`);
    return value.map((link) => {
      if (!link || typeof link.label !== "string" || typeof link.url !== "string" || link.label.length > 100 || link.url.length > 2048 || (link.url && !isSafeContentLink(link.url))) {
        throw new Error(`${field} contains an invalid link`);
      }
      return { label: link.label.trim(), url: link.url.trim() };
    });
  }
  if (rule === "testimonials") {
    if (!Array.isArray(value) || value.length > 30) throw new Error("testimonials must be a list");
    return value.map((item) => {
      if (!item || typeof item.name !== "string" || typeof item.quote !== "string" || item.name.length > 120 || item.quote.length > 2000) {
        throw new Error("Each testimonial needs a name and a quote");
      }
      if (rule === "team") {
        if (!Array.isArray(value) || value.length > 20) throw new Error("team must be a list of up to 20 people");
        return value.map((member) => {
          if (!member || typeof member.name !== "string" || typeof member.role !== "string" ||
              member.name.trim().length === 0 || member.name.length > 120 || member.role.trim().length === 0 || member.role.length > 120 ||
              (member.bio !== undefined && (typeof member.bio !== "string" || member.bio.length > 1000)) ||
              (member.photo !== undefined && (typeof member.photo !== "string" || member.photo.length > 2048 || (member.photo && !isSafeContentLink(member.photo))))) {
            throw new Error("Each team member needs a name and role, with optional bio and safe photo URL");
          }
          return {
            name: member.name.trim(),
            role: member.role.trim(),
            ...(member.bio ? { bio: member.bio.trim() } : {}),
            ...(member.photo ? { photo: member.photo.trim() } : {}),
          };
        });
      }
      const rating = item.rating === undefined ? undefined : Number(item.rating);
      if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
        throw new Error("Testimonial rating must be from 1 to 5");
      }
      return { name: item.name.trim(), quote: item.quote.trim(), ...(item.location ? { location: String(item.location).slice(0, 120) } : {}), ...(rating ? { rating } : {}) };
    });
  }
  throw new Error("Unsupported content field");
};

const validateContent = (key, data) => {
  if (!Object.prototype.hasOwnProperty.call(fieldRules, key)) throw new Error("Unknown content section");
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Content must be a JSON object");
  const result = {};
  for (const [field, value] of Object.entries(data)) {
    const rule = fieldRules[key][field];
    if (!rule) throw new Error(`Unknown field: ${field}`);
    result[field] = sanitizeField(field, value, rule);
  }
  return result;
};

export const getPublicSiteContent = async (req, res) => {
  const key = req.params.key;
  if (!["home", "about", "contact", "footer", "settings"].includes(key)) {
    return res.status(404).json({ success: false, message: "Content section not found" });
  }
  try {
    const content = await SiteContent.findOne({ key }).select("key data updatedAt").lean();
    const data = content?.data || {};
    if (key === "settings") {
      return res.status(200).json({
        success: true,
        data: {
          websiteName: data.websiteName || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          maintenanceMode: data.maintenanceMode === true,
        },
      });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Loading public site content failed:", error.message);
    res.status(500).json({ success: false, message: "Could not load website content" });
  }
};

export const getAdminSiteContent = async (req, res) => {
  try {
    const entries = await SiteContent.find().select("key data updatedAt").lean();
    res.status(200).json({
      success: true,
      data: Object.fromEntries(entries.map((entry) => [entry.key, entry.data])),
    });
  } catch (error) {
    console.error("Loading site content failed:", error.message);
    res.status(500).json({ success: false, message: "Could not load website content" });
  }
};

export const updateAdminSiteContent = async (req, res) => {
  let data;
  try {
    data = validateContent(req.params.key, req.body.data);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  try {
    const content = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { $set: { data, updatedBy: String(req.user.id) } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("key data updatedAt").lean();
    res.status(200).json({ success: true, message: "Website content saved", data: content.data });
  } catch (error) {
    console.error("Saving site content failed:", error.message);
    res.status(500).json({ success: false, message: "Could not save website content" });
  }
};
