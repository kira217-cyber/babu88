import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* =========================
   helpers (local)
========================= */

// ✅ common duplicate key handler
const handleMongoDup = (err) => {
  if (err?.code === 11000) {
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    if (key === "username") return "এই username ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "phone") return "এই phone number ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "email") return "এই email ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "referralCode") return "referralCode already exists";
    return `${key} already exists`;
  }
  return null;
};

// ✅ tiers validator (overlap / invalid)
const validateTiers = (tiers) => {
  if (tiers === null) return { ok: true }; // reset to default
  if (!Array.isArray(tiers)) {
    return { ok: false, message: "tiers must be array or null" };
  }

  // empty array allowed (disable payouts)
  if (tiers.length === 0) return { ok: true };

  for (const t of tiers) {
    const from = Number(t.from);
    const to = Number(t.to);
    const amount = Number(t.amount);

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      return { ok: false, message: "from/to must be numbers" };
    }
    if (from < 1 || to < 1 || from > to) {
      return {
        ok: false,
        message: "invalid range: from must be <= to and >= 1",
      };
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, message: "amount must be >= 0" };
    }
  }

  // overlap check
  const sorted = [...tiers].sort((a, b) => Number(a.from) - Number(b.from));
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (Number(cur.from) <= Number(prev.to)) {
      return { ok: false, message: "tiers overlap" };
    }
  }

  return { ok: true };
};

/**
 * GET all normal users (role: "user") with pagination, search & status filter
 * GET /api/admin/users?page=1&limit=10&search=abc&status=all|active|inactive
 */
router.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const search = String(req.query.search || "")
      .trim()
      .toLowerCase();
    const status = (req.query.status || "all").toLowerCase();

    const filter = { role: "user" };

    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const items = await User.find(filter)
      .select("username phone balance currency isActive role createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.max(1, Math.ceil(total / limit));

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
 * ✅ Toggle user active/deactive
 * PATCH /api/admin/users/:id/status
 * body: { isActive: true/false }
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
 * ✅ Get single normal user details
 * GET /api/admin/users/:id
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
          "referralCount referralTierOverride referralTierStats " +
          "gameLossCommission depositCommission referCommission gameWinCommission " +
          "gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance " +
          "firstName lastName createdAt updatedAt",
      )
      .populate("referredBy", "username phone referralCode role")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id
 * body: {
 *   username?, phone?, email?, balance?, currency?, isActive?,
 *   firstName?, lastName?, password?
 * }
 */
router.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const allowed = [
      "username",
      "phone",
      "email",
      "balance",
      "currency",
      "isActive",
      "firstName",
      "lastName",
      "password",
    ];

    const $set = {};
    for (const k of allowed) {
      if (typeof req.body[k] !== "undefined") {
        $set[k] = req.body[k];
      }
    }

    if (typeof $set.username === "string") $set.username = $set.username.trim();
    if (typeof $set.phone === "string") $set.phone = $set.phone.trim();
    if (typeof $set.email === "string")
      $set.email = $set.email.trim().toLowerCase();

    if (typeof $set.balance !== "undefined") {
      $set.balance = Number($set.balance) || 0;
    }

    if (typeof $set.currency !== "undefined") {
      if (!["BDT", "USDT"].includes(String($set.currency).toUpperCase())) {
        return res.status(400).json({ message: "Invalid currency value" });
      }
      $set.currency = $set.currency.toUpperCase();
    }

    if (typeof $set.password === "string") {
      const pass = $set.password.trim();
      if (pass.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      $set.password = await bcrypt.hash(pass, salt);
    } else {
      delete $set.password;
    }

    if (typeof req.body.role !== "undefined") {
      return res.status(400).json({ message: "Role update not allowed here" });
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { $set },
      { new: true, runValidators: true },
    )
      .select(
        "username email phone role isActive currency balance referralCode createdUsers referredBy " +
          "referralCount referralTierOverride referralTierStats " +
          "firstName lastName createdAt updatedAt",
      )
      .lean();

    if (!updated) {
      return res
        .status(404)
        .json({ message: "User not found or not a normal user" });
    }

    return res.json({ message: "User updated successfully", user: updated });
  } catch (err) {
    const msg = handleMongoDup(err);
    if (msg) return res.status(409).json({ message: msg });

    console.error("Update user error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Admin: Update a normal user's referral tier override
 * PATCH /api/admin/users/:id/referral-tiers
 * body: { tiers: null | [] | [{from,to,amount,label?,isActive?}] }
 *
 * ✅ This uses validateTiers() এখানে (schema pre-save hook ব্যবহার না করে)
 * ============================
 */
router.patch("/users/:id/referral-tiers", async (req, res) => {
  try {
    const { id } = req.params;
    const { tiers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const check = validateTiers(tiers);
    if (!check.ok) {
      return res
        .status(400)
        .json({ message: check.message || "Invalid tiers" });
    }

    const user = await User.findById(id).select("_id role");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "user") {
      return res
        .status(400)
        .json({ message: "Only normal user can have tiers" });
    }

    await User.updateOne(
      { _id: id },
      { $set: { referralTierOverride: tiers } },
    );

    return res.json({ message: "Referral tiers updated" });
  } catch (err) {
    const msg = handleMongoDup(err);
    if (msg) return res.status(409).json({ message: msg });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

export default router;
