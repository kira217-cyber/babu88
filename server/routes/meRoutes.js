// routes/meRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ✅ GET /api/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username email phone currency firstName lastName role isActive balance referralCode createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to load profile" });
  }
});

// ✅ PUT /api/me  (update profile)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      currency,
      firstName,
      lastName,
    } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Patch fields (only if provided)
    if (username != null) user.username = String(username).trim();
    if (email != null) user.email = String(email).trim();
    if (phone != null) user.phone = String(phone).trim();
    if (firstName != null) user.firstName = String(firstName).trim();
    if (lastName != null) user.lastName = String(lastName).trim();

    if (currency != null) {
      const c = String(currency).toUpperCase();
      if (!["BDT", "USDT"].includes(c)) {
        return res.status(400).json({ success: false, message: "Invalid currency" });
      }
      user.currency = c;
    }

    // ✅ password optional (only update if user sends it)
    if (password != null && String(password).trim().length > 0) {
      const plain = String(password).trim();
      if (plain.length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(plain, salt);
    }

    const saved = await user.save();

    // return safe user
    const safeUser = await User.findById(saved._id).select(
      "username email phone currency firstName lastName role isActive balance referralCode createdAt updatedAt"
    );

    return res.json({ success: true, message: "Profile updated", data: safeUser });
  } catch (e) {
    // ✅ duplicate key handling (username/phone unique)
    if (e?.code === 11000) {
      const key = Object.keys(e?.keyPattern || {})[0] || "field";
      return res.status(409).json({ success: false, message: `${key} already exists` });
    }
    return res.status(500).json({ success: false, message: e?.message || "Update failed" });
  }
});

export default router;