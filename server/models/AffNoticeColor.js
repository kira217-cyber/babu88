// models/AffNoticeColor.js
import mongoose from "mongoose";

const affNoticeColorSchema = new mongoose.Schema(
  {
    // Outer wrapper
    outerBg: { type: String, default: "#2b2b2b" },

    // Notice pill
    pillBg: { type: String, default: "#f5b400" },
    pillText: { type: String, default: "#000000" },

    // Sizing / spacing
    radius: { type: Number, default: 6 }, // rounded-md
    padX: { type: Number, default: 24 },  // sm:px-6
    padY: { type: Number, default: 12 },  // sm:py-3

    // Text
    textSizeMobile: { type: Number, default: 14 }, // text-sm
    textSizeSm: { type: Number, default: 16 },     // sm:text-base
    textSizeMd: { type: Number, default: 18 },     // md:text-lg
    fontWeight: { type: Number, default: 700 },    // bold

    // Animation
    speedSecDefault: { type: Number, default: 16 }, // fallback if content has no speed
  },
  { timestamps: true },
);

export default mongoose.model("AffNoticeColor", affNoticeColorSchema);
