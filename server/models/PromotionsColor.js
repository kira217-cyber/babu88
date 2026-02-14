import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const PromotionsColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Page
    pageBg: { type: String, default: "#f4f5f7", validate: [hex, "Invalid HEX"] },
    titleText: { type: String, default: "#0f172a", validate: [hex, "Invalid HEX"] },

    // Desktop chips wrapper
    chipsWrapBg: { type: String, default: "#f1f1f1", validate: [hex, "Invalid HEX"] },

    // Desktop chips
    chipActiveBg: { type: String, default: "#f6c400", validate: [hex, "Invalid HEX"] },
    chipActiveText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    chipActiveShadowRgba: { type: String, default: "rgba(246,196,0,0.25)" },

    chipInactiveBg: { type: String, default: "transparent" },
    chipInactiveText: { type: String, default: "#111827", validate: [hex, "Invalid HEX"] },
    chipInactiveHoverBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    chipInactiveHoverOpacity: { type: Number, default: 0.7, min: 0, max: 1 },

    chipTextSize: { type: Number, default: 14, min: 10, max: 22 },

    // Mobile dropdown button
    mobileBtnBg: { type: String, default: "#0b74ff", validate: [hex, "Invalid HEX"] },
    mobileBtnText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    mobileBtnShadowRgba: { type: String, default: "rgba(11,116,255,0.22)" },

    // Mobile dropdown panel
    mobileDropBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    mobileDropBorder: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobileDropBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    mobileItemActiveBg: { type: String, default: "#f6c400", validate: [hex, "Invalid HEX"] },
    mobileItemActiveText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobileItemBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    mobileItemText: { type: String, default: "#111827", validate: [hex, "Invalid HEX"] },
    mobileItemHoverBg: { type: String, default: "#f4f5f7", validate: [hex, "Invalid HEX"] },

    // Cards area
    cardBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    cardBorder: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    cardBorderOpacity: { type: Number, default: 0.05, min: 0, max: 1 },

    imgWrapBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    imgWrapOpacity: { type: Number, default: 0.05, min: 0, max: 1 },

    promoTitleText: { type: String, default: "#0f172a", validate: [hex, "Invalid HEX"] },
    promoDescText: { type: String, default: "#475569", validate: [hex, "Invalid HEX"] },
    promoDescTextSize: { type: Number, default: 14, min: 10, max: 20 },

    // "More details" button
    moreBtnBg: { type: String, default: "#0b74ff", validate: [hex, "Invalid HEX"] },
    moreBtnHoverBg: { type: String, default: "#0a66e0", validate: [hex, "Invalid HEX"] },
    moreBtnText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    moreBtnTextSize: { type: Number, default: 14, min: 10, max: 20 },

    // Empty / Loading boxes
    boxBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    boxBorder: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    boxBorderOpacity: { type: Number, default: 0.05, min: 0, max: 1 },

    emptyTitleText: { type: String, default: "#0f172a", validate: [hex, "Invalid HEX"] },
    emptyDescText: { type: String, default: "#475569", validate: [hex, "Invalid HEX"] },

    loadingText: { type: String, default: "#0f172a", validate: [hex, "Invalid HEX"] },

    // Modal
    modalOverlayOpacity: { type: Number, default: 0.45, min: 0, max: 1 },
    modalPanelBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },

    modalCloseBg: { type: String, default: "#f6c400", validate: [hex, "Invalid HEX"] },
    modalCloseIcon: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    modalHeadingText: { type: String, default: "#111827", validate: [hex, "Invalid HEX"] },
    modalBodyText: { type: String, default: "#111827", validate: [hex, "Invalid HEX"] },
    modalBodyTextSize: { type: Number, default: 13, min: 10, max: 20 },
  },
  { timestamps: true }
);

export default mongoose.model("PromotionsColor", PromotionsColorSchema);
