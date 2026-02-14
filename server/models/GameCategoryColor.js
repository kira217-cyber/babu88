import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const GameCategoryColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Category wrapper
    wrapBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    wrapOpacity: { type: Number, default: 0.9, min: 0, max: 1 },

    scrollerBg: { type: String, default: "#F5F5F5", validate: [hex, "Invalid HEX"] },

    // Category buttons
    btnActiveBg: { type: String, default: "#F5B400", validate: [hex, "Invalid HEX"] },
    btnActiveText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    btnInactiveBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    btnInactiveText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    btnInactiveTextOpacity: { type: Number, default: 0.8, min: 0, max: 1 },

    btnTextSize: { type: Number, default: 14, min: 10, max: 24 },

    // Track + Thumb
    trackBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    trackOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    thumbBg: { type: String, default: "#C49A00", validate: [hex, "Invalid HEX"] },

    // Empty state text
    emptyText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    emptyTextOpacity: { type: Number, default: 0.6, min: 0, max: 1 },
    emptyTextSize: { type: Number, default: 14, min: 10, max: 26 },

    // Game card
    cardBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    cardBgOpacity: { type: Number, default: 0.05, min: 0, max: 1 },

    cardRing: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    cardRingOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Badge in card
    badgeBg: { type: String, default: "#ff2d2d", validate: [hex, "Invalid HEX"] },
    badgeText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    badgeTextSize: { type: Number, default: 10, min: 8, max: 20 },
  },
  { timestamps: true }
);

export default mongoose.model("GameCategoryColor", GameCategoryColorSchema);
