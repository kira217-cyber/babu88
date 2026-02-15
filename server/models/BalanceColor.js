import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const BalanceColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // section
    sectionBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    sectionBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    sectionBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // balance pill box
    pillBg: { type: String, default: "#f2f2f2", validate: [hex, "Invalid HEX"] },
    pillBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    pillBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    pillRadius: { type: Number, default: 6, min: 0, max: 30 },
    pillPaddingX: { type: Number, default: 12, min: 0, max: 30 },
    pillPaddingY: { type: Number, default: 8, min: 0, max: 30 },
    pillShadow: { type: String, default: "0_1px_0_rgba(0,0,0,0.04)" },

    // currency + amount text
    currencyColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    currencyOpacity: { type: Number, default: 0.8, min: 0, max: 1 },
    currencySize: { type: Number, default: 13, min: 10, max: 22 },
    currencyWeight: { type: Number, default: 700, min: 100, max: 900 },

    amountColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    amountSize: { type: Number, default: 13, min: 10, max: 26 },
    amountWeight: { type: Number, default: 800, min: 100, max: 900 },

    // refresh btn
    refreshBtnBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    refreshBtnBorderColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    refreshBtnBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    refreshBtnSize: { type: Number, default: 28, min: 18, max: 60 },
    refreshBtnRadius: { type: Number, default: 999, min: 0, max: 999 },
    refreshIconColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    refreshIconOpacity: { type: Number, default: 0.7, min: 0, max: 1 },
    refreshIconSize: { type: Number, default: 12, min: 8, max: 30 },

    // action buttons (Withdraw/Deposit/Account)
    actionIconBoxBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    actionIconBoxSize: { type: Number, default: 40, min: 24, max: 80 },
    actionIconBoxRadius: { type: Number, default: 8, min: 0, max: 30 },
    actionIconColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    actionIconSize: { type: Number, default: 20, min: 12, max: 40 },

    // action label
    actionLabelColor: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    actionLabelOpacity: { type: Number, default: 0.8, min: 0, max: 1 },
    actionLabelSize: { type: Number, default: 12, min: 10, max: 22 },
    actionLabelWeight: { type: Number, default: 600, min: 100, max: 900 },
  },
  { timestamps: true },
);

export default mongoose.model("BalanceColor", BalanceColorSchema);
