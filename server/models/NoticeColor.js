import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const NoticeColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // container
    containerBg: {
      type: String,
      default: "#3c3c3c",
      validate: [hex, "Invalid HEX"],
    },
    borderColor: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    borderOpacity: { type: Number, default: 0.2, min: 0, max: 1 },
    radiusPx: { type: Number, default: 6, min: 0, max: 30 },

    // text + separator
    textColor: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    textOpacity: { type: Number, default: 0.92, min: 0, max: 1 },
    textWeight: { type: Number, default: 800, min: 100, max: 900 },
    textSizeMobile: { type: Number, default: 14, min: 10, max: 22 },
    textSizeSm: { type: Number, default: 14, min: 10, max: 22 },
    textSizeLg: { type: Number, default: 14, min: 10, max: 22 },

    sepColor: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    sepOpacity: { type: Number, default: 0.35, min: 0, max: 1 },
    sepWeight: { type: Number, default: 900, min: 100, max: 900 },

    // spacing + speed
    gapMobile: { type: Number, default: 18, min: 0, max: 60 },
    gapSm: { type: Number, default: 22, min: 0, max: 60 },
    durationSec: { type: Number, default: 30, min: 5, max: 120 },
  },
  { timestamps: true },
);

export default mongoose.model("NoticeColor", NoticeColorSchema);
