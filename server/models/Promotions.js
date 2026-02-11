// Server Side: models/Promotions.js
import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["cricket", "fast", "sports", "livecasino", "slots", "table", "vip", "crash", "tournament"],
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    shortDesc: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    details: {
      bn: {
        heading: { type: String, required: true },
        periodLabel: { type: String, required: true },
        period: { type: String, required: true },
        body: [{ type: String }],
      },
      en: {
        heading: { type: String, required: true },
        periodLabel: { type: String, required: true },
        period: { type: String, required: true },
        body: [{ type: String }],
      },
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;