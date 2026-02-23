import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";


const router = express.Router();

const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

const fmt = (d) => {
  // YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};


/**
 * ✅ GET my referred users (pagination + search + status filter)
 * GET /api/affiliate/my-refers?page=1&limit=10&q=username&status=active|inactive|all
 */
router.get("/my-refers", requireAuth,  async (req, res) => {
  try {
    const affiliateId = req.user?.id;

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "all").trim().toLowerCase(); // all|active|inactive

    const filter = {
      referredBy: new mongoose.Types.ObjectId(affiliateId),
      role: "user", // ✅ normal users only (চাইলে এটা বাদ দিতে পারো)
    };

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (q) {
      // username search
      filter.username = { $regex: q, $options: "i" };
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("username phone balance isActive currency createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("affiliate my-refers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ Toggle active/inactive for a referred user
 * PATCH /api/affiliate/my-refers/:userId/active
 * body: { isActive: true/false }
 */
router.patch(
  "/my-refers/:userId/active",
  requireAuth,
  async (req, res) => {
    try {
      const affiliateId = req.user?.id;
      const { userId } = req.params;

      const isActive = !!req.body?.isActive;

      // ✅ security: only if this user is referred by this affiliate
      const user = await User.findOne({
        _id: userId,
        referredBy: affiliateId,
        role: "user",
      });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found in your referrals" });
      }

      user.isActive = isActive;
      await user.save();

      res.json({
        success: true,
        message: "Status updated",
        data: {
          _id: user._id,
          isActive: user.isActive,
        },
      });
    } catch (err) {
      console.error("affiliate toggle refer user error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

/**
 * ✅ Affiliate Commissions Summary (Logged-in affiliate user)
 * GET /api/affiliate/commissions/me
 */
router.get("/commissions/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    const u = await User.findById(userId)
      .select(
        "currency " +
          "gameLossCommission depositCommission referCommission gameWinCommission " +
          "gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance " +
          "username phone",
      )
      .lean();

    if (!u) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        userId: u._id,
        username: u.username,
        phone: u.phone,
        currency: u.currency || "BDT",

        gameLossCommission: Number(u.gameLossCommission || 0),
        depositCommission: Number(u.depositCommission || 0),
        referCommission: Number(u.referCommission || 0),
        gameWinCommission: Number(u.gameWinCommission || 0),

        gameLossCommissionBalance: Number(u.gameLossCommissionBalance || 0),
        depositCommissionBalance: Number(u.depositCommissionBalance || 0),
        referCommissionBalance: Number(u.referCommissionBalance || 0),
        gameWinCommissionBalance: Number(u.gameWinCommissionBalance || 0),
      },
    });
  } catch (err) {
    console.error("affiliate commissions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




/**
 * ✅ AFFILIATE DASHBOARD
 * GET /api/affiliate/dashboard/me
 *
 * Returns:
 *  - referralCode, referralLink helper
 *  - totalReferrals
 *  - activeReferrals
 *  - totalCommissionEarned (sum of all commission balances)
 *  - thisMonthNewReferrals
 *  - recentReferrals (last 5)
 *  - commissions (rates + balances)
 */
router.get("/dashboard/me", requireAuth, async (req, res) => {
  try {
    const affiliateId = req.user.id;

    const affiliate = await User.findById(affiliateId)
      .select(
        "username phone currency referralCode referralCount createdUsers " +
          "gameLossCommission depositCommission referCommission gameWinCommission " +
          "gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance",
      )
      .lean();

    if (!affiliate) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const createdUsersIds = Array.isArray(affiliate.createdUsers)
      ? affiliate.createdUsers
      : [];

    // ✅ total referrals (prefer referralCount, fallback createdUsers length)
    const totalReferrals =
      Number.isFinite(Number(affiliate.referralCount)) && affiliate.referralCount >= 0
        ? Number(affiliate.referralCount)
        : createdUsersIds.length;

    // ✅ active referrals count
    let activeReferrals = 0;
    if (createdUsersIds.length) {
      activeReferrals = await User.countDocuments({
        _id: { $in: createdUsersIds },
        isActive: true,
      });
    }

    // ✅ this month new referrals
    const monthStart = startOfMonth(new Date());
    let thisMonthNewReferrals = 0;
    if (createdUsersIds.length) {
      thisMonthNewReferrals = await User.countDocuments({
        _id: { $in: createdUsersIds },
        createdAt: { $gte: monthStart },
      });
    }

    // ✅ recent referrals list (last 5)
    let recentReferrals = [];
    if (createdUsersIds.length) {
      recentReferrals = await User.find({ _id: { $in: createdUsersIds } })
        .select("username phone balance currency isActive createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    }

    const currency = affiliate.currency || "BDT";

    // ✅ total commission earned wallet sum
    const totalCommissionEarned =
      Number(affiliate.gameLossCommissionBalance || 0) +
      Number(affiliate.depositCommissionBalance || 0) +
      Number(affiliate.referCommissionBalance || 0) 


    /**
     * ✅ This Month Earnings (Option A)
     * তোমার DB তে commission history নেই, তাই
     * এই মাসে "new referrals * referCommission" একটা approximation হিসাবে দেখানো হচ্ছে।
     *
     * Option B: যদি তুমি commission history collection রাখো (recommended),
     * তাহলে ওই history থেকে month sum করা যাবে।
     */
    const thisMonthEarningsApprox =
      thisMonthNewReferrals * Number(affiliate.referCommission || 0);

    res.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate._id,
          username: affiliate.username,
          phone: affiliate.phone,
          currency,
          referralCode: affiliate.referralCode || "",
        },
        stats: {
          totalReferrals,
          activeReferrals,
          totalCommissionEarned,
          thisMonthNewReferrals,
          // ✅ approximation (replace later with history sum)
          thisMonthEarnings: thisMonthEarningsApprox,
        },
        recentReferrals,
        commissions: {
          gameLossCommission: Number(affiliate.gameLossCommission || 0),
          depositCommission: Number(affiliate.depositCommission || 0),
          referCommission: Number(affiliate.referCommission || 0),
          gameWinCommission: Number(affiliate.gameWinCommission || 0),

          gameLossCommissionBalance: Number(affiliate.gameLossCommissionBalance || 0),
          depositCommissionBalance: Number(affiliate.depositCommissionBalance || 0),
          referCommissionBalance: Number(affiliate.referCommissionBalance || 0),
          gameWinCommissionBalance: Number(affiliate.gameWinCommissionBalance || 0),
        },
      },
    });
  } catch (err) {
    console.error("affiliate dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ AFFILIATE EARNINGS CHART
 * GET /api/affiliate/dashboard/earnings?days=30
 *
 * Returns daily referrals count + daily earnings(approx) + cumulative earnings.
 */
router.get("/dashboard/earnings", requireAuth, async (req, res) => {
  try {
    const affiliateId = req.user.id;
    const days = Math.min(Math.max(parseInt(req.query.days || "30", 10), 7), 120);

    const affiliate = await User.findById(affiliateId)
      .select("createdUsers referCommission currency")
      .lean();

    if (!affiliate) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const createdUsersIds = Array.isArray(affiliate.createdUsers)
      ? affiliate.createdUsers
      : [];

    const perReferral = Number(affiliate.referCommission || 0);
    const currency = affiliate.currency || "BDT";

    // build date range
    const today = startOfDay(new Date());
    const from = addDays(today, -(days - 1)); // inclusive
    const to = addDays(today, 1); // exclusive

    // If no referrals, still return empty chart with days labels
    const labels = [];
    const refCounts = [];
    const dailyEarnings = [];
    const cumulative = [];

    // prefill map with 0
    const dayMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = addDays(from, i);
      const key = fmt(d);
      dayMap.set(key, 0);
    }

    if (createdUsersIds.length) {
      // count referred users created each day
      const rows = await User.aggregate([
        { $match: { _id: { $in: createdUsersIds }, createdAt: { $gte: from, $lt: to } } },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      for (const r of rows) {
        const key = `${r._id.y}-${String(r._id.m).padStart(2, "0")}-${String(r._id.d).padStart(2, "0")}`;
        if (dayMap.has(key)) dayMap.set(key, r.count);
      }
    }

    let run = 0;
    for (let i = 0; i < days; i++) {
      const d = addDays(from, i);
      const key = fmt(d);
      const c = Number(dayMap.get(key) || 0);
      const e = c * perReferral;

      labels.push(key);
      refCounts.push(c);
      dailyEarnings.push(e);

      run += e;
      cumulative.push(run);
    }

    res.json({
      success: true,
      data: {
        currency,
        perReferral,
        days,
        labels,
        referrals: refCounts,
        dailyEarnings,
        cumulativeEarnings: cumulative,
      },
    });
  } catch (err) {
    console.error("affiliate earnings chart error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;