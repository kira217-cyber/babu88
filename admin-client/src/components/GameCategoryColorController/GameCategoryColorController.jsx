import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Game Category Theme",
  isActive: true,

  // Category wrapper / scroller container
  wrapBg: "#0f0f0f",
  wrapOpacity: 0.95,
  scrollerBg: "#1a1a1a",

  // Category buttons (tabs / chips)
  btnActiveBg: "#f5b400",
  btnActiveText: "#000000",

  btnInactiveBg: "#1f1f1f",
  btnInactiveText: "#e0e0e0",
  btnInactiveTextOpacity: 0.88,

  btnTextSize: 14,

  // Underline / indicator track & thumb
  trackBg: "#ffffff",
  trackOpacity: 0.08,
  thumbBg: "#f5b400",

  // Empty state message
  emptyText: "#b3b3b3",
  emptyTextOpacity: 0.9,
  emptyTextSize: 15,

  // Game cards
  cardBg: "#111111",
  cardBgOpacity: 1,

  cardRing: "#f5b400",
  cardRingOpacity: 0.25,

  // Badge (new/hot/popular/etc.)
  badgeBg: "#ef4444",
  badgeText: "#ffffff",
  badgeTextSize: 11,
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

const IntField = ({ label, value, onChange, min = 8, max = 30 }) => (
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

const GameCategoryColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/gamecategory-color");
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

      const res = await api.put("/api/gamecategory-color", payload);
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
      ? "Game Category Bar Color Controller (Edit)"
      : "Game Category Bar Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Category Wrapper / Scroller</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Wrapper Background"
                  value={form.wrapBg}
                  onChange={(v) => setVal("wrapBg", v)}
                />
                <NumField
                  label="Wrapper Opacity"
                  value={form.wrapOpacity}
                  onChange={(v) => setVal("wrapOpacity", v)}
                />
                <ColorField
                  label="Scroller Background"
                  value={form.scrollerBg}
                  onChange={(v) => setVal("scrollerBg", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Category Buttons (Tabs/Chips)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Active Button BG"
                  value={form.btnActiveBg}
                  onChange={(v) => setVal("btnActiveBg", v)}
                />
                <ColorField
                  label="Active Button Text"
                  value={form.btnActiveText}
                  onChange={(v) => setVal("btnActiveText", v)}
                />

                <ColorField
                  label="Inactive Button BG"
                  value={form.btnInactiveBg}
                  onChange={(v) => setVal("btnInactiveBg", v)}
                />
                <ColorField
                  label="Inactive Button Text"
                  value={form.btnInactiveText}
                  onChange={(v) => setVal("btnInactiveText", v)}
                />
                <NumField
                  label="Inactive Text Opacity"
                  value={form.btnInactiveTextOpacity}
                  onChange={(v) => setVal("btnInactiveTextOpacity", v)}
                />

                <IntField
                  label="Button Text Size (px)"
                  value={form.btnTextSize}
                  onChange={(v) => setVal("btnTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>
                Underline / Indicator (Track & Thumb)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Track Background"
                  value={form.trackBg}
                  onChange={(v) => setVal("trackBg", v)}
                />
                <NumField
                  label="Track Opacity"
                  value={form.trackOpacity}
                  onChange={(v) => setVal("trackOpacity", v)}
                />
                <ColorField
                  label="Thumb / Indicator Color"
                  value={form.thumbBg}
                  onChange={(v) => setVal("thumbBg", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Empty State Message</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Empty Text Color"
                  value={form.emptyText}
                  onChange={(v) => setVal("emptyText", v)}
                />
                <NumField
                  label="Empty Text Opacity"
                  value={form.emptyTextOpacity}
                  onChange={(v) => setVal("emptyTextOpacity", v)}
                />
                <IntField
                  label="Empty Text Size (px)"
                  value={form.emptyTextSize}
                  onChange={(v) => setVal("emptyTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Game Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Card Background"
                  value={form.cardBg}
                  onChange={(v) => setVal("cardBg", v)}
                />
                <NumField
                  label="Card Background Opacity"
                  value={form.cardBgOpacity}
                  onChange={(v) => setVal("cardBgOpacity", v)}
                />
                <ColorField
                  label="Card Ring / Border Color"
                  value={form.cardRing}
                  onChange={(v) => setVal("cardRing", v)}
                />
                <NumField
                  label="Card Ring Opacity"
                  value={form.cardRingOpacity}
                  onChange={(v) => setVal("cardRingOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Badges on Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Badge Background"
                  value={form.badgeBg}
                  onChange={(v) => setVal("badgeBg", v)}
                />
                <ColorField
                  label="Badge Text Color"
                  value={form.badgeText}
                  onChange={(v) => setVal("badgeText", v)}
                />
                <IntField
                  label="Badge Text Size (px)"
                  value={form.badgeTextSize}
                  onChange={(v) => setVal("badgeTextSize", v)}
                />
              </div>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default GameCategoryColorController;
