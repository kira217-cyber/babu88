import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const LoginColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // ===== Desktop =====
    desktopPageBg: { type: String, default: "#e9e9e9", validate: [hex, "Invalid HEX"] },
    desktopTitleColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopSubColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopSubOpacity: { type: Number, default: 0.8, min: 0, max: 1 },

    desktopCardBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    desktopCardBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopCardBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    desktopLabelColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopLabelSize: { type: Number, default: 14, min: 10, max: 24 },
    desktopLabelWeight: { type: Number, default: 600, min: 100, max: 900 },

    desktopRequiredColor: { type: String, default: "#dc2626", validate: [hex, "Invalid HEX"] }, // red-600

    desktopInputBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    desktopInputTextColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopInputTextSize: { type: Number, default: 14, min: 10, max: 24 },
    desktopInputBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopInputBorderOpacity: { type: Number, default: 0.4, min: 0, max: 1 },
    desktopInputErrorBorderColor: { type: String, default: "#ef4444", validate: [hex, "Invalid HEX"] }, // red-500

    desktopEyeColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopEyeOpacity: { type: Number, default: 0.55, min: 0, max: 1 },

    desktopLoginBtnBg: { type: String, default: "#ffd000", validate: [hex, "Invalid HEX"] },
    desktopLoginBtnText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopLoginBtnTextSize: { type: Number, default: 16, min: 10, max: 30 },

    desktopForgotColor: { type: String, default: "#2563eb", validate: [hex, "Invalid HEX"] }, // blue-600
    desktopRegisterColor: { type: String, default: "#2563eb", validate: [hex, "Invalid HEX"] },

    desktopHelpColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopHelpOpacity: { type: Number, default: 0.75, min: 0, max: 1 },

    desktopDividerColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    desktopDividerOpacity: { type: Number, default: 0.2, min: 0, max: 1 },

    // ===== Mobile =====
    mobilePageBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },

    mobileTopBarBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobileTopBarTextColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    mobileTopBarTextSize: { type: Number, default: 16, min: 10, max: 28 },

    mobileForgotColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobileForgotOpacity: { type: Number, default: 0.4, min: 0, max: 1 },

    mobileLoginBtnBg: { type: String, default: "#0a63c8", validate: [hex, "Invalid HEX"] },
    mobileLoginBtnText: { type: String, default: "#ffd000", validate: [hex, "Invalid HEX"] },
    mobileLoginBtnTextSize: { type: Number, default: 15, min: 10, max: 28 },

    mobileSignupBtnBg: { type: String, default: "#ffd000", validate: [hex, "Invalid HEX"] },
    mobileSignupBtnText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobileSignupBtnTextSize: { type: Number, default: 15, min: 10, max: 28 },

    mobileMutedTextColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    mobileMutedTextOpacity: { type: Number, default: 0.4, min: 0, max: 1 },
  },
  { timestamps: true },
);

export default mongoose.model("LoginColor", LoginColorSchema);
