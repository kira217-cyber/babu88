import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Hot Games Theme",
  isActive: true,

  // Section title (Hot Games / Popular / etc.)
  titleColor: "#f5b400",
  titleSize: 24,
  titleWeight: 800,

  // Main game card
  cardBg: "#111111",
  cardBgOpacity: 1,
  cardRadius: 12,
  cardShadow: "0 10px 25px rgba(0,0,0,0.25)",

  // Image hover effect
  imgHoverScale: 1.05,

  // Hover overlay (play icon appears)
  overlayBg: "#000000",
  overlayOpacity: 0.45,

  // PLAY pill / button on hover
  playPillBg: "#f5b400",
  playPillBgOpacity: 1,
  playPillBorder: "#f5b400",
  playPillBorderOpacity: 0.4,
  playTextColor: "#000000",
  playTextSize: 13,
  playTextWeight: 800,

  // HOT badge (top-right corner)
  hotBg: "#ef4444",
  hotText: "#ffffff",
  hotTextSize: 11,
  hotWeight: 800,

  // Text below image (game name + provider)
  gameTitleBg: "#1a1a1a",
  gameTitleText: "#f5b400",
  gameTitleSize: 15,
  gameTitleWeight: 700,

  providerText: "#d1d1d1",
  providerOpacity: 0.85,
  providerSize: 12,
  providerWeight: 500,
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
      placeholder="e.g. 0 10px 25px rgba(0,0,0,0.25)"
    />
  </div>
);

const HotGamesColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/hotgames-color");
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

      const res = await api.put("/api/hotgames-color", payload);
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
      ? "Hot Games Section Color Controller (Edit)"
      : "Hot Games Section Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Section Title</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Title Color"
                  value={form.titleColor}
                  onChange={(v) => setVal("titleColor", v)}
                />
                <IntField
                  label="Title Size (px)"
                  value={form.titleSize}
                  onChange={(v) => setVal("titleSize", v)}
                />
                <IntField
                  label="Title Font Weight"
                  value={form.titleWeight}
                  onChange={(v) => setVal("titleWeight", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Game Card</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Card Background"
                  value={form.cardBg}
                  onChange={(v) => setVal("cardBg", v)}
                />
                <NumField
                  label="Card BG Opacity"
                  value={form.cardBgOpacity}
                  onChange={(v) => setVal("cardBgOpacity", v)}
                />
                <IntField
                  label="Card Border Radius (px)"
                  value={form.cardRadius}
                  onChange={(v) => setVal("cardRadius", v)}
                />
                <TextField
                  label="Card Shadow (css value)"
                  value={form.cardShadow}
                  onChange={(v) => setVal("cardShadow", v)}
                />
                <NumField
                  label="Image Hover Scale"
                  value={form.imgHoverScale}
                  onChange={(v) => setVal("imgHoverScale", v)}
                  min={1}
                  max={1.3}
                  step={0.01}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Hover Overlay</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Overlay Background"
                  value={form.overlayBg}
                  onChange={(v) => setVal("overlayBg", v)}
                />
                <NumField
                  label="Overlay Opacity"
                  value={form.overlayOpacity}
                  onChange={(v) => setVal("overlayOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>PLAY Pill / Button</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Pill Background"
                  value={form.playPillBg}
                  onChange={(v) => setVal("playPillBg", v)}
                />
                <NumField
                  label="Pill BG Opacity"
                  value={form.playPillBgOpacity}
                  onChange={(v) => setVal("playPillBgOpacity", v)}
                />
                <ColorField
                  label="Pill Border Color"
                  value={form.playPillBorder}
                  onChange={(v) => setVal("playPillBorder", v)}
                />
                <NumField
                  label="Border Opacity"
                  value={form.playPillBorderOpacity}
                  onChange={(v) => setVal("playPillBorderOpacity", v)}
                />
                <ColorField
                  label="PLAY Text Color"
                  value={form.playTextColor}
                  onChange={(v) => setVal("playTextColor", v)}
                />
                <IntField
                  label="PLAY Text Size (px)"
                  value={form.playTextSize}
                  onChange={(v) => setVal("playTextSize", v)}
                />
                <IntField
                  label="PLAY Text Weight"
                  value={form.playTextWeight}
                  onChange={(v) => setVal("playTextWeight", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>HOT Badge</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="HOT Badge Background"
                  value={form.hotBg}
                  onChange={(v) => setVal("hotBg", v)}
                />
                <ColorField
                  label="HOT Badge Text"
                  value={form.hotText}
                  onChange={(v) => setVal("hotText", v)}
                />
                <IntField
                  label="HOT Text Size (px)"
                  value={form.hotTextSize}
                  onChange={(v) => setVal("hotTextSize", v)}
                />
                <IntField
                  label="HOT Font Weight"
                  value={form.hotWeight}
                  onChange={(v) => setVal("hotWeight", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Game Name & Provider Text</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Game Title Background"
                  value={form.gameTitleBg}
                  onChange={(v) => setVal("gameTitleBg", v)}
                />
                <ColorField
                  label="Game Title Text"
                  value={form.gameTitleText}
                  onChange={(v) => setVal("gameTitleText", v)}
                />
                <IntField
                  label="Game Title Size (px)"
                  value={form.gameTitleSize}
                  onChange={(v) => setVal("gameTitleSize", v)}
                />
                <IntField
                  label="Game Title Weight"
                  value={form.gameTitleWeight}
                  onChange={(v) => setVal("gameTitleWeight", v)}
                />

                <ColorField
                  label="Provider Text Color"
                  value={form.providerText}
                  onChange={(v) => setVal("providerText", v)}
                />
                <NumField
                  label="Provider Opacity"
                  value={form.providerOpacity}
                  onChange={(v) => setVal("providerOpacity", v)}
                />
                <IntField
                  label="Provider Text Size (px)"
                  value={form.providerSize}
                  onChange={(v) => setVal("providerSize", v)}
                />
                <IntField
                  label="Provider Font Weight"
                  value={form.providerWeight}
                  onChange={(v) => setVal("providerWeight", v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotGamesColorController;
