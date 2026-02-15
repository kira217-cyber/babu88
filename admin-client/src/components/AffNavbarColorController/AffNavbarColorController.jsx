import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffNavbarColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    navBg: "#ffffff",
    navBorder: "#e5e7eb",

    textColor: "#000000",
    hoverTextColor: "#f59e0b",
    activeTextColor: "#f59e0b",
    menuTextSize: 16,

    logoWidth: 192,
    logoHeight: 48,

    loginBg: "#f59e0b",
    loginHoverBg: "#d97706",
    loginTextColor: "#000000",
    loginTextSize: 14,

    joinBg: "#4b4b4b",
    joinHoverBg: "#3f3f3f",
    joinTextColor: "#ffffff",
    joinTextSize: 14,

    langBtnBg: "#4b4b4b",
    langBtnHoverBg: "#3f3f3f",
    langBtnTextColor: "#ffffff",
    langBtnTextSize: 14,

    dropdownBg: "#ffffff",
    dropdownHoverBg: "#f3f4f6",
    dropdownTextColor: "#111827",
    dropdownBorder: "#e5e7eb",
  });

  // Consistent classes with sidebar style
  const containerCls =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 sm:p-6 lg:p-8";
  const cardCls =
    "bg-gradient-to-b from-black/70 via-yellow-950/30 to-black/60 backdrop-blur-sm border border-yellow-700/40 rounded-xl shadow-xl shadow-yellow-900/20 overflow-hidden";
  const headerCls =
    "p-5 sm:p-6 border-b border-yellow-700/40 bg-gradient-to-r from-black/80 to-yellow-950/40";
  const sectionTitleCls =
    "text-xl sm:text-2xl font-bold tracking-tight text-white";
  const subtitleCls = "text-sm text-yellow-200/80 mt-1";
  const labelCls = "text-sm font-semibold text-yellow-100/90 mb-2 block";
  const inputBase =
    "w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/60 " +
    "focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all duration-200";
  const colorInputWrapper = "flex items-center gap-3";
  const colorPickerCls =
    "h-10 w-12 rounded-md border border-yellow-700/50 cursor-pointer bg-transparent";
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const reloadBtn = `${btnBase} border border-yellow-700/60 bg-yellow-950/40 hover:bg-yellow-900/50 text-yellow-100`;
  const saveBtn = `${btnBase} bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black shadow-md shadow-yellow-900/40 font-semibold`;

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/aff-navbar-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load navbar settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      setSaving(true);
      await api.put("/api/aff-navbar-color", form);
      toast.success("Navbar configuration saved successfully!");
      await load();
    } catch (e) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const ColorField = ({ label, name }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className={colorInputWrapper}>
        <input
          type="color"
          value={form[name] || "#000000"}
          onChange={(e) => setField(name, e.target.value)}
          className={colorPickerCls}
        />
        <input
          type="text"
          value={form[name] || ""}
          onChange={(e) => setField(name, e.target.value)}
          placeholder="#ffffff"
          className={inputBase}
        />
      </div>
    </div>
  );

  const NumberField = ({ label, name, min = 0, max = 999 }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={Number(form[name] ?? min)}
        onChange={(e) => setField(name, Number(e.target.value))}
        className={inputBase}
      />
    </div>
  );

  const Section = ({ title, children }) => (
    <div className={cardCls}>
      <div className={headerCls}>
        <h3 className={sectionTitleCls}>{title}</h3>
      </div>
      <div className="p-5 sm:p-6 lg:p-8">{children}</div>
    </div>
  );

  return (
    <div className={containerCls}>
      {/* Header Card */}
      <div className={`${cardCls} mb-6 sm:mb-8`}>
        <div className={headerCls}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={sectionTitleCls}>Affiliate Navbar Controller</h2>
              <p className={subtitleCls}>
                Control navbar colors, sizes, and button styles from here
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={load}
                disabled={loading || saving}
                className={reloadBtn}
              >
                {loading ? "Loading..." : "Reload"}
              </button>
              <button
                onClick={save}
                disabled={loading || saving}
                className={saveBtn}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navbar Section */}
        <Section title="Navbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Navbar Background" name="navBg" />
            <ColorField label="Navbar Border" name="navBorder" />
            <ColorField label="Menu Text Color" name="textColor" />
            <ColorField label="Menu Hover Text Color" name="hoverTextColor" />
            <ColorField label="Menu Active Text Color" name="activeTextColor" />
            <NumberField
              label="Menu Text Size (px)"
              name="menuTextSize"
              min={10}
              max={40}
            />
          </div>
        </Section>

        {/* Logo Section */}
        <Section title="Logo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Logo Width (px)"
              name="logoWidth"
              min={50}
              max={600}
            />
            <NumberField
              label="Logo Height (px)"
              name="logoHeight"
              min={20}
              max={200}
            />
          </div>
        </Section>

        {/* Buttons Section */}
        <Section title="Buttons">
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                Login Button
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField label="Background" name="loginBg" />
                <ColorField label="Hover Background" name="loginHoverBg" />
                <ColorField label="Text Color" name="loginTextColor" />
                <NumberField
                  label="Text Size (px)"
                  name="loginTextSize"
                  min={10}
                  max={30}
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                Join Button
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField label="Background" name="joinBg" />
                <ColorField label="Hover Background" name="joinHoverBg" />
                <ColorField label="Text Color" name="joinTextColor" />
                <NumberField
                  label="Text Size (px)"
                  name="joinTextSize"
                  min={10}
                  max={30}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Language + Dropdown Section */}
        <Section title="Language & Dropdown">
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                Language Button
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField label="Background" name="langBtnBg" />
                <ColorField label="Hover Background" name="langBtnHoverBg" />
                <ColorField label="Text Color" name="langBtnTextColor" />
                <NumberField
                  label="Text Size (px)"
                  name="langBtnTextSize"
                  min={10}
                  max={30}
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                Dropdown Menu
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField label="Background" name="dropdownBg" />
                <ColorField label="Hover Background" name="dropdownHoverBg" />
                <ColorField label="Text Color" name="dropdownTextColor" />
                <ColorField label="Border Color" name="dropdownBorder" />
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffNavbarColorController;
