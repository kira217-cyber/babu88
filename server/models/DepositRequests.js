// models/DepositRequests.js
import mongoose from "mongoose";

const DepositRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // from client
    methodId: { type: String, required: true },   // e.g. "nagad"
    channelId: { type: String, required: true },  // e.g. "agent"
    promoId: { type: String, default: "none" },

    amount: { type: Number, required: true, min: 1 },

    // store submitted fields (trxId, senderNumber etc.)
    fields: { type: Object, default: {} },

    // server verified calculation
    calc: {
      channelPercent: { type: Number, default: 0 },
      percentBonus: { type: Number, default: 0 },
      promoBonus: { type: Number, default: 0 },
      totalBonus: { type: Number, default: 0 },

      turnoverMultiplier: { type: Number, default: 13 },
      targetTurnover: { type: Number, default: 0 },

      creditedAmount: { type: Number, default: 0 }, // amount + totalBonus (set on approve)
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminNote: { type: String, default: "" },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },

    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },

    // helpful admin display (optional)
    display: { type: Object, default: {} },
  },
  { timestamps: true },
);

DepositRequestSchema.index({ createdAt: -1 });
DepositRequestSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("DepositRequest", DepositRequestSchema);