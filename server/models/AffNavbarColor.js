// models/AffNavbarColor.js
import mongoose from "mongoose";

const affNavbarColorSchema = new mongoose.Schema(
  {
    // NAV WRAPPER
    navBg: { type: String, default: "#ffffff" },
    navBorder: { type: String, default: "#e5e7eb" },

    // TEXT
    textColor: { type: String, default: "#000000" },
    hoverTextColor: { type: String, default: "#f59e0b" }, // yellow-500
    activeTextColor: { type: String, default: "#f59e0b" },

    // MENU TEXT SIZE (px)
    menuTextSize: { type: Number, default: 16 }, // text-md

    // LOGO
    logoWidth: { type: Number, default: 192 }, // w-48 => 192px
    logoHeight: { type: Number, default: 48 }, // approx

    // BUTTON: LOGIN
    loginBg: { type: String, default: "#f59e0b" },
    loginHoverBg: { type: String, default: "#d97706" },
    loginTextColor: { type: String, default: "#000000" },
    loginTextSize: { type: Number, default: 14 }, // text-sm

    // BUTTON: JOIN
    joinBg: { type: String, default: "#4b4b4b" },
    joinHoverBg: { type: String, default: "#3f3f3f" },
    joinTextColor: { type: String, default: "#ffffff" },
    joinTextSize: { type: Number, default: 14 },

    // LANGUAGE BUTTON
    langBtnBg: { type: String, default: "#4b4b4b" },
    langBtnHoverBg: { type: String, default: "#3f3f3f" },
    langBtnTextColor: { type: String, default: "#ffffff" },
    langBtnTextSize: { type: Number, default: 14 },

    // DROPDOWN
    dropdownBg: { type: String, default: "#ffffff" },
    dropdownHoverBg: { type: String, default: "#f3f4f6" }, // gray-100
    dropdownTextColor: { type: String, default: "#111827" }, // gray-900
    dropdownBorder: { type: String, default: "#e5e7eb" },
  },
  { timestamps: true },
);

export default mongoose.model("AffNavbarColor", affNavbarColorSchema);
