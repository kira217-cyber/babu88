// models/AffWithdrawMethod.js
import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },

    label: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },

    placeholder: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    type: {
      type: String,
      enum: ["text", "number", "tel", "email"],
      default: "text",
    },

    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const AffWithdrawMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },

    logoUrl: { type: String, default: "" },

    // ✅ Min/Max withdraw amount
    minimumWithdrawAmount: { type: Number, default: 0 },
    maximumWithdrawAmount: { type: Number, default: 0 },

    fields: { type: [FieldSchema], default: [] },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const AffWithdrawMethod =
  mongoose.models.AffWithdrawMethod ||
  mongoose.model("AffWithdrawMethod", AffWithdrawMethodSchema);

export default AffWithdrawMethod;