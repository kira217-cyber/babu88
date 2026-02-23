// models/RedeemHistory.js
import mongoose from "mongoose";

const RedeemHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true, min: 0 },

    // snapshots
    referralWalletBefore: { type: Number, default: 0 },
    referralWalletAfter: { type: Number, default: 0 },

    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
      index: true,
    },

    note: { type: String, default: "" },
  },
  { timestamps: true },
);

RedeemHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("RedeemHistory", RedeemHistorySchema);