// models/AffWithdrawRequest.js
import mongoose from "mongoose";

const AffWithdrawRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    methodId: { type: String, required: true }, // e.g. NAGAD/BKASH
    amount: { type: Number, required: true, min: 0 },

    fields: { type: mongoose.Schema.Types.Mixed, default: {} },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },

    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    adminNote: { type: String, default: "" },

    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

AffWithdrawRequestSchema.index({ affiliate: 1, createdAt: -1 });
AffWithdrawRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("AffWithdrawRequest", AffWithdrawRequestSchema);
