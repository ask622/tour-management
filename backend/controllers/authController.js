import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "node:crypto";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 15 * 24 * 60 * 60 * 1000,
});

// User Registration
export const registration = async (req, res) => {
  try {
    const { username, email, password, photo } = req.body;
    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Username, email, and password are required" });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedUsername.length < 2 || normalizedUsername.length > 80) {
      return res.status(400).json({ success: false, message: "Username must be between 2 and 80 characters" });
    }
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Provide a valid email address" });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters" });
    }
    if (photo !== undefined && typeof photo !== "string") {
      return res.status(400).json({ success: false, message: "Photo must be a URL string" });
    }

    const salt = await bcrypt.genSalt(10); // ✅ await is necessary
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hash,
      photo,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    const status = err.name === "ValidationError" || err.code === 11000 ? 400 : 500;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

const loginWithRole = async (req, res, requiredRole) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  try {
    const user = await User.findOne({ email });

    if (!user || user.isActive === false || typeof req.body.password !== "string" || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "This account does not have administrator access",
      });
    }

    const { password, role, ...rest } = user._doc;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res
      .cookie("access_token", token, {
        ...cookieOptions(),
      })
      .status(200)
      .json({
        success: true,
        message: requiredRole ? "Administrator logged in successfully" : "User logged in successfully",
        data: { ...rest, role },
        role,
      });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const login = (req, res) => loginWithRole(req, res);
export const adminLogin = (req, res) => loginWithRole(req, res, "admin");

export const setupAdmin = async (req, res) => {
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey || setupKey.length < 32) {
    return res.status(503).json({ success: false, message: "Admin setup is unavailable. Configure a private ADMIN_SETUP_KEY of at least 32 characters on the backend, then restart it." });
  }

  try {
    if (await User.exists({ role: "admin" })) {
      return res.status(409).json({ success: false, message: "An admin account already exists" });
    }

    const { username, email, password, setupKey: submittedKey } = req.body;
    const providedKey = Buffer.from(String(submittedKey || ""));
    const expectedKey = Buffer.from(setupKey);
    const keyIsValid = providedKey.length === expectedKey.length && timingSafeEqual(providedKey, expectedKey);
    if (!username || !email || !password || !keyIsValid) {
      return res.status(400).json({ success: false, message: "Invalid setup details or setup key" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const admin = await User.create({
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin account created. You can now sign in.",
      data: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (err) {
    const status = err.name === "ValidationError" || err.code === 11000 ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  const { httpOnly, secure, sameSite } = cookieOptions();
  res.clearCookie("access_token", { httpOnly, secure, sameSite });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
