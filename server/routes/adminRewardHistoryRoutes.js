import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import RewardClaim from "../models/RewardClaim.js";

const router = express.Router();

/* ======================================================
   HELPERS
====================================================== */

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getStartOfDay = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(23, 59, 59, 999);
  return date;
};

/* ======================================================
   ADMIN: GET ALL REWARD CLAIM HISTORY
   GET /api/admin/reward-claims
====================================================== */

router.get("/admin/reward-claims", async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "").trim();

    const conditionType = String(req.query.conditionType || "").trim();

    const calculationPeriod = String(req.query.calculationPeriod || "").trim();

    const startDate = getStartOfDay(req.query.startDate);

    const endDate = getEndOfDay(req.query.endDate);

    const filter = {};

    /* ==================================================
         STATUS FILTER
      ================================================== */

    if (["processing", "claimed", "failed"].includes(status)) {
      filter.status = status;
    }

    /* ==================================================
         REWARD TYPE FILTER
      ================================================== */

    if (["deposit", "turnover", "game_loss"].includes(conditionType)) {
      filter["rewardSnapshot.conditionType"] = conditionType;
    }

    /* ==================================================
         CALCULATION PERIOD FILTER
      ================================================== */

    if (["campaign", "lifetime"].includes(calculationPeriod)) {
      filter["rewardSnapshot.calculationPeriod"] = calculationPeriod;
    }

    /* ==================================================
         DATE FILTER
      ================================================== */

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = startDate;
      }

      if (endDate) {
        filter.createdAt.$lte = endDate;
      }
    }

    /* ==================================================
         SEARCH USER + REWARD
      ================================================== */

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const matchingUsers = await User.find({
        $or: [
          {
            username: regex,
          },
          {
            phone: regex,
          },
          {
            email: regex,
          },
          {
            userId: regex,
          },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchingUsers.map((user) => user._id);

      const searchConditions = [
        {
          "rewardSnapshot.title.bn": regex,
        },
        {
          "rewardSnapshot.title.en": regex,
        },
      ];

      if (userIds.length > 0) {
        searchConditions.push({
          user: {
            $in: userIds,
          },
        });
      }

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push(
          {
            _id: new mongoose.Types.ObjectId(search),
          },
          {
            user: new mongoose.Types.ObjectId(search),
          },
          {
            reward: new mongoose.Types.ObjectId(search),
          },
        );
      }

      filter.$or = searchConditions;
    }

    /* ==================================================
         HISTORY, COUNT AND SUMMARY
      ================================================== */

    const [history, total, summaryResult] = await Promise.all([
      RewardClaim.find(filter)
        .populate("user", "username userId phone email role currency")
        .populate(
          "reward",
          "bannerImage title description conditionType calculationPeriod status",
        )
        .populate(
          "turnover",
          "required progress status creditedAmount completedAt createdAt",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      RewardClaim.countDocuments(filter),

      RewardClaim.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: null,

            totalClaims: {
              $sum: 1,
            },

            claimedAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "claimed"],
                  },
                  {
                    $ifNull: ["$rewardAmount", 0],
                  },
                  0,
                ],
              },
            },

            requiredTurnover: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "claimed"],
                  },
                  {
                    $ifNull: ["$requiredTurnover", 0],
                  },
                  0,
                ],
              },
            },

            uniqueUsers: {
              $addToSet: "$user",
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalClaims: 1,
            claimedAmount: 1,
            requiredTurnover: 1,

            uniqueUsers: {
              $size: "$uniqueUsers",
            },
          },
        },
      ]),
    ]);

    const summary = summaryResult[0] || {
      totalClaims: 0,
      claimedAmount: 0,
      requiredTurnover: 0,
      uniqueUsers: 0,
    };

    res.json({
      success: true,
      history,
      summary,

      filters: {
        search,
        status: status || "all",

        conditionType: conditionType || "all",

        calculationPeriod: calculationPeriod || "all",

        startDate: req.query.startDate || "",

        endDate: req.query.endDate || "",
      },

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),

        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Admin reward history error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
