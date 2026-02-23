// models/RedeemSettings.js
import mongoose from "mongoose";

const RedeemSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    minAmount: { type: Number, default: 100, min: 0 },
    maxAmount: { type: Number, default: 0, min: 0 }, // 0 => no limit
  },
  { timestamps: true },
);

export default mongoose.model("RedeemSettings", RedeemSettingsSchema);