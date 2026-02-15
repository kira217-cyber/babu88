import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Download Banner Theme",
  isActive: true,

  // Section / banner wrapper
  sectionBg: "#0f0f0f",

  // Main title
  titleColor: "#f5b400",
  titleSizeMobile: 20,
  titleSizeSm: 24,
  titleSizeLg: 30,
  titleWeight: 800,

  // Subtitle / description
  subColor: "#e0e0e0",
  subOpacity: 0.88,
  subSizeMobile: 14,
  subSizeSm: 15,
  subWeight: 500,

  // Primary Download button
  downloadBtnBg: "#f5b400",
  downloadBtnText: "#000000",
  downloadBtnHeight: 48,
  downloadBtnRadius: 12,
  downloadBtnTextSize: 15,
  downloadBtnWeight: 800,
  downloadBtnShadow: "0 8px 20px rgba(245,180,0,0.40)",

  // Android-specific button
  androidBtnBg: "#1a1a1a",
  androidBtnText: "#a3e635",
  androidBtnBorderColor: "#f5b400",
  androidBtnBorderOpacity: 0.3,
  androidBtnHeight: 48,
  androidBtnRadius: 12,
  androidBtnTextSize: 15,
  androidBtnWeight: 700,
  androidBtnShadow: "0 6px 16px rgba(0,0,0,0.35)",

  // Right side radial gradient effect
  rightRadialOpacity: 0.18,
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
      placeholder="e.g. 0 8px 20px rgba(245,180,0,0.40)"
    />
  </div>
);

const DownloadBannerColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/download-banner-color");
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

      const res = await api.put("/api/download-banner-color", payload);
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
      ? "Download Banner Color Controller (Edit)"
      : "Download Banner Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Banner Section Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Section Background"
                  value={form.sectionBg}
                  onChange={(v) => setVal("sectionBg", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Main Title</h3>
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
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Subtitle / Description</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Subtitle Color"
                  value={form.subColor}
                  onChange={(v) => setVal("subColor", v)}
                />
                <NumField
                  label="Subtitle Opacity"
                  value={form.subOpacity}
                  onChange={(v) => setVal("subOpacity", v)}
                />
                <IntField
                  label="Sub Size Mobile (px)"
                  value={form.subSizeMobile}
                  onChange={(v) => setVal("subSizeMobile", v)}
                />
                <IntField
                  label="Sub Size SM (px)"
                  value={form.subSizeSm}
                  onChange={(v) => setVal("subSizeSm", v)}
                />
                <IntField
                  label="Subtitle Font Weight"
                  value={form.subWeight}
                  onChange={(v) => setVal("subWeight", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Download Button (Primary)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Button Background"
                  value={form.downloadBtnBg}
                  onChange={(v) => setVal("downloadBtnBg", v)}
                />
                <ColorField
                  label="Button Text Color"
                  value={form.downloadBtnText}
                  onChange={(v) => setVal("downloadBtnText", v)}
                />
                <IntField
                  label="Button Height (px)"
                  value={form.downloadBtnHeight}
                  onChange={(v) => setVal("downloadBtnHeight", v)}
                />
                <IntField
                  label="Button Radius (px)"
                  value={form.downloadBtnRadius}
                  onChange={(v) => setVal("downloadBtnRadius", v)}
                />
                <IntField
                  label="Button Text Size (px)"
                  value={form.downloadBtnTextSize}
                  onChange={(v) => setVal("downloadBtnTextSize", v)}
                />
                <IntField
                  label="Button Font Weight"
                  value={form.downloadBtnWeight}
                  onChange={(v) => setVal("downloadBtnWeight", v)}
                />
                <TextField
                  label="Button Shadow (css)"
                  value={form.downloadBtnShadow}
                  onChange={(v) => setVal("downloadBtnShadow", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Android Button</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Android Button BG"
                  value={form.androidBtnBg}
                  onChange={(v) => setVal("androidBtnBg", v)}
                />
                <ColorField
                  label="Android Button Text"
                  value={form.androidBtnText}
                  onChange={(v) => setVal("androidBtnText", v)}
                />
                <ColorField
                  label="Border Color"
                  value={form.androidBtnBorderColor}
                  onChange={(v) => setVal("androidBtnBorderColor", v)}
                />
                <NumField
                  label="Border Opacity"
                  value={form.androidBtnBorderOpacity}
                  onChange={(v) => setVal("androidBtnBorderOpacity", v)}
                />
                <IntField
                  label="Height (px)"
                  value={form.androidBtnHeight}
                  onChange={(v) => setVal("androidBtnHeight", v)}
                />
                <IntField
                  label="Radius (px)"
                  value={form.androidBtnRadius}
                  onChange={(v) => setVal("androidBtnRadius", v)}
                />
                <IntField
                  label="Text Size (px)"
                  value={form.androidBtnTextSize}
                  onChange={(v) => setVal("androidBtnTextSize", v)}
                />
                <IntField
                  label="Font Weight"
                  value={form.androidBtnWeight}
                  onChange={(v) => setVal("androidBtnWeight", v)}
                />
                <TextField
                  label="Shadow (css)"
                  value={form.androidBtnShadow}
                  onChange={(v) => setVal("androidBtnShadow", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Right Radial Gradient Effect</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <NumField
                  label="Radial Gradient Opacity"
                  value={form.rightRadialOpacity}
                  onChange={(v) => setVal("rightRadialOpacity", v)}
                />
              </div>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default DownloadBannerColorController;
