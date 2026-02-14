import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Notice Theme",
  isActive: true,

  // Container / notice bar wrapper
  containerBg: "#0f0f0f",
  borderColor: "#f5b400",
  borderOpacity: 0.28,
  radiusPx: 8,

  // Marquee text
  textColor: "#f5b400",
  textOpacity: 0.95,
  textWeight: 700,
  textSizeMobile: 14,
  textSizeSm: 15,
  textSizeLg: 16,

  // Separator (• or | between notices)
  sepColor: "#f5b400",
  sepOpacity: 0.45,
  sepWeight: 900,

  // Spacing & animation
  gapMobile: 24,
  gapSm: 32,
  durationSec: 35,
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

const IntField = ({ label, value, onChange, min = 0, max = 200 }) => (
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

const NoticeColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/notice-color");
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

      const res = await api.put("/api/notice-color", payload);
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
      ? "Notice / Marquee Color Controller (Edit)"
      : "Notice / Marquee Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Notice Container</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Background Color"
                  value={form.containerBg}
                  onChange={(v) => setVal("containerBg", v)}
                />
                <ColorField
                  label="Border Color"
                  value={form.borderColor}
                  onChange={(v) => setVal("borderColor", v)}
                />
                <NumField
                  label="Border Opacity"
                  value={form.borderOpacity}
                  onChange={(v) => setVal("borderOpacity", v)}
                />
                <IntField
                  label="Border Radius (px)"
                  value={form.radiusPx}
                  onChange={(v) => setVal("radiusPx", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Marquee Text</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Text Color"
                  value={form.textColor}
                  onChange={(v) => setVal("textColor", v)}
                />
                <NumField
                  label="Text Opacity"
                  value={form.textOpacity}
                  onChange={(v) => setVal("textOpacity", v)}
                />
                <IntField
                  label="Font Weight"
                  value={form.textWeight}
                  onChange={(v) => setVal("textWeight", v)}
                  min={100}
                  max={900}
                />
                <IntField
                  label="Text Size Mobile (px)"
                  value={form.textSizeMobile}
                  onChange={(v) => setVal("textSizeMobile", v)}
                />
                <IntField
                  label="Text Size ≥640px (px)"
                  value={form.textSizeSm}
                  onChange={(v) => setVal("textSizeSm", v)}
                />
                <IntField
                  label="Text Size ≥1024px (px)"
                  value={form.textSizeLg}
                  onChange={(v) => setVal("textSizeLg", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Separator (• or |)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Separator Color"
                  value={form.sepColor}
                  onChange={(v) => setVal("sepColor", v)}
                />
                <NumField
                  label="Separator Opacity"
                  value={form.sepOpacity}
                  onChange={(v) => setVal("sepOpacity", v)}
                />
                <IntField
                  label="Separator Font Weight"
                  value={form.sepWeight}
                  onChange={(v) => setVal("sepWeight", v)}
                  min={100}
                  max={900}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Spacing & Animation Speed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <IntField
                  label="Gap Mobile (px)"
                  value={form.gapMobile}
                  onChange={(v) => setVal("gapMobile", v)}
                />
                <IntField
                  label="Gap ≥640px (px)"
                  value={form.gapSm}
                  onChange={(v) => setVal("gapSm", v)}
                />
                <IntField
                  label="Animation Duration (seconds)"
                  value={form.durationSec}
                  onChange={(v) => setVal("durationSec", v)}
                  min={10}
                  max={120}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeColorController;
