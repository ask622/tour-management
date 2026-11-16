import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ success: false, message: "You are not authenticated!" });
  }

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return res.status(403).json({ success: false, message: "Token is invalid!" });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: "Account access cannot be verified while the database is unavailable" });
  }

  let account;
  try {
    account = await User.findById(user.id).select("isActive").lean();
  } catch (err) {
    console.error("Account status verification failed:", err.message);
    return res.status(503).json({ success: false, message: "Account access could not be verified" });
  }
  if (!account || account.isActive === false) {
    return res.status(401).json({ success: false, message: "This account is unavailable" });
  }
  req.user = user;
  return next();
};

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "You are not authorized!",
            });
        }
    });
}

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not authorized!" });
    }
    next();
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Incorrect password!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ success: true, message: "Logged in successfully!", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed!", error: err.message });
  }
};
