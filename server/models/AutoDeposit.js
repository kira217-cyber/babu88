import mongoose from "mongoose";

const autoDepositSchema = new mongoose.Schema(
  {
    userIdentity: { type: String, required: true }, // user _id as string
    amount: { type: Number, required: true },
    invoiceNumber: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    checkoutItems: { type: Object, default: {} },

    // webhook response
    transactionId: { type: String, default: "" },
    sessionCode: { type: String, default: "" },
    bank: { type: String, default: "" },
    footprint: { type: String, default: "" },
    paidAt: { type: Date },

    // ✅ idempotency safety (optional but useful)
    balanceAdded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("AutoDeposit", autoDepositSchema);