import mongoose from "mongoose";
import User from "../models/User.js";
import AutoDeposit from "../models/AutoDeposit.js";
import DepositRequest from "../models/DepositRequests.js";
import GameHistory from "../models/GameHistory.js";
import RewardClaim from "../models/RewardClaim.js";

const { ObjectId } = mongoose.Types;

/* =========================================================
   HELPERS
========================================================= */

const toSafeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const getSumFromAggregate = (result = []) => {
  return toSafeNumber(result?.[0]?.total || 0);
};

/**
 * Campaign হলে date range return করবে।
 * Lifetime হলে null return করবে।
 */
export const getRewardDateRange = (reward) => {
  if (reward?.calculationPeriod === "lifetime") {
    return null;
  }

  if (!reward?.startAt || !reward?.endAt) {
    throw new Error(
      "Campaign reward requires both startAt and endAt.",
    );
  }

  const startAt = new Date(reward.startAt);
  const endAt = new Date(reward.endAt);

  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime())
  ) {
    throw new Error("Invalid reward campaign date.");
  }

  if (endAt <= startAt) {
    throw new Error(
      "Campaign endAt must be later than startAt.",
    );
  }

  return {
    startAt,
    endAt,
  };
};

const createDateFilter = (dateRange, field = "createdAt") => {
  if (!dateRange) return {};

  return {
    [field]: {
      $gte: dateRange.startAt,
      $lte: dateRange.endAt,
    },
  };
};

/* =========================================================
   DEPOSIT ELIGIBILITY
========================================================= */

export const calculateDepositEligibility = async ({
  user,
  reward,
  session = null,
}) => {
  const dateRange = getRewardDateRange(reward);

  /**
   * Manual deposit campaign calculation approvedAt দিয়ে হবে।
   */
  const manualMatch = {
    user: user._id,
    status: "approved",
    ...createDateFilter(dateRange, "approvedAt"),
  };

  /**
   * AutoDeposit-এ user ObjectId নেই।
   * তাই possible user identity values দিয়ে match করা হচ্ছে।
   */
  const autoUserIdentities = [
    String(user._id),
    user.username,
    user.phone,
    user.email,
    user.userId,
  ].filter(Boolean);

  /**
   * Auto deposit campaign calculation paidAt দিয়ে হবে।
   */
  const autoMatch = {
    userIdentity: {
      $in: autoUserIdentities,
    },
    status: "PAID",
    balanceAdded: true,
    ...createDateFilter(dateRange, "paidAt"),
  };

  let manualQuery = DepositRequest.aggregate([
    {
      $match: manualMatch,
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $ifNull: ["$amount", 0],
          },
        },
      },
    },
  ]);

  let autoQuery = AutoDeposit.aggregate([
    {
      $match: autoMatch,
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $cond: [
              {
                $gt: [
                  {
                    $ifNull: ["$calc.depositAmount", 0],
                  },
                  0,
                ],
              },
              "$calc.depositAmount",
              {
                $ifNull: ["$amount", 0],
              },
            ],
          },
        },
      },
    },
  ]);

  if (session) {
    manualQuery = manualQuery.session(session);
    autoQuery = autoQuery.session(session);
  }

  const [manualResult, autoResult] = await Promise.all([
    manualQuery,
    autoQuery,
  ]);

  const manualDeposit = getSumFromAggregate(manualResult);
  const autoDeposit = getSumFromAggregate(autoResult);

  return {
    achievedAmount: manualDeposit + autoDeposit,

    breakdown: {
      manualDeposit,
      autoDeposit,
    },
  };
};

/* =========================================================
   TURNOVER ELIGIBILITY
========================================================= */

/**
 * Campaign turnover নির্ভুলভাবে হিসাব করার জন্য GameHistory-এর
 * valid settled wager ব্যবহার করা হচ্ছে।
 *
 * Oracle game: bet_amount
 * NineWicket: settled matchStake
 * NineWicket Open callback হিসাব হবে না।
 */
export const calculateTurnoverEligibility = async ({
  user,
  reward,
  session = null,
}) => {
  const dateRange = getRewardDateRange(reward);

  const match = {
    user: user._id,

    ...createDateFilter(dateRange, "createdAt"),

    $nor: [
      {
        provider: "ninewicket",
        nineWicketBetStatus: {
          $regex: /^open$/i,
        },
      },
    ],
  };

  let query = GameHistory.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,

        total: {
          $sum: {
            $cond: [
              {
                $eq: ["$provider", "ninewicket"],
              },

              {
                $cond: [
                  {
                    $regexMatch: {
                      input: {
                        $ifNull: [
                          "$nineWicketBetStatus",
                          "",
                        ],
                      },
                      regex: /^settled$/i,
                    },
                  },
                  {
                    $ifNull: ["$matchStake", 0],
                  },
                  0,
                ],
              },

              {
                $ifNull: ["$bet_amount", 0],
              },
            ],
          },
        },
      },
    },
  ]);

  if (session) {
    query = query.session(session);
  }

  const result = await query;

  return {
    achievedAmount: getSumFromAggregate(result),

    breakdown: {
      validTurnover: getSumFromAggregate(result),
    },
  };
};

/* =========================================================
   GAME LOSS ELIGIBILITY
========================================================= */

/**
 * Oracle loss:
 * bet_amount - win_amount
 *
 * NineWicket loss:
 * negative profitLoss-এর absolute value
 *
 * শুধু settled NineWicket result হিসাব হবে।
 */
export const calculateGameLossEligibility = async ({
  user,
  reward,
  session = null,
}) => {
  const dateRange = getRewardDateRange(reward);

  const match = {
    user: user._id,
    resultType: "loss",
    ...createDateFilter(dateRange, "createdAt"),

    $or: [
      {
        provider: {
          $ne: "ninewicket",
        },
      },
      {
        provider: "ninewicket",
        nineWicketBetStatus: {
          $regex: /^settled$/i,
        },
      },
    ],
  };

  let query = GameHistory.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,

        total: {
          $sum: {
            $cond: [
              {
                $eq: ["$provider", "ninewicket"],
              },

              {
                $cond: [
                  {
                    $lt: [
                      {
                        $ifNull: ["$profitLoss", 0],
                      },
                      0,
                    ],
                  },
                  {
                    $abs: {
                      $ifNull: ["$profitLoss", 0],
                    },
                  },
                  0,
                ],
              },

              {
                $max: [
                  {
                    $subtract: [
                      {
                        $ifNull: ["$bet_amount", 0],
                      },
                      {
                        $ifNull: ["$win_amount", 0],
                      },
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    },
  ]);

  if (session) {
    query = query.session(session);
  }

  const result = await query;

  return {
    achievedAmount: getSumFromAggregate(result),

    breakdown: {
      gameLoss: getSumFromAggregate(result),
    },
  };
};

/* =========================================================
   MAIN ELIGIBILITY FUNCTION
========================================================= */

export const calculateRewardEligibility = async ({
  userId,
  reward,
  claimKey = "once",
  session = null,
}) => {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid user id.");
  }

  if (!reward) {
    throw new Error("Reward is required.");
  }

  const userQuery = User.findById(userId).select(
    "_id username phone email userId isActive",
  );

  if (session) {
    userQuery.session(session);
  }

  const user = await userQuery;

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive.");
  }

  const now = new Date();

  const campaignNotStarted =
    reward.calculationPeriod === "campaign" &&
    reward.startAt &&
    now < new Date(reward.startAt);

  const campaignExpired =
    reward.calculationPeriod === "campaign" &&
    reward.endAt &&
    now > new Date(reward.endAt);

  let calculationResult;

  switch (reward.conditionType) {
    case "deposit":
      calculationResult =
        await calculateDepositEligibility({
          user,
          reward,
          session,
        });
      break;

    case "turnover":
      calculationResult =
        await calculateTurnoverEligibility({
          user,
          reward,
          session,
        });
      break;

    case "game_loss":
      calculationResult =
        await calculateGameLossEligibility({
          user,
          reward,
          session,
        });
      break;

    default:
      throw new Error(
        `Unsupported reward condition: ${reward.conditionType}`,
      );
  }

  const achievedAmount = toSafeNumber(
    calculationResult.achievedAmount,
  );

  const requiredAmount = toSafeNumber(
    reward.requiredAmount,
  );

  const remainingAmount = Math.max(
    requiredAmount - achievedAmount,
    0,
  );

  const progressPercent =
    requiredAmount <= 0
      ? 100
      : Math.min(
          (achievedAmount / requiredAmount) * 100,
          100,
        );

  let claimedQuery = RewardClaim.exists({
    user: user._id,
    reward: reward._id,
    claimKey,
    status: {
      $in: ["processing", "claimed"],
    },
  });

  if (session) {
    claimedQuery = claimedQuery.session(session);
  }

  const existingClaim = await claimedQuery;
  const alreadyClaimed = Boolean(existingClaim);

  const rewardActive = reward.status === "active";

  const eligible =
    rewardActive &&
    !campaignNotStarted &&
    !campaignExpired &&
    !alreadyClaimed &&
    achievedAmount >= requiredAmount;

  let unavailableReason = "";

  if (!rewardActive) {
    unavailableReason = "REWARD_INACTIVE";
  } else if (campaignNotStarted) {
    unavailableReason = "CAMPAIGN_NOT_STARTED";
  } else if (campaignExpired) {
    unavailableReason = "CAMPAIGN_EXPIRED";
  } else if (alreadyClaimed) {
    unavailableReason = "ALREADY_CLAIMED";
  } else if (achievedAmount < requiredAmount) {
    unavailableReason = "REQUIREMENT_NOT_COMPLETED";
  }

  return {
    eligible,
    alreadyClaimed,
    unavailableReason,

    conditionType: reward.conditionType,
    calculationPeriod: reward.calculationPeriod,

    requiredAmount,
    achievedAmount,
    remainingAmount,

    progressPercent: Number(
      progressPercent.toFixed(2),
    ),

    breakdown: calculationResult.breakdown || {},

    campaign: {
      startAt: reward.startAt || null,
      endAt: reward.endAt || null,
      notStarted: Boolean(campaignNotStarted),
      expired: Boolean(campaignExpired),
    },

    rewardAmount: toSafeNumber(
      reward.rewardAmount,
    ),

    turnoverMultiplier: toSafeNumber(
      reward.turnoverMultiplier,
    ),

    requiredTurnover:
      toSafeNumber(reward.rewardAmount) *
      toSafeNumber(reward.turnoverMultiplier),
  };
};

export default calculateRewardEligibility;