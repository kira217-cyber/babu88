import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const HotGamesColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default Hot Games Theme", trim: true },
    isActive: { type: Boolean, default: true, index: true },

    titleColor: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    titleSize: { type: Number, default: 28, min: 14, max: 60 },
    titleWeight: { type: Number, default: 800, min: 100, max: 900 },

    cardBg: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    cardBgOpacity: { type: Number, default: 0.05, min: 0, max: 1 },
    cardRadius: { type: Number, default: 12, min: 0, max: 50 },
    cardShadow: { type: String, default: "0_10px_25px_rgba(0,0,0,0.12)" },

    // ✅ NEW: game card border admin control
    cardBorderColor: {
      type: String,
      default: "#4B03DF",
      validate: [hex, "Invalid HEX"],
    },
    cardBorderWidth: { type: Number, default: 3, min: 0, max: 10 },

    imgHoverScale: { type: Number, default: 1.04, min: 1, max: 1.3 },

    overlayBg: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    overlayOpacity: { type: Number, default: 0.25, min: 0, max: 1 },

    playPillBg: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    playPillBgOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    playPillBorder: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    playPillBorderOpacity: { type: Number, default: 0.25, min: 0, max: 1 },
    playTextColor: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    playTextSize: { type: Number, default: 14, min: 10, max: 24 },
    playTextWeight: { type: Number, default: 800, min: 100, max: 900 },

    hotBg: { type: String, default: "#ff3b30", validate: [hex, "Invalid HEX"] },
    hotText: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    hotTextSize: { type: Number, default: 10, min: 8, max: 16 },
    hotWeight: { type: Number, default: 800, min: 100, max: 900 },

    gameTitleBg: {
      type: String,
      default: "#fbbf24",
      validate: [hex, "Invalid HEX"],
    },
    gameTitleText: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    gameTitleSize: { type: Number, default: 15, min: 10, max: 22 },
    gameTitleWeight: { type: Number, default: 800, min: 100, max: 900 },

    // ✅ UPDATED: provider bar full admin control
    providerBg: {
      type: String,
      default: "#4B03DF",
      validate: [hex, "Invalid HEX"],
    },
    providerBgOpacity: { type: Number, default: 1, min: 0, max: 1 },
    providerText: {
      type: String,
      default: "#ffffff",
      validate: [hex, "Invalid HEX"],
    },
    providerOpacity: { type: Number, default: 1, min: 0, max: 1 },
    providerSize: { type: Number, default: 11, min: 8, max: 18 },
    providerWeight: { type: Number, default: 800, min: 100, max: 900 },
  },
  { timestamps: true },
);

export default mongoose.model("HotGamesColor", HotGamesColorSchema);
