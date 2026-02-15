import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const DownloadBannerColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // section bg
    sectionBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },

    // title
    titleColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    titleSizeMobile: { type: Number, default: 22, min: 10, max: 60 },
    titleSizeSm: { type: Number, default: 28, min: 10, max: 70 },
    titleSizeLg: { type: Number, default: 34, min: 10, max: 90 },
    titleWeight: { type: Number, default: 800, min: 100, max: 900 },

    // subtitle
    subColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    subOpacity: { type: Number, default: 0.6, min: 0, max: 1 },
    subSizeMobile: { type: Number, default: 14, min: 10, max: 30 },
    subSizeSm: { type: Number, default: 16, min: 10, max: 34 },
    subWeight: { type: Number, default: 600, min: 100, max: 900 },

    // download button (yellow)
    downloadBtnBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    downloadBtnText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    downloadBtnHeight: { type: Number, default: 48, min: 30, max: 80 },
    downloadBtnRadius: { type: Number, default: 12, min: 0, max: 40 },
    downloadBtnTextSize: { type: Number, default: 14, min: 10, max: 26 },
    downloadBtnWeight: { type: Number, default: 800, min: 100, max: 900 },
    downloadBtnShadow: { type: String, default: "0_8px_18px_rgba(245,180,0,0.35)" },

    // android button (white)
    androidBtnBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    androidBtnText: { type: String, default: "#6ac259", validate: [hex, "Invalid HEX"] },
    androidBtnBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    androidBtnBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    androidBtnHeight: { type: Number, default: 48, min: 30, max: 80 },
    androidBtnRadius: { type: Number, default: 12, min: 0, max: 40 },
    androidBtnTextSize: { type: Number, default: 14, min: 10, max: 26 },
    androidBtnWeight: { type: Number, default: 800, min: 100, max: 900 },
    androidBtnShadow: { type: String, default: "0_10px_25px_rgba(0,0,0,0.08)" },

    // right radial bg (same vibe)
    rightRadialOpacity: { type: Number, default: 0.06, min: 0, max: 1 },
  },
  { timestamps: true },
);

export default mongoose.model("DownloadBannerColor", DownloadBannerColorSchema);
