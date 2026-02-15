// models/AffCommissionColor.js
import mongoose from "mongoose";

const affCommissionColorSchema = new mongoose.Schema(
  {
    // Section
    sectionBg: { type: String, default: "#2b2b2b" },
    sectionText: { type: String, default: "#ffffff" },

    // Title
    titleColor: { type: String, default: "#ffffff" },
    titleSize: { type: Number, default: 32 }, // px (sm:text-3xl)

    // Table
    tableBorder: { type: String, default: "rgba(255,255,255,0.90)" },

    tableHeaderBg: { type: String, default: "#f5b400" },
    tableHeaderText: { type: String, default: "#000000" },
    tableHeaderTextSize: { type: Number, default: 18 },

    tableRowBg: { type: String, default: "#2b2b2b" },
    tableRowText: { type: String, default: "#ffffff" },
    tableRowTextSize: { type: Number, default: 16 },
    tableCellBorder: { type: String, default: "rgba(255,255,255,0.90)" },

    // Primary Button (More + Close)
    btnBg: { type: String, default: "#f5b400" },
    btnHoverBg: { type: String, default: "#e2a800" },
    btnText: { type: String, default: "#000000" },
    btnTextSize: { type: Number, default: 16 },
    btnRadius: { type: Number, default: 6 },

    // Modal
    overlayOpacity: { type: Number, default: 0.55 },
    modalBg: { type: String, default: "#ffffff" },
    modalText: { type: String, default: "#000000" },
    modalRadius: { type: Number, default: 2 },
    modalShadow: { type: String, default: "0 18px 50px rgba(0,0,0,0.65)" },

    // Modal Header
    modalTitleColor: { type: String, default: "#000000" },
    modalTitleSize: { type: Number, default: 40 },

    // Close X button
    closeHoverBg: { type: String, default: "rgba(0,0,0,0.05)" },
    closeIconColor: { type: String, default: "#000000" },

    // Bullets text
    bulletColor: { type: String, default: "rgba(0,0,0,0.85)" },
    bulletSize: { type: Number, default: 16 },

    // Formula
    formulaTitleColor: { type: String, default: "#000000" },
    formulaTitleSize: { type: Number, default: 32 },

    formulaIconBg: { type: String, default: "#f5b400" },
    formulaIconColor: { type: String, default: "#ffffff" },
    formulaLabelColor: { type: String, default: "#000000" },
    formulaLabelSize: { type: Number, default: 14 },

    signColor: { type: String, default: "#f5b400" },
    signSize: { type: Number, default: 40 },

    // Example Table (modal)
    exTableBorder: { type: String, default: "rgba(0,0,0,0.15)" },
    exHeaderBg: { type: String, default: "#f5b400" },
    exHeaderText: { type: String, default: "#000000" },
    exCellBorder: { type: String, default: "rgba(0,0,0,0.10)" },
    exRowBg: { type: String, default: "#ffffff" },
    exRowText: { type: String, default: "#000000" },

    exTotalBg: { type: String, default: "#f5b400" },
    exTotalText: { type: String, default: "#000000" },
  },
  { timestamps: true },
);

export default mongoose.model("AffCommissionColor", affCommissionColorSchema);
