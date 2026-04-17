// routes/WithdrawRequestsRoutes.js
import express from "express";
import mongoose from "mongoose";
import WithdrawRequest from "../models/WithdrawRequests.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import { requireAuth } from "../middleware/requireAuth.js";

// import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

/**
 * ✅ Eligibility:
 * block withdraw if user has any running turnover (required not fulfilled)
 */
router.get("/eligibility", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (!running) {
      return res.json({
        success: true,
        data: {
          eligible: true,
          hasRunningTurnover: false,
          remaining: 0,
          message: "",
        },
      });
    }

    const required = Number(running.required || 0);
    const progress = Number(running.progress || 0);
    const remaining = Math.max(0, required - progress);

    return res.json({
      success: true,
      data: {
        eligible: false,
        hasRunningTurnover: true,
        remaining,
        message:
          remaining > 0
            ? `Turnover pending: remaining ${remaining}`
            : "Turnover pending",
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
});

/**
 * ✅ USER: Create withdraw request
 * - checks turnover eligibility
 * - deducts balance immediately (hold)
 * - creates pending request
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { methodId, amount, fields } = req.body || {};
    const amt = Number(amount || 0);

    if (!methodId || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: "methodId and valid amount required",
      });
    }

    // ✅ turnover check (must be fulfilled)
    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (running) {
      const remaining = Math.max(
        0,
        Number(running.required || 0) - Number(running.progress || 0),
      );

      return res.status(403).json({
        success: false,
        message: "Turnover not fulfilled. Complete turnover before withdraw.",
        data: { remaining },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
    const freshUser = await User.findById(userId);

    if (!freshUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
    const doc = await WithdrawRequest.create({
      user: freshUser._id,
      methodId: String(methodId),
      amount: amt,
      fields: fields && typeof fields === "object" ? fields : {},
      status: "pending",
      balanceBefore: freshBalance,
      balanceAfter,
    });

    // ✅ deduct user balance immediately (HOLD)
    freshUser.balance = balanceAfter;
    await freshUser.save();

    return res.json({
      success: true,
      message: "Withdraw request created (balance held).",
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
 * ✅ USER: list my withdraw requests
 */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments({ user: userId }),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load history" });
  }
});

/**
 * ✅ USER: my single request
 */
router.get("/my/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const doc = await WithdrawRequest.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: doc });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load request" });
  }
});

/**
 * ✅ ADMIN: list requests (pending by default)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const status = req.query.status; // pending/approved/rejected/all
    const q = {};
    if (status && status !== "all") q.status = status;

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find(q)
        .populate("user", "username phone balance")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments(q),
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
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await WithdrawRequest.findById(req.params.id).populate(
      "user",
      "username phone balance",
    );
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }
    return res.json({ success: true, data: doc });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to load details" });
  }
});

/**
 * ✅ ADMIN: approve
 * - does NOT change user balance (already held on request create)
 */
router.patch("/:id/approve", requireAuth, async (req, res) => {
  try {
    const { adminNote } = req.body || {};
    const doc = await WithdrawRequest.findById(req.params.id);

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }
    if (doc.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be approved",
      });
    }

    doc.status = "approved";
    doc.approvedAt = new Date();
    doc.adminNote = adminNote || "";
    // doc.adminId = req.admin?._id || req.admin?.id; // if you have admin in req
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
});

/**
 * ✅ ADMIN: reject
 * - refunds user balance back (because balance was held)
 */
router.patch("/:id/reject", requireAuth, async (req, res) => {
  try {
    const { adminNote } = req.body || {};

    const doc = await WithdrawRequest.findById(req.params.id);

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

    // refund
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
    const status = e?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: e?.message || "Reject failed",
    });
  }
});

export default router;