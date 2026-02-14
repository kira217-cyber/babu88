import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Promotions Theme",
  isActive: true,

  // Page level
  pageBg: "#0a0a0a",
  titleText: "#f5b400",

  // Desktop category chips
  chipsWrapBg: "#111111",

  chipActiveBg: "#f5b400",
  chipActiveText: "#000000",
  chipActiveShadowRgba: "rgba(245,180,0,0.35)",

  chipInactiveBg: "#1a1a1a",
  chipInactiveText: "#e0e0e0",
  chipInactiveHoverBg: "#222222",
  chipInactiveHoverOpacity: 1,

  chipTextSize: 14,

  // Mobile button & dropdown
  mobileBtnBg: "#f5b400",
  mobileBtnText: "#000000",
  mobileBtnShadowRgba: "rgba(245,180,0,0.3)",

  mobileDropBg: "#111111",
  mobileDropBorder: "#f5b400",
  mobileDropBorderOpacity: 0.25,

  mobileItemActiveBg: "#f5b400",
  mobileItemActiveText: "#000000",
  mobileItemBg: "#1a1a1a",
  mobileItemText: "#e0e0e0",
  mobileItemHoverBg: "#222222",

  // Promotion cards
  cardBg: "#111111",
  cardBorder: "#f5b400",
  cardBorderOpacity: 0.18,

  imgWrapBg: "#000000",
  imgWrapOpacity: 0.12,

  promoTitleText: "#f5b400",
  promoDescText: "#d1d1d1",
  promoDescTextSize: 14,

  moreBtnBg: "#f5b400",
  moreBtnHoverBg: "#fbbf24",
  moreBtnText: "#000000",
  moreBtnTextSize: 14,

  // Empty / loading states
  boxBg: "#111111",
  boxBorder: "#f5b400",
  boxBorderOpacity: 0.15,

  emptyTitleText: "#f5b400",
  emptyDescText: "#b3b3b3",
  loadingText: "#e0e0e0",

  // Modal
  modalOverlayOpacity: 0.65,
  modalPanelBg: "#0f0f0f",

  modalCloseBg: "#f5b400",
  modalCloseIcon: "#000000",

  modalHeadingText: "#f5b400",
  modalBodyText: "#e0e0e0",
  modalBodyTextSize: 14,
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
        placeholder="#rrggbb or rgba(...)"
      />
      {String(value || "").startsWith("#") ? (
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg cursor-pointer border border-yellow-900/50 bg-black/40"
          title={label}
        />
      ) : (
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg border border-yellow-900/50 bg-black/40 grid place-items-center text-[10px] text-yellow-100/60">
          RGBA
        </div>
      )}
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

const PromotionsColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/promotions-color");
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

      const res = await api.put("/api/promotions-color", payload);
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
      ? "Promotions Page Color Controller (Edit)"
      : "Promotions Page Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Page & Titles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Page Background"
                  value={form.pageBg}
                  onChange={(v) => setVal("pageBg", v)}
                />
                <ColorField
                  label="Main Title Text"
                  value={form.titleText}
                  onChange={(v) => setVal("titleText", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Desktop Category Chips</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Chips Wrapper BG"
                  value={form.chipsWrapBg}
                  onChange={(v) => setVal("chipsWrapBg", v)}
                />

                <ColorField
                  label="Active Chip BG"
                  value={form.chipActiveBg}
                  onChange={(v) => setVal("chipActiveBg", v)}
                />
                <ColorField
                  label="Active Chip Text"
                  value={form.chipActiveText}
                  onChange={(v) => setVal("chipActiveText", v)}
                />
                <ColorField
                  label="Active Chip Shadow (RGBA)"
                  value={form.chipActiveShadowRgba}
                  onChange={(v) => setVal("chipActiveShadowRgba", v)}
                />

                <ColorField
                  label="Inactive Chip BG"
                  value={form.chipInactiveBg}
                  onChange={(v) => setVal("chipInactiveBg", v)}
                />
                <ColorField
                  label="Inactive Chip Text"
                  value={form.chipInactiveText}
                  onChange={(v) => setVal("chipInactiveText", v)}
                />
                <ColorField
                  label="Inactive Hover BG"
                  value={form.chipInactiveHoverBg}
                  onChange={(v) => setVal("chipInactiveHoverBg", v)}
                />
                <NumField
                  label="Inactive Hover Opacity"
                  value={form.chipInactiveHoverOpacity}
                  onChange={(v) => setVal("chipInactiveHoverOpacity", v)}
                />

                <IntField
                  label="Chip Text Size (px)"
                  value={form.chipTextSize}
                  onChange={(v) => setVal("chipTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Mobile Dropdown & Button</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Mobile Button BG"
                  value={form.mobileBtnBg}
                  onChange={(v) => setVal("mobileBtnBg", v)}
                />
                <ColorField
                  label="Mobile Button Text"
                  value={form.mobileBtnText}
                  onChange={(v) => setVal("mobileBtnText", v)}
                />
                <ColorField
                  label="Mobile Button Shadow (RGBA)"
                  value={form.mobileBtnShadowRgba}
                  onChange={(v) => setVal("mobileBtnShadowRgba", v)}
                />

                <ColorField
                  label="Dropdown Background"
                  value={form.mobileDropBg}
                  onChange={(v) => setVal("mobileDropBg", v)}
                />
                <ColorField
                  label="Dropdown Border"
                  value={form.mobileDropBorder}
                  onChange={(v) => setVal("mobileDropBorder", v)}
                />
                <NumField
                  label="Dropdown Border Opacity"
                  value={form.mobileDropBorderOpacity}
                  onChange={(v) => setVal("mobileDropBorderOpacity", v)}
                />

                <ColorField
                  label="Active Item BG"
                  value={form.mobileItemActiveBg}
                  onChange={(v) => setVal("mobileItemActiveBg", v)}
                />
                <ColorField
                  label="Active Item Text"
                  value={form.mobileItemActiveText}
                  onChange={(v) => setVal("mobileItemActiveText", v)}
                />

                <ColorField
                  label="Item Background"
                  value={form.mobileItemBg}
                  onChange={(v) => setVal("mobileItemBg", v)}
                />
                <ColorField
                  label="Item Text"
                  value={form.mobileItemText}
                  onChange={(v) => setVal("mobileItemText", v)}
                />
                <ColorField
                  label="Item Hover BG"
                  value={form.mobileItemHoverBg}
                  onChange={(v) => setVal("mobileItemHoverBg", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Promotion Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

                <ColorField
                  label="Image Wrapper BG"
                  value={form.imgWrapBg}
                  onChange={(v) => setVal("imgWrapBg", v)}
                />
                <NumField
                  label="Image Wrapper Opacity"
                  value={form.imgWrapOpacity}
                  onChange={(v) => setVal("imgWrapOpacity", v)}
                />

                <ColorField
                  label="Promo Title Text"
                  value={form.promoTitleText}
                  onChange={(v) => setVal("promoTitleText", v)}
                />
                <ColorField
                  label="Promo Description Text"
                  value={form.promoDescText}
                  onChange={(v) => setVal("promoDescText", v)}
                />
                <IntField
                  label="Promo Desc Size (px)"
                  value={form.promoDescTextSize}
                  onChange={(v) => setVal("promoDescTextSize", v)}
                />

                <ColorField
                  label="More Button BG"
                  value={form.moreBtnBg}
                  onChange={(v) => setVal("moreBtnBg", v)}
                />
                <ColorField
                  label="More Button Hover BG"
                  value={form.moreBtnHoverBg}
                  onChange={(v) => setVal("moreBtnHoverBg", v)}
                />
                <ColorField
                  label="More Button Text"
                  value={form.moreBtnText}
                  onChange={(v) => setVal("moreBtnText", v)}
                />
                <IntField
                  label="More Button Text Size (px)"
                  value={form.moreBtnTextSize}
                  onChange={(v) => setVal("moreBtnTextSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Empty / Loading States</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <ColorField
                  label="Box Background"
                  value={form.boxBg}
                  onChange={(v) => setVal("boxBg", v)}
                />
                <ColorField
                  label="Box Border Color"
                  value={form.boxBorder}
                  onChange={(v) => setVal("boxBorder", v)}
                />
                <NumField
                  label="Box Border Opacity"
                  value={form.boxBorderOpacity}
                  onChange={(v) => setVal("boxBorderOpacity", v)}
                />

                <ColorField
                  label="Empty Title Text"
                  value={form.emptyTitleText}
                  onChange={(v) => setVal("emptyTitleText", v)}
                />
                <ColorField
                  label="Empty Description Text"
                  value={form.emptyDescText}
                  onChange={(v) => setVal("emptyDescText", v)}
                />
                <ColorField
                  label="Loading Text Color"
                  value={form.loadingText}
                  onChange={(v) => setVal("loadingText", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Modal Appearance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <NumField
                  label="Modal Overlay Opacity"
                  value={form.modalOverlayOpacity}
                  onChange={(v) => setVal("modalOverlayOpacity", v)}
                />
                <ColorField
                  label="Modal Panel Background"
                  value={form.modalPanelBg}
                  onChange={(v) => setVal("modalPanelBg", v)}
                />

                <ColorField
                  label="Close Button BG"
                  value={form.modalCloseBg}
                  onChange={(v) => setVal("modalCloseBg", v)}
                />
                <ColorField
                  label="Close Icon Color"
                  value={form.modalCloseIcon}
                  onChange={(v) => setVal("modalCloseIcon", v)}
                />

                <ColorField
                  label="Modal Heading Text"
                  value={form.modalHeadingText}
                  onChange={(v) => setVal("modalHeadingText", v)}
                />
                <ColorField
                  label="Modal Body Text"
                  value={form.modalBodyText}
                  onChange={(v) => setVal("modalBodyText", v)}
                />
                <IntField
                  label="Modal Body Text Size (px)"
                  value={form.modalBodyTextSize}
                  onChange={(v) => setVal("modalBodyTextSize", v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsColorController;
