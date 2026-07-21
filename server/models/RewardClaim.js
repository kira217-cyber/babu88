import mongoose from "mongoose";

const { Schema } = mongoose;

const RewardClaimSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reward: {
      type: Schema.Types.ObjectId,
      ref: "RewardStore",
      required: true,
      index: true,
    },

    /**
     * once reward-এর জন্য value হবে "once"।
     * Repeatable reward-এর জন্য daily/weekly/monthly cycle key হবে।
     */
    claimKey: {
      type: String,
      required: true,
      default: "once",
      trim: true,
    },

    /**
     * Claim-এর সময় reward information snapshot।
     * Admin পরে reward edit করলেও পুরোনো history বদলাবে না।
     */
    rewardSnapshot: {
      bannerImage: {
        type: String,
        default: "",
      },

      title: {
        bn: {
          type: String,
          default: "",
        },
        en: {
          type: String,
          default: "",
        },
      },

      conditionType: {
        type: String,
        enum: ["deposit", "turnover", "game_loss"],
        required: true,
      },

      calculationPeriod: {
        type: String,
        enum: ["campaign", "lifetime"],
        required: true,
      },

      requiredAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      rewardAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      turnoverMultiplier: {
        type: Number,
        required: true,
        min: 0,
      },

      startAt: {
        type: Date,
        default: null,
      },

      endAt: {
        type: Date,
        default: null,
      },
    },

    /**
     * Claim করার সময় user-এর eligibility result।
     */
    achievedAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    requiredAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      required: true,
      min: 0,
    },

    requiredTurnover: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    balanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },

    /**
     * Claim থেকে তৈরি TurnOver document।
     */
    turnover: {
      type: Schema.Types.ObjectId,
      ref: "TurnOver",
      default: null,
    },

    status: {
      type: String,
      enum: ["processing", "claimed", "failed"],
      default: "processing",
      required: true,
      index: true,
    },

    failureReason: {
      type: String,
      default: "",
      trim: true,
    },

    claimedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * একজন user একই reward এবং একই claim cycle-এ
 * একবারের বেশি claim করতে পারবে না।
 */
RewardClaimSchema.index(
  {
    user: 1,
    reward: 1,
    claimKey: 1,
  },
  {
    unique: true,
  },
);

RewardClaimSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

RewardClaimSchema.index({
  reward: 1,
  status: 1,
  createdAt: -1,
});

RewardClaimSchema.index({
  "rewardSnapshot.conditionType": 1,
  claimedAt: -1,
});

const RewardClaim = mongoose.model("RewardClaim", RewardClaimSchema);

export default RewardClaim;
