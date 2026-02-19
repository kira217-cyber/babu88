// models/User.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ✅ Per-user Referral Tier Override Schema
 * - Admin panel থেকে add/update/delete করা হবে
 * - amount: per referral fixed amount (BDT/USDT যেটা user.currency)
 * - from/to inclusive range (1..10, 11..30 etc)
 */
const ReferralTierSchema = new Schema(
  {
    from: { type: Number, required: true, min: 1 },
    to: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 }, // per referral payout
    label: { type: String, default: "" }, // optional UI label
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

/**
 * ✅ Optional: Tier stats store (UI helper)
 */
const ReferralTierStatSchema = new Schema(
  {
    from: { type: Number, required: true, min: 1 },
    to: { type: Number, required: true, min: 1 },
    count: { type: Number, default: 0, min: 0 },
    earned: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },

    // ❗ email unique না
    email: { type: String, default: "" },

    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "aff-user", "admin"],
      default: "user",
      index: true,
    },

    isActive: { type: Boolean, default: true },

    currency: { type: String, enum: ["BDT", "USDT"], default: "BDT" },
    balance: { type: Number, default: 0 },

    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    // ✅ referral relations
    createdUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ referral counter (race-safe)
    referralCount: { type: Number, default: 0, min: 0 },

    // ✅ per-user override tiers (only for normal user)
    referralTierOverride: {
      type: [ReferralTierSchema],
      default: null, // null => use default tiers
    },

    // ✅ optional stats (UI helper)
    referralTierStats: {
      type: [ReferralTierStatSchema],
      default: [],
    },

    // commissions (affiliate + other)
    gameLossCommission: { type: Number, default: 0 },
    depositCommission: { type: Number, default: 0 },
    referCommission: { type: Number, default: 0 }, // ✅ affiliate fixed payout per referral
    gameWinCommission: { type: Number, default: 0 },

    gameLossCommissionBalance: { type: Number, default: 0 },
    depositCommissionBalance: { type: Number, default: 0 },
    referCommissionBalance: { type: Number, default: 0 }, // ✅ referral earning wallet
    gameWinCommissionBalance: { type: Number, default: 0 },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
  },
  { timestamps: true },
);

/**
 * ✅ Indexes
 */
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referredBy: 1 });

const User = mongoose.model("User", userSchema);
export default User;
