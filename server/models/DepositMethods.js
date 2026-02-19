// models/DepositMethods.js
import mongoose from "mongoose";

const TextBiSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false },
);

const DepositInputSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // e.g. "senderNumber", "trxId"
    label: { type: TextBiSchema, default: () => ({}) },
    placeholder: { type: TextBiSchema, default: () => ({}) },
    type: {
      type: String,
      enum: ["text", "number", "tel"],
      default: "text",
    },
    required: { type: Boolean, default: true },
    minLength: { type: Number, default: 0 },
    maxLength: { type: Number, default: 0 },
  },
  { _id: false },
);

const ChannelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // "zappay", "dpay"
    name: { type: TextBiSchema, default: () => ({}) }, // bn/en
    tagText: { type: String, default: "+0%" }, // "+3%"
    bonusTitle: { type: TextBiSchema, default: () => ({}) }, // bn/en
    bonusPercent: { type: Number, default: 0 }, // 3
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const MethodDetailsSchema = new mongoose.Schema(
  {
    agentNumber: { type: String, default: "" }, // agent number
    personalNumber: { type: String, default: "" }, // personal/merchant
    instructions: { type: TextBiSchema, default: () => ({}) }, // bn/en
    inputs: { type: [DepositInputSchema], default: [] }, // dynamic fields
  },
  { _id: false },
);

const DepositMethodsSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // "bkash", "nagad"
    },
    methodName: { type: TextBiSchema, default: () => ({}) }, // bn/en
    logoUrl: { type: String, default: "" }, // "/uploads/.."
    isActive: { type: Boolean, default: true },

    turnoverMultiplier: { type: Number, default: 1 }, // e.g. 1x
    baseBonusTitle: { type: TextBiSchema, default: () => ({}) }, // bn/en (optional)
    baseBonusPercent: { type: Number, default: 0 }, // optional

    channels: { type: [ChannelSchema], default: [] },
    details: { type: MethodDetailsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model("DepositMethod", DepositMethodsSchema);
