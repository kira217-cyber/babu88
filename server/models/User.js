// models/User.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },

    // ❗ email unique না (তুমি যেমন চাইছো)
    email: { type: String, default: "" },

    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "aff-user", "admin"],
      default: "user",
      index: true,
    },

    // ✅ aff-user: admin approve না হওয়া পর্যন্ত false রাখা হবে
    // ✅ normal user: default true (তোমার routes এ সেট করছো)
    isActive: { type: Boolean, default: true },

    currency: { type: String, enum: ["BDT", "USDT"], default: "BDT" },
    balance: { type: Number, default: 0 },

    /**
     * ✅ IMPORTANT:
     * তুমি এখন চাইছো: "সব user এরই referralCode generate হবে"
     * তাই referralCode আর "affiliate only" না — both user & aff-user will have it
     *
     * - unique: true => collision prevent
     * - sparse: true => null থাকলে duplicate error দিবে না (admin বা legacy docs)
     * - uppercase + trim => consistent storage
     */
    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    // ✅ affiliate created users list (works for any role, but used by aff-user)
    createdUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],

    // commissions (affiliate)
    gameLossCommission: { type: Number, default: 0 },
    depositCommission: { type: Number, default: 0 },
    referCommission: { type: Number, default: 0 },
    gameWinCommission: { type: Number, default: 0 },

    gameLossCommissionBalance: { type: Number, default: 0 },
    depositCommissionBalance: { type: Number, default: 0 },
    referCommissionBalance: { type: Number, default: 0 },
    gameWinCommissionBalance: { type: Number, default: 0 },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    // ✅ referral দিয়ে register করলে: কে refer করলো (affiliate user id)
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

/**
 * ✅ Indexes
 * - username unique
 * - phone unique
 * - referralCode unique + sparse (null allowed)
 */
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

// ✅ sparse রাখলে null/undefined referralCode index এ ignore হবে
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

// optional helpful indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referredBy: 1 });

const User = mongoose.model("User", userSchema);
export default User;
