// models/AffLoginColor.js
import mongoose from "mongoose";

const affLoginColorSchema = new mongoose.Schema(
  {
    // PAGE BG
    pageBg: { type: String, default: "#4b4b4b" },

    // CARD
    cardBg: { type: String, default: "#ffffff" },
    cardBorder: { type: String, default: "rgba(0,0,0,0.05)" },
    cardShadow: { type: String, default: "0 30px 90px rgba(0,0,0,0.35)" },
    cardRadius: { type: Number, default: 24 },

    // HEADER
    headerBorder: { type: String, default: "rgba(0,0,0,0.05)" },
    titleColor: { type: String, default: "#000000" },
    subtitleColor: { type: String, default: "rgba(0,0,0,0.60)" },

    // LABEL
    labelColor: { type: String, default: "rgba(0,0,0,0.80)" },

    // INPUT
    inputBg: { type: String, default: "#ffffff" },
    inputText: { type: String, default: "rgba(0,0,0,0.90)" },
    inputPlaceholder: { type: String, default: "rgba(0,0,0,0.35)" },
    inputBorder: { type: String, default: "rgba(0,0,0,0.10)" },
    inputShadow: { type: String, default: "0 10px 30px rgba(0,0,0,0.06)" },
    inputRadius: { type: Number, default: 16 },
    inputFocusBorder: { type: String, default: "#f59e0b" },
    inputFocusRing: { type: String, default: "rgba(253,224,71,0.60)" },

    // ICON BOX
    iconBoxBg: { type: String, default: "rgba(0,0,0,0.05)" },
    iconColor: { type: String, default: "rgba(0,0,0,0.60)" },

    // EYE TOGGLE ICON
    eyeIcon: { type: String, default: "rgba(0,0,0,0.50)" },
    eyeHoverIcon: { type: String, default: "#000000" },

    // ERROR
    errorColor: { type: String, default: "#dc2626" },

    // CAPTCHA BOX
    vcodeBg: { type: String, default: "#4b4b4b" },
    vcodeText: { type: String, default: "#ffffff" },

    // SUBMIT BUTTON
    submitBg: { type: String, default: "#f59e0b" },
    submitHoverBg: { type: String, default: "#d97706" },
    submitText: { type: String, default: "#000000" },
    submitShadow: { type: String, default: "0 16px 40px rgba(245,158,11,0.35)" },
    submitTextSize: { type: Number, default: 16 },
    submitRadius: { type: Number, default: 16 }, // rounded-2xl

    // REGISTER LINK
    helperText: { type: String, default: "rgba(0,0,0,0.70)" },
    linkColor: { type: String, default: "#ca8a04" },
    linkHoverColor: { type: String, default: "#a16207" },
  },
  { timestamps: true },
);

export default mongoose.model("AffLoginColor", affLoginColorSchema);
