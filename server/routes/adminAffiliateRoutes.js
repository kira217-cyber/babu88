import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

/**
 * ============================
 * ✅ GET all affiliate users (pagination + search)
 * GET /api/admin/affiliates?page=1&limit=10&search=abc
 * search => username / phone
 * ============================
 */
router.get("/affiliates", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const search = String(req.query.search || "").trim();

    const filter = { role: "aff-user" };

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const totalItems = await User.countDocuments(filter);

    const items = await User.find(filter)
      .select("username phone balance isActive currency referralCode createdAt gameLossCommission depositCommission referCommission gameWinCommission")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    return res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
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

router.patch("/affiliates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    // ✅ only allow these fields to be updated
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
    ];

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const updates = {};
    for (const k of allowed) {
      if (typeof req.body?.[k] === "undefined") continue;

      // number fields normalize
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
      } else if (k === "username" || k === "phone" || k === "email") {
        updates[k] = String(req.body[k] ?? "").trim();
      } else if (k === "currency") {
        const val = String(req.body[k] ?? "").trim().toUpperCase();
        if (!["BDT", "USDT"].includes(val)) {
          return res.status(400).json({ message: "Invalid currency" });
        }
        updates[k] = val;
      } else if (k === "isActive") {
        updates[k] = Boolean(req.body[k]);
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
      { new: true, runValidators: true },
    )
      .select("-password")
      .lean();

    if (!updated) return res.status(404).json({ message: "Affiliate not found" });

    return res.json({ message: "Updated", user: updated });
  } catch (err) {
    // ✅ duplicate key friendly message
    if (err?.code === 11000) {
      const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
      return res.status(409).json({ message: `${key} already exists` });
    }

    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
