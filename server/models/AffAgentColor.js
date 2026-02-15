// models/AffAgentColor.js
import mongoose from "mongoose";

const affAgentColorSchema = new mongoose.Schema(
  {
    // Section
    sectionBg: { type: String, default: "#2b2b2b" },
    sectionText: { type: String, default: "#ffffff" },
    sectionPadY: { type: Number, default: 56 }, // py-14 = 56px (approx)

    // Title
    titleColor: { type: String, default: "#ffffff" },
    titleSize: { type: Number, default: 32 }, // sm:text-3xl
    titleMarginBottom: { type: Number, default: 40 }, // mb-10

    // Left text
    paraColor: { type: String, default: "rgba(255,255,255,0.95)" },
    paraSize: { type: Number, default: 16 },

    // List icon (check box)
    checkBg: { type: String, default: "#22c55e" }, // green-500
    checkIcon: { type: String, default: "#ffffff" },
    checkRadius: { type: Number, default: 2 }, // rounded-sm

    // List text
    listTextColor: { type: String, default: "#ffffff" },
    listTextSize: { type: Number, default: 16 },

    // Right card
    cardBg: { type: String, default: "#f5b400" },
    cardBorder: { type: String, default: "rgba(0,0,0,0.10)" },
    cardRadius: { type: Number, default: 8 }, // rounded-lg
    cardShadow: { type: String, default: "0 8px 20px rgba(0,0,0,0.45)" },

    // Percent
    percentColor: { type: String, default: "#000000" },
    percentSize: { type: Number, default: 72 }, // sm:text-[72px]

    // Strip text
    stripColor: { type: String, default: "#ffffff" },
    stripSize: { type: Number, default: 24 }, // sm:text-2xl

    // Button
    btnBg: { type: String, default: "#000000" },
    btnHoverBg: { type: String, default: "#1f1f1f" },
    btnText: { type: String, default: "#ffffff" },
    btnTextSize: { type: Number, default: 16 },
    btnRadius: { type: Number, default: 6 }, // rounded-md
  },
  { timestamps: true },
);

export default mongoose.model("AffAgentColor", affAgentColorSchema);
