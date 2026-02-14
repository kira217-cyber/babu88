import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const LiveGamesColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Card
    cardBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    cardBorder: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    cardBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Top bar
    topBarBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    titleText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    titleTextSize: { type: Number, default: 12, min: 8, max: 30 },

    // Date time
    datetimeText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    datetimeOpacity: { type: Number, default: 0.55, min: 0, max: 1 },
    datetimeTextSize: { type: Number, default: 12, min: 8, max: 30 },

    // Teams row
    teamNameText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    teamNameTextSize: { type: Number, default: 13, min: 8, max: 30 },

    scoreText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    scoreTextSize: { type: Number, default: 13, min: 8, max: 30 },

    dashText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    dashOpacity: { type: Number, default: 0.3, min: 0, max: 1 },
    dashTextSize: { type: Number, default: 12, min: 8, max: 30 },

    // Status badge
    badgeUpcomingBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    badgeUpcomingText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },

    badgeLiveBg: { type: String, default: "#ff2d2d", validate: [hex, "Invalid HEX"] },
    badgeLiveText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },

    badgeTextSize: { type: Number, default: 10, min: 8, max: 24 },

    // Scrollbar
    scrollbarTrack: { type: String, default: "#cfcfcf", validate: [hex, "Invalid HEX"] },
    scrollbarThumbFrom: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    scrollbarThumbTo: { type: String, default: "#c78a00", validate: [hex, "Invalid HEX"] },
    scrollbarHoverFrom: { type: String, default: "#ffcf3a", validate: [hex, "Invalid HEX"] },
    scrollbarHoverTo: { type: String, default: "#c78a00", validate: [hex, "Invalid HEX"] },
  },
  { timestamps: true }
);

export default mongoose.model("LiveGamesColor", LiveGamesColorSchema);
