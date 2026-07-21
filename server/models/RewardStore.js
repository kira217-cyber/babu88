// models/RewardStore.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const RewardStoreSchema = new Schema(
  {
    bannerImage: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },

      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    description: {
      bn: {
        type: String,
        default: "",
        trim: true,
      },

      en: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /**
     * Reward eligibility condition.
     */
    conditionType: {
      type: String,
      enum: ["deposit", "turnover", "game_loss"],
      required: true,
      index: true,
    },

    /**
     * campaign = নির্দিষ্ট সময়ের history
     * lifetime = user-এর সম্পূর্ণ history
     */
    calculationPeriod: {
      type: String,
      enum: ["campaign", "lifetime"],
      default: "campaign",
      required: true,
      index: true,
    },

    /**
     * Eligibility অর্জনের জন্য প্রয়োজনীয় amount.
     */
    requiredAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Claim করলে balance-এ যোগ হওয়া amount.
     */
    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Required turnover:
     * rewardAmount × turnoverMultiplier
     */
    turnoverMultiplier: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    /**
     * Campaign reward-এর সময়সীমা।
     * Lifetime reward-এর ক্ষেত্রে null থাকবে।
     */
    startAt: {
      type: Date,
      default: null,
      index: true,
    },

    endAt: {
      type: Date,
      default: null,
      index: true,
    },

    /**
     * once = একজন user একবার claim করবে।
     * repeatable = ভবিষ্যতে একাধিকবার claim করা যাবে।
     */
    claimType: {
      type: String,
      enum: ["once", "repeatable"],
      default: "once",
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   INDEXES
========================================================= */

RewardStoreSchema.index({
  status: 1,
  order: 1,
  createdAt: -1,
});

RewardStoreSchema.index({
  conditionType: 1,
  calculationPeriod: 1,
  status: 1,
});

const RewardStore = mongoose.model("RewardStore", RewardStoreSchema);

export default RewardStore;
