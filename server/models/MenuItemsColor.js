import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const MenuItemsColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Top dark bar background
    barBg: { type: String, default: "#3e3e3e", validate: [hex, "Invalid HEX"] },

    // Menu item (default)
    itemText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    itemTextOpacity: { type: Number, default: 0.9, min: 0, max: 1 },
    itemTextSize: { type: Number, default: 14, min: 10, max: 24 },

    // Menu item hover
    itemHoverText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },

    // Dropdown button open background (was bg-black/35)
    dropdownOpenBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    dropdownOpenBgOpacity: { type: Number, default: 0.35, min: 0, max: 1 },

    // Active NavLink
    activeBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    activeText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    // Mega dropdown panel (was border white/10 + bg black/35)
    megaPanelBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    megaPanelBgOpacity: { type: Number, default: 0.35, min: 0, max: 1 },
    megaPanelBorder: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    megaPanelBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Provider card (button)
    cardBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    cardBgOpacity: { type: Number, default: 0.05, min: 0, max: 1 },
    cardBorder: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    cardBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Provider card hover
    cardHoverBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    cardHoverBgOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    cardHoverBorder: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    cardHoverBorderOpacity: { type: Number, default: 0.6, min: 0, max: 1 },

    // Divider line inside mega
    divider: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    dividerOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Badge colors (NEW/HOT)
    badgeNewBg: { type: String, default: "#20c55b", validate: [hex, "Invalid HEX"] },
    badgeNewText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    badgeHotBg: { type: String, default: "#ff3b30", validate: [hex, "Invalid HEX"] },
    badgeHotText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItemsColor", MenuItemsColorSchema);
