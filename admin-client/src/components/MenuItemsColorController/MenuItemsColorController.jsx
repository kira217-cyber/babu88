import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Menu Theme",
  isActive: true,

  barBg: "#0f0f0f",

  itemText: "#e0e0e0",
  itemTextOpacity: 0.95,
  itemTextSize: 15,

  itemHoverText: "#ffffff",

  activeBg: "#f5b400",
  activeText: "#000000",

  dropdownOpenBg: "#000000",
  dropdownOpenBgOpacity: 0.4,

  megaPanelBg: "#0a0a0a",
  megaPanelBgOpacity: 0.92,
  megaPanelBorder: "#f5b400",
  megaPanelBorderOpacity: 0.18,

  cardBg: "#111111",
  cardBgOpacity: 1,
  cardBorder: "#ffffff",
  cardBorderOpacity: 0.08,

  cardHoverBg: "#1a1a1a",
  cardHoverBgOpacity: 1,
  cardHoverBorder: "#f5b400",
  cardHoverBorderOpacity: 0.5,

  divider: "#ffffff",
  dividerOpacity: 0.07,

  badgeNewBg: "#22c55e",
  badgeNewText: "#ffffff",
  badgeHotBg: "#ef4444",
  badgeHotText: "#ffffff",
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

const IntField = ({ label, value, onChange, min = 10, max = 24 }) => (
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

const MenuItemsColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/menuitems-color");
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

      const res = await api.put("/api/menuitems-color", payload);
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
      ? "Menu Items & Topbar Color Controller (Edit)"
      : "Menu Items & Topbar Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Top Navigation Bar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField
                  label="Bar Background"
                  value={form.barBg}
                  onChange={(v) => setVal("barBg", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Menu Item Text</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Default Text"
                  value={form.itemText}
                  onChange={(v) => setVal("itemText", v)}
                />
                <ColorField
                  label="Hover Text"
                  value={form.itemHoverText}
                  onChange={(v) => setVal("itemHoverText", v)}
                />
                <IntField
                  label="Text Size (px)"
                  value={form.itemTextSize}
                  onChange={(v) => setVal("itemTextSize", v)}
                />
                <NumField
                  label="Text Opacity (0–1)"
                  value={form.itemTextOpacity}
                  onChange={(v) => setVal("itemTextOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Active / Selected Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField
                  label="Active Background"
                  value={form.activeBg}
                  onChange={(v) => setVal("activeBg", v)}
                />
                <ColorField
                  label="Active Text"
                  value={form.activeText}
                  onChange={(v) => setVal("activeText", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>
                Dropdown / Mega Menu (when open)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Background Color"
                  value={form.dropdownOpenBg}
                  onChange={(v) => setVal("dropdownOpenBg", v)}
                />
                <NumField
                  label="Background Opacity"
                  value={form.dropdownOpenBgOpacity}
                  onChange={(v) => setVal("dropdownOpenBgOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Mega Menu Panel</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Panel Background"
                  value={form.megaPanelBg}
                  onChange={(v) => setVal("megaPanelBg", v)}
                />
                <NumField
                  label="Panel BG Opacity"
                  value={form.megaPanelBgOpacity}
                  onChange={(v) => setVal("megaPanelBgOpacity", v)}
                />
                <ColorField
                  label="Panel Border"
                  value={form.megaPanelBorder}
                  onChange={(v) => setVal("megaPanelBorder", v)}
                />
                <NumField
                  label="Border Opacity"
                  value={form.megaPanelBorderOpacity}
                  onChange={(v) => setVal("megaPanelBorderOpacity", v)}
                />
                <ColorField
                  label="Divider Color"
                  value={form.divider}
                  onChange={(v) => setVal("divider", v)}
                />
                <NumField
                  label="Divider Opacity"
                  value={form.dividerOpacity}
                  onChange={(v) => setVal("dividerOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Provider / Game Cards</h3>
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
                <ColorField
                  label="Card Border"
                  value={form.cardBorder}
                  onChange={(v) => setVal("cardBorder", v)}
                />
                <NumField
                  label="Border Opacity"
                  value={form.cardBorderOpacity}
                  onChange={(v) => setVal("cardBorderOpacity", v)}
                />
                <ColorField
                  label="Hover Background"
                  value={form.cardHoverBg}
                  onChange={(v) => setVal("cardHoverBg", v)}
                />
                <NumField
                  label="Hover BG Opacity"
                  value={form.cardHoverBgOpacity}
                  onChange={(v) => setVal("cardHoverBgOpacity", v)}
                />
                <ColorField
                  label="Hover Border"
                  value={form.cardHoverBorder}
                  onChange={(v) => setVal("cardHoverBorder", v)}
                />
                <NumField
                  label="Hover Border Opacity"
                  value={form.cardHoverBorderOpacity}
                  onChange={(v) => setVal("cardHoverBorderOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Badges (NEW / HOT)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField
                  label="NEW Badge Background"
                  value={form.badgeNewBg}
                  onChange={(v) => setVal("badgeNewBg", v)}
                />
                <ColorField
                  label="NEW Badge Text"
                  value={form.badgeNewText}
                  onChange={(v) => setVal("badgeNewText", v)}
                />
                <ColorField
                  label="HOT Badge Background"
                  value={form.badgeHotBg}
                  onChange={(v) => setVal("badgeHotBg", v)}
                />
                <ColorField
                  label="HOT Badge Text"
                  value={form.badgeHotText}
                  onChange={(v) => setVal("badgeHotText", v)}
                />
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default MenuItemsColorController;
