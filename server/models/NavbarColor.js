import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const NavbarColorSchema = new mongoose.Schema(
  {
    // Login button
    loginBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    loginText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    loginTextSize: { type: Number, default: 14, min: 10, max: 24 },

    // Register button
    registerBg: { type: String, default: "#0b78f0", validate: [hex, "Invalid HEX"] },
    registerText: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    registerTextSize: { type: Number, default: 14, min: 10, max: 24 },

    // Profile + Notification icon circle
    iconBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    iconText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    // Mobile sidebar navlink (inactive)
    sidebarLinkBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    sidebarLinkText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    sidebarLinkTextSize: { type: Number, default: 14, min: 10, max: 24 },

    // Mobile sidebar navlink (active)
    sidebarActiveBg: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },
    sidebarActiveText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    // Optional: enable/disable config
    isActive: { type: Boolean, default: true },
    name: { type: String, default: "Default" }, // admin list এ বুঝার জন্য
  },
  { timestamps: true }
);

export default mongoose.model("NavbarColor", NavbarColorSchema);
