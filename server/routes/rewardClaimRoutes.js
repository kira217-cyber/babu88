// routes/rewardClientRoutes.js

import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import RewardStore from "../models/RewardStore.js";
import RewardClaim from "../models/RewardClaim.js";
import TurnOver from "../models/TurnOver.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { calculateRewardEligibility } from "../services/rewardEligibilityService.js";

const router = express.Router();

/* ======================================================
   HELPERS
====================================================== */

const money = (value = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number * 100) / 100;
};

const createRouteError = (message, statusCode = 400, extra = {}) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  Object.assign(error, extra);

  return error;
};

const getEligibilityMessage = (reason) => {
  const messages = {
    REWARD_INACTIVE: "This reward is inactive",

    CAMPAIGN_NOT_STARTED: "This reward campaign has not started yet",

    CAMPAIGN_EXPIRED: "This reward campaign has expired",

    ALREADY_CLAIMED: "You have already claimed this reward",

    REQUIREMENT_NOT_COMPLETED: "You have not completed the reward requirement",
  };

  return messages[reason] || "You are not eligible for this reward";
};

/* ======================================================
   GET CLIENT REWARDS WITH ELIGIBILITY
   GET /api/rewards
====================================================== */

router.get("/rewards", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const rewards = await RewardStore.find({
      status: "active",
    })
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    const rewardsWithEligibility = await Promise.all(
      rewards.map(async (reward) => {
        try {
          const eligibility = await calculateRewardEligibility({
            userId,
            reward,
            claimKey: "once",
          });

          return {
            ...reward,
            eligibility,
          };
        } catch (error) {
          return {
            ...reward,

            eligibility: {
              eligible: false,
              alreadyClaimed: false,

              unavailableReason: "ELIGIBILITY_CALCULATION_FAILED",

              requiredAmount: Number(reward.requiredAmount || 0),

              achievedAmount: 0,

              remainingAmount: Number(reward.requiredAmount || 0),

              progressPercent: 0,

              rewardAmount: Number(reward.rewardAmount || 0),

              turnoverMultiplier: Number(reward.turnoverMultiplier || 0),

              requiredTurnover:
                Number(reward.rewardAmount || 0) *
                Number(reward.turnoverMultiplier || 0),

              error: error.message,
            },
          };
        }
      }),
    );

    return res.json({
      success: true,
      rewards: rewardsWithEligibility,
    });
  } catch (error) {
    console.error("Get client rewards error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* ======================================================
   GET SINGLE REWARD WITH ELIGIBILITY
   GET /api/rewards/:id
====================================================== */

router.get("/rewards/:id", requireAuth, async (req, res) => {
  try {
    const rewardId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward id",
      });
    }

    const reward = await RewardStore.findById(rewardId).lean();

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    const eligibility = await calculateRewardEligibility({
      userId: req.user.id,
      reward,
      claimKey: "once",
    });

    return res.json({
      success: true,

      reward: {
        ...reward,
        eligibility,
      },
    });
  } catch (error) {
    console.error("Get single reward error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,

      message: error.message || "Server error",
    });
  }
});

/* ======================================================
   CLAIM REWARD WITHOUT MONGODB TRANSACTION

   POST /api/rewards/:id/claim
====================================================== */

router.post("/rewards/:id/claim", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const rewardId = req.params.id;

  let rewardClaim = null;
  let turnover = null;

  let balanceCredited = false;
  let creditedRewardAmount = 0;

  try {
    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      throw createRouteError("Invalid reward id", 400);
    }

    /* =========================
         REWARD VALIDATION
      ========================= */

    const reward = await RewardStore.findById(rewardId);

    if (!reward) {
      throw createRouteError("Reward not found", 404);
    }

    if (reward.status !== "active") {
      throw createRouteError("This reward is currently inactive", 400);
    }

    if (reward.claimType !== "once") {
      throw createRouteError(
        "Repeatable reward claiming is not available yet",
        400,
      );
    }

    const claimKey = "once";

    /* =========================
         ELIGIBILITY CHECK
      ========================= */

    const eligibility = await calculateRewardEligibility({
      userId,
      reward,
      claimKey,
    });

    if (eligibility.alreadyClaimed) {
      throw createRouteError("You have already claimed this reward", 409);
    }

    if (!eligibility.eligible) {
      throw createRouteError(
        getEligibilityMessage(eligibility.unavailableReason),
        400,
        {
          eligibility,
        },
      );
    }

    /* =========================
         USER VALIDATION
      ========================= */

    const user = await User.findById(userId);

    if (!user) {
      throw createRouteError("User not found", 404);
    }

    if (!user.isActive) {
      throw createRouteError("User account is inactive", 403);
    }

    const rewardAmount = money(reward.rewardAmount);

    const turnoverMultiplier = money(reward.turnoverMultiplier);

    const requiredTurnover = money(rewardAmount * turnoverMultiplier);

    creditedRewardAmount = rewardAmount;

    /*
     * Preliminary balance values।
     * Atomic balance update-এর পরে
     * সঠিক value দিয়ে update হবে।
     */
    const preliminaryBalanceBefore = money(user.balance);

    const preliminaryBalanceAfter = money(
      preliminaryBalanceBefore + rewardAmount,
    );

    /* =========================
         CLAIM RESERVATION

         RewardClaim model-এর unique
         index একই reward double claim
         আটকাবে।
      ========================= */

    try {
      rewardClaim = await RewardClaim.create({
        user: user._id,
        reward: reward._id,
        claimKey,

        rewardSnapshot: {
          bannerImage: reward.bannerImage || "",

          title: {
            bn: reward.title?.bn || "",

            en: reward.title?.en || "",
          },

          conditionType: reward.conditionType,

          calculationPeriod: reward.calculationPeriod,

          requiredAmount: money(reward.requiredAmount),

          rewardAmount,

          turnoverMultiplier,

          startAt: reward.startAt || null,

          endAt: reward.endAt || null,
        },

        achievedAmount: money(eligibility.achievedAmount),

        requiredAmount: money(eligibility.requiredAmount),

        rewardAmount,
        turnoverMultiplier,
        requiredTurnover,

        balanceBefore: preliminaryBalanceBefore,

        balanceAfter: preliminaryBalanceAfter,

        turnover: null,

        status: "processing",
        claimedAt: null,
      });
    } catch (claimError) {
      if (claimError?.code === 11000) {
        throw createRouteError("You have already claimed this reward", 409);
      }

      throw claimError;
    }

    /* =========================
         ATOMIC BALANCE CREDIT
      ========================= */

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,
      },
      {
        $inc: {
          balance: rewardAmount,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedUser) {
      throw createRouteError("Failed to update user balance", 500);
    }

    balanceCredited = true;

    const balanceAfter = money(updatedUser.balance);

    /*
     * Concurrent balance changes হলেও
     * এই claim-এর সঠিক before value।
     */
    const balanceBefore = money(balanceAfter - rewardAmount);

    /* =========================
         CREATE TURNOVER
      ========================= */

    turnover = await TurnOver.create({
      user: user._id,

      sourceType: "redeem",

      sourceId: rewardClaim._id,

      required: requiredTurnover,

      progress: 0,

      status: requiredTurnover > 0 ? "running" : "completed",

      creditedAmount: rewardAmount,

      completedAt: requiredTurnover > 0 ? null : new Date(),
    });

    /* =========================
         COMPLETE CLAIM
      ========================= */

    rewardClaim.turnover = turnover._id;

    rewardClaim.status = "claimed";

    rewardClaim.claimedAt = new Date();

    rewardClaim.balanceBefore = balanceBefore;

    rewardClaim.balanceAfter = balanceAfter;

    await rewardClaim.save();

    return res.status(201).json({
      success: true,

      message: "Reward claimed successfully",

      rewardClaim,
      turnover,

      balance: {
        before: balanceBefore,

        added: rewardAmount,

        after: balanceAfter,
      },

      eligibility,

      turnoverDetails: {
        multiplier: turnoverMultiplier,

        required: requiredTurnover,

        progress: 0,

        status: requiredTurnover > 0 ? "running" : "completed",
      },
    });
  } catch (error) {
    console.error("Reward claim error:", error);

    /* ==================================================
         COMPENSATING ROLLBACK

         Standalone MongoDB transaction support করে না।
         তাই কোনো step fail হলে আগের changes
         manually rollback করা হচ্ছে।
      ================================================== */

    let rollbackSuccessful = true;

    /*
     * TurnOver তৈরি হয়ে থাকলে delete।
     */
    if (turnover?._id) {
      try {
        await TurnOver.deleteOne({
          _id: turnover._id,
        });
      } catch (turnoverRollbackError) {
        rollbackSuccessful = false;

        console.error("Turnover rollback failed:", turnoverRollbackError);
      }
    }

    /*
     * Balance credit হয়ে থাকলে
     * reward amount ফেরত কাটা হবে।
     */
    if (balanceCredited && creditedRewardAmount > 0) {
      try {
        const rollbackUser = await User.findByIdAndUpdate(
          userId,
          {
            $inc: {
              balance: -creditedRewardAmount,
            },
          },
          {
            returnDocument: "after",
          },
        );

        if (!rollbackUser) {
          rollbackSuccessful = false;
        }
      } catch (balanceRollbackError) {
        rollbackSuccessful = false;

        console.error("Balance rollback failed:", balanceRollbackError);
      }
    }

    /*
     * সব rollback সফল হলে processing
     * Claim delete হবে, যাতে user পরে
     * আবার চেষ্টা করতে পারে।
     */
    if (rewardClaim?._id) {
      try {
        if (rollbackSuccessful) {
          await RewardClaim.deleteOne({
            _id: rewardClaim._id,

            status: "processing",
          });
        } else {
          await RewardClaim.findByIdAndUpdate(
            rewardClaim._id,
            {
              status: "failed",
              claimedAt: null,
            },
            {
              returnDocument: "after",
            },
          );
        }
      } catch (claimRollbackError) {
        console.error("RewardClaim rollback failed:", claimRollbackError);
      }
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,

        message: "You have already claimed this reward",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,

      message: error.message || "Failed to claim reward",

      ...(error.eligibility
        ? {
            eligibility: error.eligibility,
          }
        : {}),

      ...(!rollbackSuccessful
        ? {
            requiresManualReview: true,

            rollbackMessage:
              "Some claim changes could not be rolled back automatically",
          }
        : {}),
    });
  }
});

/* ======================================================
   MY REWARD CLAIM HISTORY
   GET /api/rewards/my/history
====================================================== */

router.get("/rewards/my/history", requireAuth, async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    if (["processing", "claimed", "failed"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [history, total] = await Promise.all([
      RewardClaim.find(filter)
        .populate("reward", "bannerImage title conditionType calculationPeriod")
        .populate(
          "turnover",
          "required progress status creditedAmount completedAt",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      RewardClaim.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      history,

      pagination: {
        page,
        limit,
        total,

        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Get reward history error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
