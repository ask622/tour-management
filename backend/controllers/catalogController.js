import mongoose from "mongoose";
import Category from "../models/Category.js";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";

const slugify = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const makeInput = (body, { destination, partial = false } = {}) => {
  const allowed = destination
    ? ["name", "slug", "country", "region", "description", "image", "featured", "isActive"]
    : ["name", "slug", "description", "image", "isActive"];
  const input = {};
  for (const field of allowed) {
    if (body[field] === undefined) continue;
    if (["featured", "isActive"].includes(field)) {
      if (typeof body[field] !== "boolean") throw new Error(`${field} must be a boolean`);
      input[field] = body[field];
      continue;
    }
    if (typeof body[field] !== "string") throw new Error(`${field} must be a string`);
    input[field] = body[field].trim();
  }
  if (!partial && !input.name) throw new Error("Name is required");
  if (body.slug !== undefined && body.slug.trim()) input.slug = slugify(body.slug);
  else if (input.name) input.slug = slugify(input.name);
  if (Object.prototype.hasOwnProperty.call(input, "name") && !input.name) throw new Error("Name cannot be empty");
  if (input.slug === "") throw new Error("A valid name is required to create a slug");
  return input;
};

const sendCatalogError = (res, error, action) => {
  if (error.message && /must be a boolean|must be a string|Name is required|Name cannot be empty|valid name/.test(error.message)) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.code === 11000) return res.status(409).json({ success: false, message: "That name or slug is already in use" });
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ success: false, message: "Invalid record ID" });
  console.error(`${action} failed:`, error.message);
  return res.status(500).json({ success: false, message: `${action} failed` });
};

export const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    sendCatalogError(res, error, "Loading categories");
  }
};

export const getPublicDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ isActive: true }).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    sendCatalogError(res, error, "Loading destinations");
  }
};

export const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    sendCatalogError(res, error, "Loading categories");
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(makeInput(req.body));
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error) {
    sendCatalogError(res, error, "Creating category");
  }
};

export const updateCategory = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid category ID" });
  try {
    const input = makeInput(req.body, { partial: true });
    if (!Object.keys(input).length) return res.status(400).json({ success: false, message: "No category changes were provided" });
    const category = await Category.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    sendCatalogError(res, error, "Updating category");
  }
};

export const deleteCategory = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid category ID" });
  try {
    if (await Tour.exists({ categoryId: req.params.id })) {
      return res.status(409).json({ success: false, message: "This category is assigned to tours. Reassign them before deleting it." });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    sendCatalogError(res, error, "Deleting category");
  }
};

export const getAdminDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    sendCatalogError(res, error, "Loading destinations");
  }
};

export const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(makeInput(req.body, { destination: true }));
    res.status(201).json({ success: true, message: "Destination created", data: destination });
  } catch (error) {
    sendCatalogError(res, error, "Creating destination");
  }
};

export const updateDestination = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid destination ID" });
  try {
    const input = makeInput(req.body, { destination: true, partial: true });
    if (!Object.keys(input).length) return res.status(400).json({ success: false, message: "No destination changes were provided" });
    const destination = await Destination.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, message: "Destination updated", data: destination });
  } catch (error) {
    sendCatalogError(res, error, "Updating destination");
  }
};

export const deleteDestination = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid destination ID" });
  try {
    if (await Tour.exists({ destinationId: req.params.id })) {
      return res.status(409).json({ success: false, message: "This destination is assigned to tours. Reassign them before deleting it." });
    }
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, message: "Destination deleted" });
  } catch (error) {
    sendCatalogError(res, error, "Deleting destination");
  }
};
