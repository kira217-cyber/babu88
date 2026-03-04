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
    key: { type: String, required: true },
    label: { type: TextBiSchema, default: () => ({}) },
    placeholder: { type: TextBiSchema, default: () => ({}) },
    type: { type: String, enum: ["text", "number", "tel"], default: "text" },
    required: { type: Boolean, default: true },
    minLength: { type: Number, default: 0 },
    maxLength: { type: Number, default: 0 },
  },
  { _id: false },
);

const ChannelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: TextBiSchema, default: () => ({}) },
    tagText: { type: String, default: "+0%" },
    bonusTitle: { type: TextBiSchema, default: () => ({}) },
    bonusPercent: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

// ✅ Promotions per Method
const PromotionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, lowercase: true },
    name: { type: TextBiSchema, default: () => ({}) },
    bonusType: { type: String, enum: ["percent", "fixed"], default: "fixed" },
    bonusValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { _id: false },
);

// ✅ NEW: Multiple label+number (BN/EN label)
const DepositContactSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" }, // optional internal id (client-side)
    label: { type: TextBiSchema, default: () => ({}) }, // bn/en
    number: { type: String, default: "" }, // e.g. 013xxxxxxxx
    isActive: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { _id: false },
);

const MethodDetailsSchema = new mongoose.Schema(
  {
    // ✅ NEW
    contacts: { type: [DepositContactSchema], default: [] },

    // ✅ LEGACY (keep to avoid breaking old DB data)
    agentNumber: { type: String, default: "" },
    personalNumber: { type: String, default: "" },

    instructions: { type: TextBiSchema, default: () => ({}) },
    inputs: { type: [DepositInputSchema], default: [] },
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
      lowercase: true,
    },
    methodName: { type: TextBiSchema, default: () => ({}) },
    logoUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // ✅ Min/Max deposit amount
    minDepositAmount: { type: Number, default: 0 },
    maxDepositAmount: { type: Number, default: 0 },

    turnoverMultiplier: { type: Number, default: 1 },
    baseBonusTitle: { type: TextBiSchema, default: () => ({}) },
    baseBonusPercent: { type: Number, default: 0 },

    channels: { type: [ChannelSchema], default: [] },
    promotions: { type: [PromotionSchema], default: [] },

    details: { type: MethodDetailsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model("DepositMethod", DepositMethodsSchema);
