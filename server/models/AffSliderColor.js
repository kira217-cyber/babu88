// models/AffSliderColor.js
import mongoose from "mongoose";

const affSliderColorSchema = new mongoose.Schema(
  {
    // Section
    sectionBg: { type: String, default: "#2b2b2b" },
    padYMobile: { type: Number, default: 8 }, // py-2 ~ 8px
    padYMd: { type: Number, default: 24 }, // md:py-6 ~ 24px

    // Frame
    frameRadius: { type: Number, default: 2 }, // rounded-sm
    frameBorderColor: { type: String, default: "rgba(42,166,166,0.60)" },
    frameBorderWidth: { type: Number, default: 1 },
    frameBg: { type: String, default: "rgba(255,255,255,0.05)" },

    // Heights
    hMobile: { type: Number, default: 120 },
    hSm: { type: Number, default: 260 },
    hMd: { type: Number, default: 320 },

    // Swiper pagination
    paginationBottom: { type: Number, default: 10 },
    bulletW: { type: Number, default: 4 },
    bulletH: { type: Number, default: 4 },
    bulletOpacity: { type: Number, default: 0.6 },
    bulletActiveOpacity: { type: Number, default: 1 },

    // Navigation arrows
    navColor: { type: String, default: "#ffffff" },
    navBox: { type: Number, default: 24 }, // width/height
    navIconSize: { type: Number, default: 12 },
    navFontWeight: { type: Number, default: 700 },

    // Responsive
    hideNavBelow: { type: Number, default: 360 }, // max-width px => hide arrows
  },
  { timestamps: true },
);

export default mongoose.model("AffSliderColor", affSliderColorSchema);
