import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const HotGamesColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Section
    titleColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    titleSize: { type: Number, default: 28, min: 14, max: 60 },
    titleWeight: { type: Number, default: 800, min: 100, max: 900 },

    // Card
    cardBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] }, // used as bg with opacity in client
    cardBgOpacity: { type: Number, default: 0.05, min: 0, max: 1 },
    cardRadius: { type: Number, default: 12, min: 0, max: 40 },
    cardShadow: {
      type: String,
      default: "0_10px_25px_rgba(0,0,0,0.12)",
    },

    // Image hover scale
    imgHoverScale: { type: Number, default: 1.04, min: 1, max: 1.2 },

    // Overlay (hover)
    overlayBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    overlayOpacity: { type: Number, default: 0.25, min: 0, max: 1 },

    // PLAY pill
    playPillBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    playPillBgOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    playPillBorder: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    playPillBorderOpacity: { type: Number, default: 0.25, min: 0, max: 1 },
    playTextColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    playTextSize: { type: Number, default: 14, min: 10, max: 24 },
    playTextWeight: { type: Number, default: 800, min: 100, max: 900 },

    // HOT badge
    hotBg: { type: String, default: "#ff3b30", validate: [hex, "Invalid HEX"] },
    hotText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    hotTextSize: { type: Number, default: 10, min: 8, max: 16 },
    hotWeight: { type: Number, default: 800, min: 100, max: 900 },

    // Title under image
    gameTitleBg: { type: String, default: "#fbbf24", validate: [hex, "Invalid HEX"] }, // amber-300
    gameTitleText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    gameTitleSize: { type: Number, default: 15, min: 10, max: 22 },
    gameTitleWeight: { type: Number, default: 800, min: 100, max: 900 },

    // Provider text
    providerText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    providerOpacity: { type: Number, default: 0.6, min: 0, max: 1 },
    providerSize: { type: Number, default: 11, min: 8, max: 18 },
    providerWeight: { type: Number, default: 800, min: 100, max: 900 },
  },
  { timestamps: true }
);

export default mongoose.model("HotGamesColor", HotGamesColorSchema);
