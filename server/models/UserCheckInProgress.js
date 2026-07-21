import mongoose from "mongoose";

const { Schema } = mongoose;

const UserCheckInProgressSchema = new Schema(
  {
    /**
     * প্রত্যেক user-এর জন্য একটি progress document।
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    setting: {
      type: Schema.Types.ObjectId,
      ref: "CheckInRewardSetting",
      required: true,
      index: true,
    },

    /**
     * Admin setting পরিবর্তন করলে progress-এর
     * settingVersion মিলিয়ে প্রয়োজন হলে Day 1 হবে।
     */
    settingVersion: {
      type: Number,
      default: 1,
      min: 1,
    },

    /**
     * User এখন কোন Day claim করতে পারবে।
     */
    nextDayNumber: {
      type: Number,
      default: 1,
      min: 1,
      max: 7,
    },

    /**
     * সর্বশেষ কোন Day claim করেছে।
     */
    lastClaimedDayNumber: {
      type: Number,
      default: 0,
      min: 0,
      max: 7,
    },

    /**
     * সর্বশেষ claim-এর সময়।
     */
    lastClaimAt: {
      type: Date,
      default: null,
    },

    /**
     * পরবর্তী claim করার সময়।
     * lastClaimAt থেকে 24 ঘণ্টা পর।
     */
    nextClaimAt: {
      type: Date,
      default: null,
      index: true,
    },

    /**
     * Day 7 শেষ করে মোট কয়টি cycle complete করেছে।
     */
    completedCycles: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * সর্বশেষ claim information।
     * এটি history নয়, শুধু latest claim state।
     */
    lastRewardType: {
      type: String,
      enum: ["", "balance", "reward_coin"],
      default: "",
    },

    lastRewardAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

UserCheckInProgressSchema.index({
  user: 1,
  setting: 1,
});

UserCheckInProgressSchema.index({
  setting: 1,
  nextClaimAt: 1,
});

const UserCheckInProgress = mongoose.model(
  "UserCheckInProgress",
  UserCheckInProgressSchema,
);

export default UserCheckInProgress;
