import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Bottom Nav Theme",
  isActive: true,

  // Logged OUT state (Login / Register buttons)
  logoutLoginBg: "#FFCE01",
  logoutLoginText: "#000000",
  logoutLoginTextSize: 15,

  logoutRegisterBg: "#0066D1",
  logoutRegisterText: "#FFFFFF",
  logoutRegisterTextSize: 15,

  // Logged IN state (bar)
  barBg: "#0f0f0f",
  barBorder: "#f5b400",
  barBorderOpacity: 0.25,

  // Icons (logged in)
  iconActiveBg: "#f5b400",
  iconInactiveBg: "#1a1a1a",

  iconActiveText: "#000000",
  iconInactiveText: "#e0e0e0",

  iconSize: 22,

  // Labels (logged in)
  labelText: "#e0e0e0",
  labelOpacity: 0.92,
  labelTextSize: 11,
};

const inputWrap =
  "bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] border border-yellow-900/30 rounded-2xl p-5 sm:p-7 shadow-xl shadow-black/40 text-white";

const labelCls = "text-sm font-semibold text-yellow-100/90 tracking-wide";
const sectionTitleCls =
  "text-lg sm:text-xl font-bold text-yellow-400/90 mb-4 pb-2 border-b border-yellow-900/40";

const fieldCls =
  "w-full bg-black/60 border border-yellow-900/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-yellow-600/60 focus:outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/30 transition-all";

const btnBase =
  "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm";
const btnPrimary = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black hover:shadow-yellow-500/40`;
const btnGhost = `${btnBase} bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-yellow-500/30`;

const ColorField = ({ label, value, onChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <label className={`${labelCls} sm:min-w-[160px]`}>{label}</label>
    <div className="flex-1 flex items-center gap-3">
      <input
        className={fieldCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#rrggbb"
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg cursor-pointer border border-yellow-900/50 bg-black/40"
        title={label}
      />
    </div>
  </div>
);

const IntField = ({ label, value, onChange, min = 8, max = 28 }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <label className={`${labelCls} sm:min-w-[160px]`}>{label}</label>
    <input
      type="number"
      min={min}
      max={max}
      className={`${fieldCls} max-w-[140px]`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const NumField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <label className={`${labelCls} sm:min-w-[160px]`}>{label}</label>
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      className={`${fieldCls} max-w-[140px]`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const BottomNavbarColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/bottom-navbar-color");
      if (!res.data) {
        setDocId(null);
        setForm(defaults);
        return;
      }
      setDocId(res.data._id);
      const cleaned = { ...defaults, ...res.data };
      delete cleaned.__v;
      delete cleaned.createdAt;
      delete cleaned.updatedAt;
      setForm(cleaned);
    } catch (err) {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...form };
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;

      const res = await api.put("/api/bottom-navbar-color", payload);
      setDocId(res.data._id || docId);
      toast.success(docId ? "Configuration updated" : "Configuration created");
      await loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const headerText = useMemo(() => {
    if (loading) return "Loading configuration...";
    return docId
      ? "Bottom Navbar Color Controller (Edit)"
      : "Bottom Navbar Color Controller (Create New)";
  }, [docId, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 tracking-tight">
            {headerText}
          </h1>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              className={btnGhost}
              onClick={loadConfig}
              disabled={loading || saving}
            >
              Refresh
            </button>
            <button
              className={btnPrimary}
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : docId ? "Update" : "Create"}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className={inputWrap}>
          {/* Basic Info */}
          <div className="mb-8">
            <h3 className={sectionTitleCls}>General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Config Name</label>
                <input
                  className={`${fieldCls} mt-1.5`}
                  value={form.name}
                  onChange={(e) => setVal("name", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 md:mt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => setVal("isActive", e.target.checked)}
                  className="h-5 w-5 accent-yellow-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-yellow-100/90 cursor-pointer"
                >
                  Active (used on client site)
                </label>
              </div>

            
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10 sm:space-y-12">
            <div>
              <h3 className={sectionTitleCls}>
                Logged Out State — Login / Register Buttons
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Login Button BG"
                  value={form.logoutLoginBg}
                  onChange={(v) => setVal("logoutLoginBg", v)}
                />
                <ColorField
                  label="Login Button Text"
                  value={form.logoutLoginText}
                  onChange={(v) => setVal("logoutLoginText", v)}
                />
                <IntField
                  label="Login Text Size (px)"
                  value={form.logoutLoginTextSize}
                  onChange={(v) => setVal("logoutLoginTextSize", v)}
                />

                <ColorField
                  label="Register Button BG"
                  value={form.logoutRegisterBg}
                  onChange={(v) => setVal("logoutRegisterBg", v)}
                />
                <ColorField
                  label="Register Button Text"
                  value={form.logoutRegisterText}
                  onChange={(v) => setVal("logoutRegisterText", v)}
                />
                <IntField
                  label="Register Text Size (px)"
                  value={form.logoutRegisterTextSize}
                  onChange={(v) => setVal("logoutRegisterTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Logged In State — Bottom Bar</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Bar Background"
                  value={form.barBg}
                  onChange={(v) => setVal("barBg", v)}
                />
                <ColorField
                  label="Bar Border Color"
                  value={form.barBorder}
                  onChange={(v) => setVal("barBorder", v)}
                />
                <NumField
                  label="Bar Border Opacity"
                  value={form.barBorderOpacity}
                  onChange={(v) => setVal("barBorderOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Icons (Logged In)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Active Icon Background"
                  value={form.iconActiveBg}
                  onChange={(v) => setVal("iconActiveBg", v)}
                />
                <ColorField
                  label="Inactive Icon Background"
                  value={form.iconInactiveBg}
                  onChange={(v) => setVal("iconInactiveBg", v)}
                />

                <ColorField
                  label="Active Icon Color"
                  value={form.iconActiveText}
                  onChange={(v) => setVal("iconActiveText", v)}
                />
                <ColorField
                  label="Inactive Icon Color"
                  value={form.iconInactiveText}
                  onChange={(v) => setVal("iconInactiveText", v)}
                />

                <IntField
                  label="Icon Size (px)"
                  value={form.iconSize}
                  onChange={(v) => setVal("iconSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Labels / Text (Logged In)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Label Text Color"
                  value={form.labelText}
                  onChange={(v) => setVal("labelText", v)}
                />
                <NumField
                  label="Label Text Opacity"
                  value={form.labelOpacity}
                  onChange={(v) => setVal("labelOpacity", v)}
                />
                <IntField
                  label="Label Text Size (px)"
                  value={form.labelTextSize}
                  onChange={(v) => setVal("labelTextSize", v)}
                />
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default BottomNavbarColorController;
