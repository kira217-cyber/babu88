// models/AffRegisterColor.js
import mongoose from "mongoose";

const affRegisterColorSchema = new mongoose.Schema(
  {
    // PAGE BG
    pageBg: { type: String, default: "#4b4b4b" },

    // CARD
    cardBg: { type: String, default: "#ffffff" },
    cardBorder: { type: String, default: "rgba(0,0,0,0.05)" },
    cardShadow: { type: String, default: "0 30px 90px rgba(0,0,0,0.35)" },
    cardRadius: { type: Number, default: 24 }, // rounded-3xl feel

    // HEADER
    headerBorder: { type: String, default: "rgba(0,0,0,0.05)" },
    titleColor: { type: String, default: "#000000" },
    subtitleColor: { type: String, default: "rgba(0,0,0,0.60)" },

    // LABEL / INPUT
    labelColor: { type: String, default: "rgba(0,0,0,0.80)" },
    inputBg: { type: String, default: "#ffffff" },
    inputText: { type: String, default: "rgba(0,0,0,0.90)" },
    inputPlaceholder: { type: String, default: "rgba(0,0,0,0.35)" },
    inputBorder: { type: String, default: "rgba(0,0,0,0.10)" },
    inputFocusBorder: { type: String, default: "#f59e0b" }, // yellow-500
    inputFocusRing: { type: String, default: "rgba(253,224,71,0.60)" }, // yellow-ish
    inputShadow: { type: String, default: "0 10px 30px rgba(0,0,0,0.06)" },
    inputRadius: { type: Number, default: 16 }, // rounded-xl feel

    // LEFT ICON BOX (FaUser/FaLock/FaPhone)
    iconBoxBg: { type: String, default: "rgba(0,0,0,0.05)" },
    iconColor: { type: String, default: "rgba(0,0,0,0.60)" },

    // ERROR
    errorColor: { type: String, default: "#dc2626" }, // red-600

    // CAPTCHA BOX (Verification code box)
    vcodeBg: { type: String, default: "#4b4b4b" },
    vcodeText: { type: String, default: "#ffffff" },

    // CHECKBOX
    checkboxAccent: { type: String, default: "#000000" },
    agreeTextColor: { type: String, default: "rgba(0,0,0,0.65)" },

    // SUBMIT BUTTON
    submitBg: { type: String, default: "#f59e0b" },
    submitHoverBg: { type: String, default: "#d97706" },
    submitText: { type: String, default: "#000000" },
    submitShadow: { type: String, default: "0 16px 40px rgba(245,158,11,0.35)" },
    submitTextSize: { type: Number, default: 16 },

    // LOGIN LINK
    linkColor: { type: String, default: "#ca8a04" }, // yellow-600
    linkHoverColor: { type: String, default: "#a16207" }, // yellow-700

    // FOOT NOTE
    noteTextColor: { type: String, default: "rgba(0,0,0,0.55)" },
  },
  { timestamps: true },
);

export default mongoose.model("AffRegisterColor", affRegisterColorSchema);
