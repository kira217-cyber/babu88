// models/AffWhyUsColor.js
import mongoose from "mongoose";

const affWhyUsColorSchema = new mongoose.Schema(
  {
    // Section
    sectionBg: { type: String, default: "#2b2b2b" },
    sectionPadY: { type: Number, default: 56 }, // py-14 approx
    containerMax: { type: Number, default: 1280 }, // max-w-7xl ~ 1280px (optional)

    // Title
    titleColor: { type: String, default: "#ffffff" },
    titleSize: { type: Number, default: 32 }, // sm:text-3xl
    titleMarginBottom: { type: Number, default: 40 }, // mb-10

    // White Card
    cardBg: { type: String, default: "#ffffff" },
    cardBorder: { type: String, default: "rgba(0,0,0,0.10)" },
    cardRadius: { type: Number, default: 6 }, // rounded-md
    cardShadow: { type: String, default: "0 10px 25px rgba(0,0,0,0.25)" },

    // Card padding
    cardPadX: { type: Number, default: 40 }, // sm:px-10 (approx)
    cardPadY: { type: Number, default: 40 }, // sm:py-10 (approx)

    // Grid gap
    gridGap: { type: Number, default: 40 }, // lg:gap-10

    // Icon circle
    iconCircleBg: { type: String, default: "#f5b400" },
    iconCircleSize: { type: Number, default: 96 }, // w-24 h-24
    iconOverlay: { type: String, default: "rgba(0,0,0,0.10)" }, // bg-black/10
    iconColor: { type: String, default: "#ffffff" },
    iconSize: { type: Number, default: 42 },

    // Item title
    itemTitleColor: { type: String, default: "#000000" },
    itemTitleSize: { type: Number, default: 18 },
    itemTitleMarginBottom: { type: Number, default: 12 },

    // Item desc
    descColor: { type: String, default: "rgba(0,0,0,0.80)" },
    descSize: { type: Number, default: 14 },
    descLineHeight: { type: Number, default: 1.6 },
  },
  { timestamps: true },
);

export default mongoose.model("AffWhyUsColor", affWhyUsColorSchema);
