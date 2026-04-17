// routes/affWithdrawRequestsRoutes.js
import express from "express";
import mongoose from "mongoose";

import AffWithdrawRequest from "../models/AffWithdrawRequest.js";
import User from "../models/User.js";
import AffWithdrawMethod from "../models/AffWithdrawMethod.js";

import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ✅ helper: ensure affiliate user
const requireAffUser = async (req) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId)
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });

  const user = await User.findById(userId).select(
    "role isActive balance currency username phone",
  );
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  if (user.role !== "aff-user") {
    throw Object.assign(new Error("Forbidden (affiliate only)"), {
      statusCode: 403,
    });
  }

  return user;
};

/**
 * ✅ Eligibility (Affiliate)
 * future: affiliate turnover / kyc / phone verification check এখানে যোগ করবে
 */
router.get(
  "/affiliate-withdraw-requests/eligibility",
  requireAuth,
  async (req, res) => {
    try {
      await requireAffUser(req);

      return res.json({
        success: true,
        data: {
          eligible: true,
          hasRunningTurnover: false,
          remaining: 0,
          message: "",
        },
      });
    } catch (e) {
      const status = e?.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: e?.message || "Failed to check eligibility",
      });
    }
  },
);

/**
 * ✅ AFFILIATE: Create withdraw request (balance hold)
 * - method active check
 * - min/max check
 * - required fields check
 * - deduct balance immediately
 */
router.post("/affiliate-withdraw-requests", requireAuth, async (req, res) => {
  try {
    const aff = await requireAffUser(req);

    const { methodId, amount, fields } = req.body || {};
    const amt = Number(amount || 0);

    if (!methodId || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: "methodId and valid amount required",
      });
    }

    // ✅ method exists + active
    const method = await AffWithdrawMethod.findOne({
      methodId: String(methodId).trim().toUpperCase(),
      isActive: true,
    });

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive withdraw method",
      });
    }

    // ✅ min/max validation (max=0 => no limit)
    const min = Number(method.minimumWithdrawAmount ?? 0);
    const max = Number(method.maximumWithdrawAmount ?? 0);

    if (Number.isFinite(min) && min > 0 && amt < min) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdraw amount is ${min}`,
      });
    }

    if (Number.isFinite(max) && max > 0 && amt > max) {
      return res.status(400).json({
        success: false,
        message: `Maximum withdraw amount is ${max}`,
      });
    }

    // ✅ validate required fields based on method.fields
    const reqFields = Array.isArray(method.fields) ? method.fields : [];
    const payloadFields = fields && typeof fields === "object" ? fields : {};

    for (const f of reqFields) {
      if (f.required === false) continue;
      const v = String(payloadFields?.[f.key] ?? "").trim();
      if (!v) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${f.key}`,
        });
      }
    }

    // re-check user
    const user = await User.findById(aff._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Forbidden (affiliate only)",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    const currentBalance = Number(user.balance || 0);
    if (currentBalance < amt) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // ✅ extra re-check to reduce race condition
    const freshUser = await User.findById(user._id);

    if (!freshUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (freshUser.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Forbidden (affiliate only)",
      });
    }

    if (freshUser.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    const freshBalance = Number(freshUser.balance || 0);

    if (freshBalance < amt) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const balanceAfter = freshBalance - amt;

    // ✅ create request
    const doc = await AffWithdrawRequest.create({
      user: freshUser._id, // ✅ affiliate stored as user id
      methodId: String(method.methodId),
      amount: amt,
      fields: payloadFields,
      status: "pending",
      balanceBefore: freshBalance,
      balanceAfter,
    });

    // ✅ deduct balance immediately (HOLD)
    freshUser.balance = balanceAfter;
    await freshUser.save();

    return res.json({
      success: true,
      message: "Affiliate withdraw request created (balance held).",
      data: doc,
    });
  } catch (e) {
    const status = e?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/**
 * ✅ AFFILIATE: list my withdraw requests
 */
router.get("/affiliate-withdraw-requests/my", requireAuth, async (req, res) => {
  try {
    const aff = await requireAffUser(req);

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AffWithdrawRequest.find({ user: aff._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AffWithdrawRequest.countDocuments({ user: aff._id }),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    const status = e?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: e?.message || "Failed to load history",
    });
  }
});

/**
 * ✅ AFFILIATE: my single request
 */
router.get(
  "/affiliate-withdraw-requests/my/:id",
  requireAuth,
  async (req, res) => {
    try {
      const aff = await requireAffUser(req);

      const doc = await AffWithdrawRequest.findOne({
        _id: req.params.id,
        user: aff._id,
      });

      if (!doc) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      return res.json({ success: true, data: doc });
    } catch (e) {
      const status = e?.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: e?.message || "Failed to load request",
      });
    }
  },
);

/**
 * ✅ ADMIN / STAFF: list all affiliate withdraw requests
 * NOTE: এখানে requireAdmin চাইলে বসাও
 */
router.get("/affiliate-withdraw-requests", requireAuth, async (req, res) => {
  try {
    // ✅ optional: admin-only guard example (uncomment if needed)
    // const me = await User.findById(req.user.id).select("role");
    // if (me?.role !== "admin") return res.status(403).json({ success:false, message:"Forbidden" });

    const status = req.query.status; // pending/approved/rejected/all
    const q = {};
    if (status && status !== "all") q.status = status;

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AffWithdrawRequest.find(q)
        .populate("user", "username phone balance role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AffWithdrawRequest.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load requests" });
  }
});

/**
 * ✅ ADMIN: details
 */
router.get(
  "/affiliate-withdraw-requests/:id",
  requireAuth,
  async (req, res) => {
    try {
      const doc = await AffWithdrawRequest.findById(req.params.id).populate(
        "user",
        "username phone balance role",
      );

      if (!doc)
        return res.status(404).json({ success: false, message: "Not found" });

      return res.json({ success: true, data: doc });
    } catch (e) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to load details" });
    }
  },
);

/**
 * ✅ ADMIN: approve
 * - does NOT change user balance (already held)
 */
router.patch(
  "/affiliate-withdraw-requests/:id/approve",
  requireAuth,
  async (req, res) => {
    try {
      const { adminNote } = req.body || {};
      const doc = await AffWithdrawRequest.findById(req.params.id);

      if (!doc)
        return res.status(404).json({ success: false, message: "Not found" });

      if (doc.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending requests can be approved",
        });
      }

      doc.status = "approved";
      doc.approvedAt = new Date();
      doc.adminNote = adminNote || "";
      await doc.save();

      return res.json({
        success: true,
        message: "Approved successfully",
        data: doc,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ success: false, message: "Approve failed" });
    }
  },
);

/**
 * ✅ ADMIN: reject
 * - refunds user balance back (because held)
 */
router.patch(
  "/affiliate-withdraw-requests/:id/reject",
  requireAuth,
  async (req, res) => {
    try {
      const { adminNote } = req.body || {};

      const doc = await AffWithdrawRequest.findById(req.params.id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Not found",
        });
      }

      if (doc.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending can be rejected",
        });
      }

      const user = await User.findById(doc.user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ✅ refund held amount
      user.balance = Number(user.balance || 0) + Number(doc.amount || 0);
      await user.save();

      doc.status = "rejected";
      doc.rejectedAt = new Date();
      doc.adminNote = adminNote || "";
      await doc.save();

      return res.json({
        success: true,
        message: "Rejected successfully (balance refunded).",
        data: doc,
      });
    } catch (e) {
      return res.status(e?.statusCode || 500).json({
        success: false,
        message: e?.message || "Reject failed",
      });
    }
  },
);

export default router;
