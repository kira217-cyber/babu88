// routes/depositRequestsRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequests.js";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";
import DepositMethod from "../models/DepositMethods.js";

const router = express.Router();

/* ------------------ AUTH MIDDLEWARE (minimal) ------------------ */
const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// const requireAdmin = async (req, res, next) => {
//   try {
//     if (req.user?.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Admin only" });
//     }
//     next();
//   } catch {
//     return res.status(403).json({ success: false, message: "Admin only" });
//   }
// };

/* ------------------ HELPERS: server-side calc ------------------ */
const parsePercent = (tagText) => {
  if (typeof tagText !== "string") return 0;
  if (!tagText.includes("%")) return 0;
  const p = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(p) ? p : 0;
};

const computeBonuses = ({ amount, methodDoc, channelId, promoId }) => {
  const channels = Array.isArray(methodDoc?.channels) ? methodDoc.channels : [];
  const ch = channels.find(
    (c) => String(c?.id) === String(channelId) && c?.isActive !== false,
  );
  if (!ch) throw new Error("Invalid channel");

  const channelPercent = parsePercent(ch?.tagText || "+0%");
  const percentBonus = (amount * channelPercent) / 100;

  let promoBonus = 0;
  const promos = Array.isArray(methodDoc?.promotions)
    ? methodDoc.promotions
    : [];
  const promo = promos.find(
    (p) =>
      String(p?.id || "").toLowerCase() === String(promoId || "").toLowerCase(),
  );

  if (promo && promoId !== "none" && promo?.isActive !== false) {
    const bonusValue = Number(promo?.bonusValue ?? 0) || 0;
    if (promo?.bonusType === "percent")
      promoBonus = (amount * bonusValue) / 100;
    else promoBonus = bonusValue;
  }

  const totalBonus = promoBonus + percentBonus;
  const turnoverMultiplier = Number(methodDoc?.turnoverMultiplier ?? 13);
  const targetTurnover = (amount + totalBonus) * turnoverMultiplier;

  return {
    channelPercent,
    percentBonus,
    promoBonus,
    totalBonus,
    turnoverMultiplier,
    targetTurnover,
  };
};

/* ------------------ USER: CREATE REQUEST ------------------ */
router.post("/deposit-requests", requireAuth, async (req, res) => {
  try {
    const {
      methodId,
      channelId,
      promoId = "none",
      amount,
      fields = {},
      display = {},
    } = req.body;

    const amt = Number(amount || 0);
    if (!methodId || !channelId || !Number.isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    // user exists + active
    const user = await User.findById(req.user.id).select("_id isActive");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isActive === false)
      return res
        .status(403)
        .json({ success: false, message: "User is not active" });

    // load method from DB (secure)
    const methodDoc = await DepositMethod.findOne({
      methodId: String(methodId),
    });
    if (!methodDoc || methodDoc?.isActive === false) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid deposit method" });
    }

    const calc = computeBonuses({ amount: amt, methodDoc, channelId, promoId });

    const doc = await DepositRequest.create({
      user: user._id,
      methodId,
      channelId,
      promoId,
      amount: amt,
      fields,
      display,

      calc: {
        channelPercent: calc.channelPercent,
        percentBonus: calc.percentBonus,
        promoBonus: calc.promoBonus,
        totalBonus: calc.totalBonus,
        turnoverMultiplier: calc.turnoverMultiplier,
        targetTurnover: calc.targetTurnover,
        creditedAmount: 0,
      },
      status: "pending",
    });

    return res.json({
      success: true,
      message: "Deposit request created",
      data: { requestId: doc._id },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: e?.message || "Server error" });
  }
});

/* ------------------ USER: MY REQUESTS ------------------ */
router.get("/deposit-requests/my", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DepositRequest.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments({ user: req.user.id }),
    ]);

    res.json({ success: true, data: items, meta: { page, limit, total } });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: e?.message || "Server error" });
  }
});

/* ------------------ ADMIN: LIST ------------------ */
router.get("/admin/deposit-requests", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim(); // pending/approved/rejected
    const q = String(req.query.q || "").trim(); // search by username/phone maybe (if you store it)

    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status))
      filter.status = status;

    // optional user search (username/phone) — requires populate + match
    let userIds = null;
    if (q) {
      const users = await User.find({
        $or: [
          { username: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      }).select("_id");
      userIds = users.map((u) => u._id);
      filter.user = {
        $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
      };
    }

    const [items, total] = await Promise.all([
      DepositRequest.find(filter)
        .populate("user", "username phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments(filter),
    ]);

    res.json({ success: true, data: items, meta: { page, limit, total } });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: e?.message || "Server error" });
  }
});

/* ------------------ ADMIN: DETAILS ------------------ */
router.get("/admin/deposit-requests/:id", requireAuth, async (req, res) => {
  try {
    const doc = await DepositRequest.findById(req.params.id)
      .populate("user", "username phone balance isActive")
      .lean();

    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: doc });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: e?.message || "Server error" });
  }
});

/* ------------------ ADMIN: APPROVE ------------------ */
router.post(
  "/admin/deposit-requests/:id/approve",
  requireAuth,
  async (req, res) => {
    const session = await mongoose.startSession();
    try {
      const adminNote = String(req.body.adminNote || "");

      await session.withTransaction(async () => {
        const doc = await DepositRequest.findById(req.params.id).session(
          session,
        );
        if (!doc) throw new Error("Not found");
        if (doc.status !== "pending") throw new Error("Already processed");

        // re-check method config + recalc to prevent tampering
        const methodDoc = await DepositMethod.findOne({
          methodId: String(doc.methodId),
        }).session(session);
        if (!methodDoc || methodDoc?.isActive === false)
          throw new Error("Invalid deposit method");

        const depositAmount = Number(doc.amount || 0);
        if (!Number.isFinite(depositAmount) || depositAmount <= 0)
          throw new Error("Invalid amount");

        const calc = computeBonuses({
          amount: depositAmount,
          methodDoc,
          channelId: doc.channelId,
          promoId: doc.promoId,
        });

        const creditedAmount = depositAmount + Number(calc.totalBonus || 0);

        // update user balance
        const user = await User.findById(doc.user).session(session);
        if (!user) throw new Error("User not found");
        if (user.isActive === false) throw new Error("User not active");

        user.balance = Number(user.balance || 0) + creditedAmount;
        await user.save({ session });

        // ✅ Affiliate deposit commission (NEW)
        // Condition: user.referredBy exists AND referred user is aff-user & active
        let affiliateCommissionInfo = null;

        if (user.referredBy) {
          const affiliator = await User.findById(user.referredBy).session(
            session,
          );

          if (
            affiliator &&
            affiliator.role === "aff-user" &&
            affiliator.isActive
          ) {
            const pct = Number(affiliator.depositCommission || 0); // percent
            if (Number.isFinite(pct) && pct > 0) {
              // ✅ Commission base = depositAmount (without bonus)
              const commissionBase = depositAmount;

              // If you want commission on bonus-included creditedAmount instead:
              // const commissionBase = creditedAmount;

              const commissionAmount = (commissionBase * pct) / 100;

              if (commissionAmount > 0) {
                affiliator.depositCommissionBalance =
                  Number(affiliator.depositCommissionBalance || 0) +
                  commissionAmount;

                await affiliator.save({ session });

                affiliateCommissionInfo = {
                  affiliatorId: String(affiliator._id),
                  affiliatorUsername: affiliator.username,
                  percent: pct,
                  baseAmount: commissionBase,
                  commissionAmount,
                };
              }
            }
          }
        }

        // update request
        doc.status = "approved";
        doc.adminNote = adminNote;
        doc.approvedBy = req.user.id;
        doc.approvedAt = new Date();

        doc.calc = {
          channelPercent: calc.channelPercent,
          percentBonus: calc.percentBonus,
          promoBonus: calc.promoBonus,
          totalBonus: calc.totalBonus,
          turnoverMultiplier: calc.turnoverMultiplier,
          targetTurnover: calc.targetTurnover,
          creditedAmount,

          // ✅ store affiliate commission info (optional but useful for audit)
          affiliateDepositCommission: affiliateCommissionInfo,
        };

        await doc.save({ session });

        // create turnover
        await TurnOver.create(
          [
            {
              user: user._id,
              depositRequest: doc._id,
              required: calc.targetTurnover,
              progress: 0,
              status: calc.targetTurnover <= 0 ? "completed" : "running",
              creditedAmount,
              completedAt: calc.targetTurnover <= 0 ? new Date() : null,
            },
          ],
          { session },
        );
      });

      res.json({ success: true, message: "Approved" });
    } catch (e) {
      res
        .status(400)
        .json({ success: false, message: e?.message || "Approve failed" });
    } finally {
      session.endSession();
    }
  },
);

/* ------------------ ADMIN: REJECT ------------------ */
router.post(
  "/admin/deposit-requests/:id/reject",
  requireAuth,
  async (req, res) => {
    try {
      const adminNote = String(req.body.adminNote || "");

      const doc = await DepositRequest.findById(req.params.id);
      if (!doc)
        return res.status(404).json({ success: false, message: "Not found" });
      if (doc.status !== "pending")
        return res
          .status(400)
          .json({ success: false, message: "Already processed" });

      doc.status = "rejected";
      doc.adminNote = adminNote;
      doc.rejectedBy = req.user.id;
      doc.rejectedAt = new Date();
      await doc.save();

      res.json({ success: true, message: "Rejected" });
    } catch (e) {
      res
        .status(500)
        .json({ success: false, message: e?.message || "Reject failed" });
    }
  },
);

export default router;
