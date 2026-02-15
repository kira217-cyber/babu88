import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Two Banner Theme",
  isActive: true,

  // Left banner card
  leftCardBg: "#111111",
  leftCardShadow: "0 12px 32px rgba(0,0,0,0.35)",
  leftCardRadius: 16,

  leftOverlayStart: 0.75,
  leftOverlayMid: 0.4,
  leftOverlayEnd: 0.1,

  // Right banner card
  rightCardBg: "#111111",
  rightCardShadow: "0 12px 32px rgba(0,0,0,0.35)",
  rightCardRadius: 16,

  rightOverlayA: 0.22,
  rightOverlayB: 0.08,
  rightOverlayC: 0.22,

  // Common text styles (title + description)
  titleColor: "#f5b400",
  titleSizeMobile: 18,
  titleSizeSm: 20,
  titleSizeLg: 26,
  titleWeight: 800,

  descColor: "#e0e0e0",
  descOpacity: 0.9,
  descSizeMobile: 13,
  descSizeSm: 14,
  descSizeLg: 16,
  descWeight: 500,

  // Button (common for both banners)
  buttonBg: "#f5b400",
  buttonText: "#000000",
  buttonTextSize: 14,
  buttonWeight: 800,
  buttonShadow: "0 8px 20px rgba(245,180,0,0.40)",

  // Glow / accent effect
  glowColor: "#f5b400",
  glowOpacity: 0.3,
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

const IntField = ({ label, value, onChange, min = 0, max = 999 }) => (
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

const TextField = ({ label, value, onChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <label className={`${labelCls} sm:min-w-[160px]`}>{label}</label>
    <input
      className={fieldCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. 0 12px 32px rgba(0,0,0,0.35)"
    />
  </div>
);

const TwoBannerColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/two-banner-color");
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

      const res = await api.put("/api/two-banner-color", payload);
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
      ? "Two Banner Section Color Controller (Edit)"
      : "Two Banner Section Color Controller (Create New)";
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
          {/* General Settings */}
          <div className="mb-8">
            <h3 className={sectionTitleCls}>General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
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
              <h3 className={sectionTitleCls}>LEFT Banner Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Card Background"
                  value={form.leftCardBg}
                  onChange={(v) => setVal("leftCardBg", v)}
                />
                <TextField
                  label="Card Shadow (css)"
                  value={form.leftCardShadow}
                  onChange={(v) => setVal("leftCardShadow", v)}
                />
                <IntField
                  label="Card Border Radius (px)"
                  value={form.leftCardRadius}
                  onChange={(v) => setVal("leftCardRadius", v)}
                />

                <NumField
                  label="Overlay Gradient Start"
                  value={form.leftOverlayStart}
                  onChange={(v) => setVal("leftOverlayStart", v)}
                />
                <NumField
                  label="Overlay Gradient Middle"
                  value={form.leftOverlayMid}
                  onChange={(v) => setVal("leftOverlayMid", v)}
                />
                <NumField
                  label="Overlay Gradient End"
                  value={form.leftOverlayEnd}
                  onChange={(v) => setVal("leftOverlayEnd", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>RIGHT Banner Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Card Background"
                  value={form.rightCardBg}
                  onChange={(v) => setVal("rightCardBg", v)}
                />
                <TextField
                  label="Card Shadow (css)"
                  value={form.rightCardShadow}
                  onChange={(v) => setVal("rightCardShadow", v)}
                />
                <IntField
                  label="Card Border Radius (px)"
                  value={form.rightCardRadius}
                  onChange={(v) => setVal("rightCardRadius", v)}
                />

                <NumField
                  label="Right Overlay A"
                  value={form.rightOverlayA}
                  onChange={(v) => setVal("rightOverlayA", v)}
                />
                <NumField
                  label="Right Overlay B"
                  value={form.rightOverlayB}
                  onChange={(v) => setVal("rightOverlayB", v)}
                />
                <NumField
                  label="Right Overlay C"
                  value={form.rightOverlayC}
                  onChange={(v) => setVal("rightOverlayC", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Title & Description Text</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Title Color"
                  value={form.titleColor}
                  onChange={(v) => setVal("titleColor", v)}
                />
                <IntField
                  label="Title Size Mobile (px)"
                  value={form.titleSizeMobile}
                  onChange={(v) => setVal("titleSizeMobile", v)}
                />
                <IntField
                  label="Title Size SM (px)"
                  value={form.titleSizeSm}
                  onChange={(v) => setVal("titleSizeSm", v)}
                />
                <IntField
                  label="Title Size LG (px)"
                  value={form.titleSizeLg}
                  onChange={(v) => setVal("titleSizeLg", v)}
                />
                <IntField
                  label="Title Font Weight"
                  value={form.titleWeight}
                  onChange={(v) => setVal("titleWeight", v)}
                />

                <ColorField
                  label="Description Color"
                  value={form.descColor}
                  onChange={(v) => setVal("descColor", v)}
                />
                <NumField
                  label="Description Opacity"
                  value={form.descOpacity}
                  onChange={(v) => setVal("descOpacity", v)}
                />
                <IntField
                  label="Desc Size Mobile (px)"
                  value={form.descSizeMobile}
                  onChange={(v) => setVal("descSizeMobile", v)}
                />
                <IntField
                  label="Desc Size SM (px)"
                  value={form.descSizeSm}
                  onChange={(v) => setVal("descSizeSm", v)}
                />
                <IntField
                  label="Desc Size LG (px)"
                  value={form.descSizeLg}
                  onChange={(v) => setVal("descSizeLg", v)}
                />
                <IntField
                  label="Desc Font Weight"
                  value={form.descWeight}
                  onChange={(v) => setVal("descWeight", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Download / Action Button</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Button Background"
                  value={form.buttonBg}
                  onChange={(v) => setVal("buttonBg", v)}
                />
                <ColorField
                  label="Button Text Color"
                  value={form.buttonText}
                  onChange={(v) => setVal("buttonText", v)}
                />
                <IntField
                  label="Button Text Size (px)"
                  value={form.buttonTextSize}
                  onChange={(v) => setVal("buttonTextSize", v)}
                />
                <IntField
                  label="Button Font Weight"
                  value={form.buttonWeight}
                  onChange={(v) => setVal("buttonWeight", v)}
                />
                <TextField
                  label="Button Shadow (css)"
                  value={form.buttonShadow}
                  onChange={(v) => setVal("buttonShadow", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Glow / Accent Effect</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Glow / Accent Color"
                  value={form.glowColor}
                  onChange={(v) => setVal("glowColor", v)}
                />
                <NumField
                  label="Glow Opacity"
                  value={form.glowOpacity}
                  onChange={(v) => setVal("glowOpacity", v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoBannerColorController;
