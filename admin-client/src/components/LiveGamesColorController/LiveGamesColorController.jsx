import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Live Games Theme",
  isActive: true,

  // Card (match card / fixture style)
  cardBg: "#111111",
  cardBorder: "#f5b400",
  cardBorderOpacity: 0.22,

  // Top bar of each card
  topBarBg: "#1a1a1a",
  titleText: "#e0e0e0",
  titleTextSize: 13,

  // Date / time / league name
  datetimeText: "#b3b3b3",
  datetimeOpacity: 0.9,
  datetimeTextSize: 12,

  // Team names
  teamNameText: "#ffffff",
  teamNameTextSize: 14,

  // Score / vs dash
  scoreText: "#f5b400",
  scoreTextSize: 15,

  dashText: "#f5b400",
  dashOpacity: 0.45,
  dashTextSize: 14,

  // Status badges
  badgeUpcomingBg: "#4b5563",
  badgeUpcomingText: "#e5e7eb",

  badgeLiveBg: "#ef4444",
  badgeLiveText: "#ffffff",

  badgeTextSize: 11,

  // Scrollbar (custom scrollbar for long list)
  scrollbarTrack: "#1a1a1a",
  scrollbarThumbFrom: "#f5b400",
  scrollbarThumbTo: "#d97706",
  scrollbarHoverFrom: "#fbbf24",
  scrollbarHoverTo: "#d97706",
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

const LiveGamesColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/livegames-color");
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

      const res = await api.put("/api/livegames-color", payload);
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
      ? "Live Games Card Color Controller (Edit)"
      : "Live Games Card Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Live Game Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Card Background"
                  value={form.cardBg}
                  onChange={(v) => setVal("cardBg", v)}
                />
                <ColorField
                  label="Card Border Color"
                  value={form.cardBorder}
                  onChange={(v) => setVal("cardBorder", v)}
                />
                <NumField
                  label="Card Border Opacity"
                  value={form.cardBorderOpacity}
                  onChange={(v) => setVal("cardBorderOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Top Bar (League / Title)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Top Bar Background"
                  value={form.topBarBg}
                  onChange={(v) => setVal("topBarBg", v)}
                />
                <ColorField
                  label="Title Text Color"
                  value={form.titleText}
                  onChange={(v) => setVal("titleText", v)}
                />
                <IntField
                  label="Title Text Size (px)"
                  value={form.titleTextSize}
                  onChange={(v) => setVal("titleTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Date / Time / League Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Datetime Text Color"
                  value={form.datetimeText}
                  onChange={(v) => setVal("datetimeText", v)}
                />
                <NumField
                  label="Datetime Opacity"
                  value={form.datetimeOpacity}
                  onChange={(v) => setVal("datetimeOpacity", v)}
                />
                <IntField
                  label="Datetime Text Size (px)"
                  value={form.datetimeTextSize}
                  onChange={(v) => setVal("datetimeTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Team & Score Row</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Team Name Color"
                  value={form.teamNameText}
                  onChange={(v) => setVal("teamNameText", v)}
                />
                <IntField
                  label="Team Name Size (px)"
                  value={form.teamNameTextSize}
                  onChange={(v) => setVal("teamNameTextSize", v)}
                />

                <ColorField
                  label="Score Color"
                  value={form.scoreText}
                  onChange={(v) => setVal("scoreText", v)}
                />
                <IntField
                  label="Score Size (px)"
                  value={form.scoreTextSize}
                  onChange={(v) => setVal("scoreTextSize", v)}
                />

                <ColorField
                  label="Dash / VS Color"
                  value={form.dashText}
                  onChange={(v) => setVal("dashText", v)}
                />
                <NumField
                  label="Dash Opacity"
                  value={form.dashOpacity}
                  onChange={(v) => setVal("dashOpacity", v)}
                />
                <IntField
                  label="Dash Size (px)"
                  value={form.dashTextSize}
                  onChange={(v) => setVal("dashTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Status Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Upcoming Badge BG"
                  value={form.badgeUpcomingBg}
                  onChange={(v) => setVal("badgeUpcomingBg", v)}
                />
                <ColorField
                  label="Upcoming Badge Text"
                  value={form.badgeUpcomingText}
                  onChange={(v) => setVal("badgeUpcomingText", v)}
                />

                <ColorField
                  label="Live Badge BG"
                  value={form.badgeLiveBg}
                  onChange={(v) => setVal("badgeLiveBg", v)}
                />
                <ColorField
                  label="Live Badge Text"
                  value={form.badgeLiveText}
                  onChange={(v) => setVal("badgeLiveText", v)}
                />

                <IntField
                  label="Badge Text Size (px)"
                  value={form.badgeTextSize}
                  onChange={(v) => setVal("badgeTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Custom Scrollbar</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Track Color"
                  value={form.scrollbarTrack}
                  onChange={(v) => setVal("scrollbarTrack", v)}
                />
                <ColorField
                  label="Thumb Gradient From"
                  value={form.scrollbarThumbFrom}
                  onChange={(v) => setVal("scrollbarThumbFrom", v)}
                />
                <ColorField
                  label="Thumb Gradient To"
                  value={form.scrollbarThumbTo}
                  onChange={(v) => setVal("scrollbarThumbTo", v)}
                />
                <ColorField
                  label="Hover Gradient From"
                  value={form.scrollbarHoverFrom}
                  onChange={(v) => setVal("scrollbarHoverFrom", v)}
                />
                <ColorField
                  label="Hover Gradient To"
                  value={form.scrollbarHoverTo}
                  onChange={(v) => setVal("scrollbarHoverTo", v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGamesColorController;
