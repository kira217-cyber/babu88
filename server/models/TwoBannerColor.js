import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const TwoBannerColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // LEFT card
    leftCardBg: { type: String, default: "#2f2f2f", validate: [hex, "Invalid HEX"] },
    leftCardShadow: { type: String, default: "0_18px_45px_rgba(0,0,0,0.25)" },
    leftCardRadius: { type: Number, default: 16, min: 0, max: 40 },

    // LEFT overlay gradient (same linear-gradient vibe, admin controls opacity points)
    leftOverlayStart: { type: Number, default: 0.72, min: 0, max: 1 }, // rgba(0,0,0,0.72)
    leftOverlayMid: { type: Number, default: 0.35, min: 0, max: 1 },
    leftOverlayEnd: { type: Number, default: 0.08, min: 0, max: 1 },

    // LEFT text
    titleColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    titleSizeMobile: { type: Number, default: 16, min: 10, max: 40 },
    titleSizeSm: { type: Number, default: 18, min: 10, max: 50 },
    titleSizeLg: { type: Number, default: 24, min: 10, max: 60 },
    titleWeight: { type: Number, default: 800, min: 100, max: 900 },

    descColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    descOpacity: { type: Number, default: 0.85, min: 0, max: 1 },
    descSizeMobile: { type: Number, default: 12, min: 10, max: 28 },
    descSizeSm: { type: Number, default: 13, min: 10, max: 30 },
    descSizeLg: { type: Number, default: 18, min: 10, max: 40 },
    descWeight: { type: Number, default: 500, min: 100, max: 900 },

    // Button
    buttonBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    buttonText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    buttonTextSize: { type: Number, default: 14, min: 10, max: 24 },
    buttonWeight: { type: Number, default: 800, min: 100, max: 900 },
    buttonShadow: { type: String, default: "0_10px_18px_rgba(245,180,0,0.35)" },

    // Right card
    rightCardBg: { type: String, default: "#2f2f2f", validate: [hex, "Invalid HEX"] },
    rightCardShadow: { type: String, default: "0_18px_45px_rgba(0,0,0,0.25)" },
    rightCardRadius: { type: Number, default: 16, min: 0, max: 40 },

    // Right overlay (same linear-gradient 135deg vibe with opacities)
    rightOverlayA: { type: Number, default: 0.18, min: 0, max: 1 },
    rightOverlayB: { type: Number, default: 0.05, min: 0, max: 1 },
    rightOverlayC: { type: Number, default: 0.18, min: 0, max: 1 },

    // LEFT radial glow (yellow glow)
    glowColor: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    glowOpacity: { type: Number, default: 0.25, min: 0, max: 1 },
  },
  { timestamps: true },
);

export default mongoose.model("TwoBannerColor", TwoBannerColorSchema);
