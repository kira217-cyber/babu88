// models/GameCategory.js

import mongoose from "mongoose";

const LangTextSchema = new mongoose.Schema(
  { bn: { type: String, default: "" }, en: { type: String, default: "" } },
  { _id: false },
);

const GameCategorySchema = new mongoose.Schema(
  {
    categoryName: { type: LangTextSchema, required: true },
    categoryTitle: { type: LangTextSchema, required: true },
    bannerImage: { type: String, default: "" }, // large banner
    iconImage: { type: String, default: "" }, // small icon / logo

    order: { type: Number, default: 0, min: 0, index: true },

    // ─── NEW FIELD ───────────────────────────────────────
    jackpot: {
      type: Boolean,
      default: false,
      index: true, // useful if you'll filter/query by jackpot categories often
    },
    // ──────────────────────────────────────────────────────

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export default mongoose.model("GameCategory", GameCategorySchema);
