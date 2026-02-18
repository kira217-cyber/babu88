import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * GET all affiliate users (with pagination, search & status filter)
 * GET /api/admin/affiliates?page=1&limit=10&search=abc&status=all|active|inactive
 * search   => username / phone (case-insensitive)
 * status   => "all" (default), "active", "inactive"
 */
router.get("/affiliates", async (req, res) => {
  try {
    // ─── Query parsing ───────────────────────────────────────
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const search = String(req.query.search || "").trim().toLowerCase();
    const status = (req.query.status || "all").toLowerCase();

    // ─── Base filter ─────────────────────────────────────────
    const filter = { role: "aff-user" };

    // Status filter
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }
    // "all" → no additional isActive filter

    // Search filter (username or phone)
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // ─── Count total matching documents ──────────────────────
    const totalItems = await User.countDocuments(filter);

    // ─── Fetch paginated data ────────────────────────────────
    const items = await User.find(filter)
      .select(
        "username phone balance isActive currency referralCode createdAt " +
        "gameLossCommission depositCommission referCommission gameWinCommission " +
        "gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    // ─── Response ────────────────────────────────────────────
    return res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching affiliates:", err);
    return res.status(500).json({
      message: "Server error while fetching affiliates",
      error: err.message,
    });
  }
});

/**
 * ============================
 * ✅ GET single affiliate details
 * GET /api/admin/affiliates/:id
 * ============================
 */
router.get("/affiliates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const user = await User.findOne({ _id: id, role: "aff-user" })
      .select("-password")
      .lean();

    if (!user) return res.status(404).json({ message: "Affiliate not found" });

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Activate affiliate (set commissions + isActive true)
 * PATCH /api/admin/affiliates/:id/activate
 * body: { gameLossCommission, depositCommission, referCommission, gameWinCommission }
 * ============================
 */
router.patch("/affiliates/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const payload = {
      isActive: true,
      gameLossCommission: toNum(req.body.gameLossCommission),
      depositCommission: toNum(req.body.depositCommission),
      referCommission: toNum(req.body.referCommission),
      gameWinCommission: toNum(req.body.gameWinCommission),
    };

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "aff-user" },
      { $set: payload },
      { new: true },
    ).select("username phone balance isActive gameLossCommission depositCommission referCommission gameWinCommission");

    if (!updated) return res.status(404).json({ message: "Affiliate not found" });

    return res.json({ message: "Activated", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Deactivate affiliate (isActive false)
 * PATCH /api/admin/affiliates/:id/deactivate
 * ============================
 */
router.patch("/affiliates/:id/deactivate", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "aff-user" },
      { $set: { isActive: false } },
      { new: true },
    ).select("username phone balance isActive");

    if (!updated) return res.status(404).json({ message: "Affiliate not found" });

    return res.json({ message: "Deactivated", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/admin/affiliates/:id
 * body: {
 *   username?, phone?, email?, balance?, currency?, isActive?,
 *   firstName?, lastName?,
 *   gameLossCommission?, depositCommission?, referCommission?, gameWinCommission?,
 *   gameLossCommissionBalance?, depositCommissionBalance?, referCommissionBalance?, gameWinCommissionBalance?,
 *   password?    ← new field (optional)
 * }
 */
router.patch("/affiliates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    // Allowed fields (added password)
    const allowed = [
      "username",
      "phone",
      "email",
      "balance",
      "currency",
      "isActive",
      "firstName",
      "lastName",

      "gameLossCommission",
      "depositCommission",
      "referCommission",
      "gameWinCommission",

      "gameLossCommissionBalance",
      "depositCommissionBalance",
      "referCommissionBalance",
      "gameWinCommissionBalance",

      "password",           // ← added
    ];

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const updates = {};
    for (const k of allowed) {
      if (typeof req.body?.[k] === "undefined") continue;

      // Number fields
      const numberFields = new Set([
        "balance",
        "gameLossCommission",
        "depositCommission",
        "referCommission",
        "gameWinCommission",
        "gameLossCommissionBalance",
        "depositCommissionBalance",
        "referCommissionBalance",
        "gameWinCommissionBalance",
      ]);

      if (numberFields.has(k)) {
        updates[k] = toNum(req.body[k]);
      }
      // String fields with trim
      else if (["username", "phone", "email", "firstName", "lastName"].includes(k)) {
        updates[k] = String(req.body[k] ?? "").trim();
      }
      // Currency validation
      else if (k === "currency") {
        const val = String(req.body[k] ?? "").trim().toUpperCase();
        if (!["BDT", "USDT"].includes(val)) {
          return res.status(400).json({ message: "Invalid currency value" });
        }
        updates[k] = val;
      }
      // Boolean
      else if (k === "isActive") {
        updates[k] = Boolean(req.body[k]);
      }
      // Password (optional - only set if provided and valid)
      else if (k === "password") {
        const pass = String(req.body[k] ?? "").trim();
        if (pass.length > 0) {
          if (pass.length < 6) {
            return res.status(400).json({
              message: "Password must be at least 6 characters long",
            });
          }
          // Hash password here (assuming bcrypt is used)
          const salt = await bcrypt.genSalt(10);
          updates[k] = await bcrypt.hash(pass, salt);
        }
        // If password is empty string → do NOT update password field
      } else {
        updates[k] = req.body[k];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "aff-user" },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("-password") // never return password
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    return res.json({ message: "Affiliate updated successfully", user: updated });
  } catch (err) {
    // Duplicate key error handling
    if (err?.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0] || "field";
      const messages = {
        username: "এই username ইতিমধ্যে ব্যবহার করা হয়েছে",
        phone: "এই phone number ইতিমধ্যে ব্যবহার করা হয়েছে",
        email: "এই email ইতিমধ্যে ব্যবহার করা হয়েছে",
      };
      return res.status(409).json({
        message: messages[key] || `${key} already exists`,
      });
    }

    console.error("Affiliate update error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
