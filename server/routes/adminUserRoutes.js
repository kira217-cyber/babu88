import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * GET all normal users (role: "user") with pagination, search & status filter
 * GET /api/admin/users?page=1&limit=10&search=abc&status=all|active|inactive
 * search   => username / phone (case-insensitive)
 * status   => "all" (default), "active", "inactive"
 */
router.get("/users", async (req, res) => {
  try {
    // ─── Query parsing ───────────────────────────────────────
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const search = String(req.query.search || "").trim().toLowerCase();
    const status = (req.query.status || "all").toLowerCase();

    // ─── Base filter ─────────────────────────────────────────
    const filter = { role: "user" };

    // Status filter
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }
    // "all" → no isActive condition

    // Search filter
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // ─── Count total ─────────────────────────────────────────
    const total = await User.countDocuments(filter);

    // ─── Fetch paginated data ────────────────────────────────
    const items = await User.find(filter)
      .select("username phone balance currency isActive role createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.max(1, Math.ceil(total / limit));

    // ─── Response ────────────────────────────────────────────
    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({
      message: "Server error while fetching users",
      error: err.message,
    });
  }
});

/**
 * ============================
 * ✅ Toggle user active/deactive
 * PATCH /api/admin/users/:id/status
 * body: { isActive: true/false }
 * ============================
 */
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    if (typeof isActive === "undefined") {
      return res.status(400).json({ message: "isActive required" });
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { $set: { isActive: Boolean(isActive) } },
      { new: true },
    )
      .select("username phone balance currency isActive role createdAt")
      .lean();

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Updated", user: updated });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Get single normal user details
 * GET /api/admin/users/:id
 * ============================
 */
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const user = await User.findOne({ _id: id, role: "user" })
      .select(
        "username email phone role isActive currency balance referralCode createdUsers referredBy " +
          "gameLossCommission depositCommission referCommission gameWinCommission " +
          "gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance " +
          "firstName lastName createdAt updatedAt",
      )
      .populate("referredBy", "username phone referralCode role")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id
 * body: {
 *   username?, phone?, email?, balance?, currency?, isActive?,
 *   firstName?, lastName?, password?   ← new field
 * }
 */
router.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    // Allowed fields (now including password)
    const allowed = [
      "username",
      "phone",
      "email",
      "balance",
      "currency",
      "isActive",
      "firstName",
      "lastName",
      "password",           // ← added
    ];

    const $set = {};
    for (const k of allowed) {
      if (typeof req.body[k] !== "undefined") {
        $set[k] = req.body[k];
      }
    }

    // Sanitize & validate
    if (typeof $set.username === "string") $set.username = $set.username.trim();
    if (typeof $set.phone === "string")    $set.phone = $set.phone.trim();
    if (typeof $set.email === "string")    $set.email = $set.email.trim().toLowerCase();
    if (typeof $set.balance !== "undefined") {
      $set.balance = Number($set.balance) || 0;
    }

    // Currency validation
    if (typeof $set.currency !== "undefined") {
      if (!["BDT", "USDT"].includes(String($set.currency).toUpperCase())) {
        return res.status(400).json({ message: "Invalid currency value" });
      }
      $set.currency = $set.currency.toUpperCase();
    }

    // Password handling (if provided)
    if (typeof $set.password === "string") {
      const pass = $set.password.trim();
      if (pass.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      // Here you should hash the password before saving
      // Example with bcrypt (assuming you have bcrypt imported):
      const salt = await bcrypt.genSalt(10);
      $set.password = await bcrypt.hash(pass, salt);
      // OR use your existing user model's pre-save hook if it auto-hashes
    } else {
      // Important: do NOT set password to empty or undefined
      delete $set.password;
    }

    // Prevent role change
    if (typeof req.body.role !== "undefined") {
      return res.status(400).json({ message: "Role update not allowed here" });
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { $set },
      { new: true, runValidators: true }
    )
      .select(
        "username email phone role isActive currency balance referralCode createdUsers referredBy " +
        "firstName lastName createdAt updatedAt"
      )
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "User not found or not a normal user" });
    }

    return res.json({ message: "User updated successfully", user: updated });
  } catch (err) {
    // Duplicate key error (username, phone, email)
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      const messages = {
        username: "এই username ইতিমধ্যে ব্যবহার করা হয়েছে",
        phone: "এই phone number ইতিমধ্যে ব্যবহার করা হয়েছে",
        email: "এই email ইতিমধ্যে ব্যবহার করা হয়েছে",
      };
      return res.status(409).json({
        message: messages[field] || `${field} already exists`,
      });
    }

    console.error("Update user error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
