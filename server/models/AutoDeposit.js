import mongoose from "mongoose";

const { Schema } = mongoose;

const autoDepositSchema = new Schema(
  {
    userIdentity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },

    checkoutItems: {
      type: Object,
      default: {},
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    sessionCode: {
      type: String,
      default: "",
      trim: true,
    },

    bank: {
      type: String,
      default: "",
      trim: true,
    },

    footprint: {
      type: String,
      default: "",
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    balanceAdded: {
      type: Boolean,
      default: false,
      index: true,
    },

    selectedBonus: {
      bonusId: {
        type: String,
        default: "",
      },
      title: {
        bn: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      bonusType: {
        type: String,
        enum: ["fixed", "percent", ""],
        default: "",
      },
      bonusValue: {
        type: Number,
        default: 0,
      },
      bonusAmount: {
        type: Number,
        default: 0,
      },
      turnoverMultiplier: {
        type: Number,
        default: 1,
      },
    },

    calc: {
      depositAmount: { type: Number, default: 0 },
      bonusAmount: { type: Number, default: 0 },
      creditedAmount: { type: Number, default: 0 },
      turnoverMultiplier: { type: Number, default: 1 },
      targetTurnover: { type: Number, default: 0 },

      affiliateDepositCommission: {
        affiliatorId: { type: String, default: "" },
        affiliatorUserId: { type: String, default: "" },
        percent: { type: Number, default: 0 },
        baseAmount: { type: Number, default: 0 },
        commissionAmount: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true },
);

autoDepositSchema.index({ userIdentity: 1, createdAt: -1 });
autoDepositSchema.index({ invoiceNumber: 1, status: 1 });

export default mongoose.model("AutoDeposit", autoDepositSchema);
