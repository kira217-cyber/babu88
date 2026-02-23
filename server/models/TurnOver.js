// models/TurnOver.js
import mongoose from "mongoose";

const TurnOverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ NEW: source info (deposit বা redeem)
    sourceType: {
      type: String,
      enum: ["deposit", "redeem"],
      required: true,
      index: true,
    },

    // ✅ NEW: source reference (DepositRequest/_id অথবা RedeemHistory/_id)
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    required: { type: Number, required: true, min: 0 }, // targetTurnover (1x হলে amount)
    progress: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
      index: true,
    },

    creditedAmount: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ✅ Prevent duplicate turnover for same source
TurnOverSchema.index({ user: 1, sourceType: 1, sourceId: 1 }, { unique: true });
TurnOverSchema.index({ user: 1, status: 1 });

export default mongoose.model("TurnOver", TurnOverSchema);