import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const RegisterConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // ====== Images (uploads or full url) ======
    mobileBannerUrl: { type: String, default: "" },  // /uploads/xxx.jpg OR https://..
    desktopBannerUrl: { type: String, default: "" }, // /uploads/xxx.jpg OR https://..

    // ====== MOBILE styles ======
    mobTopbarBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobTopbarTextColor: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    mobTopbarTextSizePx: { type: Number, default: 16, min: 10, max: 28 },

    mobPrimaryBtnBg: { type: String, default: "#0a63c8", validate: [hex, "Invalid HEX"] },
    mobPrimaryBtnTextColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    mobPrimaryBtnTextSizePx: { type: Number, default: 15, min: 10, max: 24 },

    mobYellowBtnBg: { type: String, default: "#d7a900", validate: [hex, "Invalid HEX"] },
    mobYellowBtnTextColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobYellowBtnTextSizePx: { type: Number, default: 15, min: 10, max: 24 },

    mobStepperActiveBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobStepperInactiveBg: { type: String, default: "#d9d9d9", validate: [hex, "Invalid HEX"] },
    mobStepperLineActiveBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobStepperLineInactiveBg: { type: String, default: "#d9d9d9", validate: [hex, "Invalid HEX"] },
    mobStepperTickColor: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },

    // ====== DESKTOP styles ======
    deskPageBg: { type: String, default: "#f0f0f0", validate: [hex, "Invalid HEX"] },
    deskCardBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    deskTitleColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    deskSubTitleColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    deskRegisterBtnBg: { type: String, default: "#f2c200", validate: [hex, "Invalid HEX"] },
    deskRegisterBtnTextColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    deskRegisterBtnTextSizePx: { type: Number, default: 16, min: 10, max: 26 },

    deskVcodeBoxBg: { type: String, default: "#8b8b8b", validate: [hex, "Invalid HEX"] },
    deskVcodeBoxTextColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
  },
  { timestamps: true },
);

export default mongoose.model("RegisterConfig", RegisterConfigSchema);
