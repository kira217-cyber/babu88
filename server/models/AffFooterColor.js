// models/AffFooterColor.js
import mongoose from "mongoose";

const affFooterColorSchema = new mongoose.Schema(
  {
    // WRAPPER
    footerBg: { type: String, default: "#000000" },
    footerText: { type: String, default: "#ffffff" },

    // LINES
    dashedLineColor: { type: String, default: "rgba(255,255,255,0.30)" },

    // TEXT COLORS
    titleColor: { type: String, default: "#ffffff" },
    bodyTextColor: { type: String, default: "rgba(255,255,255,0.80)" },

    // FONT SIZES (px)
    titleSize: { type: Number, default: 18 }, // sm:text-lg
    bodySize: { type: Number, default: 15 }, // sm:text-[15px]
    copyrightSize: { type: Number, default: 14 },

    // LOGO BOX (when no logo)
    emptyLogoBg: { type: String, default: "rgba(255,255,255,0.05)" },
    emptyLogoBorder: { type: String, default: "rgba(255,255,255,0.10)" },
    emptyLogoText: { type: String, default: "rgba(255,255,255,0.60)" },

    // PARTNER/PAYMENT IMAGES
    imageOpacity: { type: Number, default: 0.8 }, // 0-1
    imageGrayScale: { type: Boolean, default: true },

    // SOCIAL ICON
    socialBg: { type: String, default: "rgba(255,255,255,0.10)" },
    socialHoverBg: { type: String, default: "#ffffff" },
    socialIconColor: { type: String, default: "#ffffff" },
    socialHoverIconColor: { type: String, default: "#000000" },
    socialSize: { type: Number, default: 40 }, // w-10 h-10

    // RADIUS
    socialRadius: { type: Number, default: 9999 }, // rounded-full
  },
  { timestamps: true },
);

export default mongoose.model("AffFooterColor", affFooterColorSchema);
