import mongoose from "mongoose";

const autoDepositTokenSchema = new mongoose.Schema(
  {
    businessToken: { type: String, default: "" }, // X-Opay-Business-Token
    active: { type: Boolean, default: false },

    // ✅ NEW: min/max amount
    minAmount: { type: Number, default: 5 },
    maxAmount: { type: Number, default: 500000 },
  },
  { timestamps: true }
);

export default mongoose.model("AutoDepositToken", autoDepositTokenSchema);