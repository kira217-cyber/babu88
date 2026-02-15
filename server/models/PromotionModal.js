import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const PromotionModalSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // ===== Content =====
    titleBn: { type: String, default: "Important Announcement" },
    titleEn: { type: String, default: "Important Announcement" },

    // uploaded image path (eg: /uploads/xxx.jpg) or full url
    imageUrl: { type: String, default: "" },

    // route or external url
    navigateTo: { type: String, default: "/promotion" },

    // show rules
    storageKey: { type: String, default: "promotion_modal_last_shown_v1" },
    showOncePerMs: { type: Number, default: 24 * 60 * 60 * 1000 }, // 1 day
    // (you were using ONE_DAY_MS=0; admin can set 0 to show always)

    // ===== Styles =====
    backdropColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    backdropOpacity: { type: Number, default: 0.55, min: 0, max: 1 },

    modalBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    modalRadiusPx: { type: Number, default: 6, min: 0, max: 40 },
    modalShadow: { type: String, default: "0_20px_60px_rgba(0,0,0,0.35)" },

    headerBg: { type: String, default: "#4a4a4a", validate: [hex, "Invalid HEX"] },
    headerHeightPx: { type: Number, default: 44, min: 30, max: 90 },

    titleColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    titleSizePx: { type: Number, default: 14, min: 10, max: 30 },
    titleWeight: { type: Number, default: 800, min: 100, max: 900 },
    titleLetterSpacing: { type: Number, default: 0.02, min: 0, max: 0.2 }, // em

    closeBtnBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    closeBtnBgOpacity: { type: Number, default: 0.15, min: 0, max: 1 },
    closeIconColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    closeIconSizePx: { type: Number, default: 18, min: 12, max: 36 },

    bodyPaddingPx: { type: Number, default: 12, min: 0, max: 40 },

    imageBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    imageBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    imageRadiusPx: { type: Number, default: 6, min: 0, max: 40 },

    maxWidthPx: { type: Number, default: 420, min: 280, max: 900 },
  },
  { timestamps: true },
);

export default mongoose.model("PromotionModal", PromotionModalSchema);
