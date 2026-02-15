import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Balance Theme",
  isActive: true,

  // Main section / balance card wrapper
  sectionBg: "#111111",
  sectionBorderColor: "#f5b400",
  sectionBorderOpacity: 0.25,

  // Balance pill (main amount display)
  pillBg: "#1a1a1a",
  pillBorderColor: "#f5b400",
  pillBorderOpacity: 0.3,
  pillRadius: 999,
  pillPaddingX: 16,
  pillPaddingY: 10,
  pillShadow: "0 4px 12px rgba(245,180,0,0.15)",

  // Currency symbol & amount text
  currencyColor: "#f5b400",
  currencyOpacity: 0.9,
  currencySize: 14,
  currencyWeight: 700,

  amountColor: "#ffffff",
  amountSize: 18,
  amountWeight: 800,

  // Refresh button (circular icon button)
  refreshBtnBg: "#1a1a1a",
  refreshBtnBorderColor: "#f5b400",
  refreshBtnBorderOpacity: 0.35,
  refreshBtnSize: 36,
  refreshBtnRadius: 999,
  refreshIconColor: "#f5b400",
  refreshIconOpacity: 0.9,
  refreshIconSize: 18,

  // Action buttons (Deposit / Withdraw icons + labels)
  actionIconBoxBg: "#1a1a1a",
  actionIconBoxSize: 48,
  actionIconBoxRadius: 12,
  actionIconColor: "#f5b400",
  actionIconSize: 22,

  actionLabelColor: "#e0e0e0",
  actionLabelOpacity: 0.9,
  actionLabelSize: 12,
  actionLabelWeight: 600,
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
      placeholder="e.g. 0 4px 12px rgba(245,180,0,0.15)"
    />
  </div>
);

const BalanceColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/balance-color");
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

      const res = await api.put("/api/balance-color", payload);
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
      ? "Balance Display Color Controller (Edit)"
      : "Balance Display Color Controller (Create New)";
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
              <h3 className={sectionTitleCls}>Balance Section Wrapper</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Section Background"
                  value={form.sectionBg}
                  onChange={(v) => setVal("sectionBg", v)}
                />
                <ColorField
                  label="Section Border Color"
                  value={form.sectionBorderColor}
                  onChange={(v) => setVal("sectionBorderColor", v)}
                />
                <NumField
                  label="Section Border Opacity"
                  value={form.sectionBorderOpacity}
                  onChange={(v) => setVal("sectionBorderOpacity", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Balance Pill (Main Display)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Pill Background"
                  value={form.pillBg}
                  onChange={(v) => setVal("pillBg", v)}
                />
                <ColorField
                  label="Pill Border Color"
                  value={form.pillBorderColor}
                  onChange={(v) => setVal("pillBorderColor", v)}
                />
                <NumField
                  label="Pill Border Opacity"
                  value={form.pillBorderOpacity}
                  onChange={(v) => setVal("pillBorderOpacity", v)}
                />
                <IntField
                  label="Pill Border Radius (px)"
                  value={form.pillRadius}
                  onChange={(v) => setVal("pillRadius", v)}
                />
                <IntField
                  label="Pill Padding X (px)"
                  value={form.pillPaddingX}
                  onChange={(v) => setVal("pillPaddingX", v)}
                />
                <IntField
                  label="Pill Padding Y (px)"
                  value={form.pillPaddingY}
                  onChange={(v) => setVal("pillPaddingY", v)}
                />
                <TextField
                  label="Pill Shadow (css)"
                  value={form.pillShadow}
                  onChange={(v) => setVal("pillShadow", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Currency & Amount Text</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Currency Symbol Color"
                  value={form.currencyColor}
                  onChange={(v) => setVal("currencyColor", v)}
                />
                <NumField
                  label="Currency Opacity"
                  value={form.currencyOpacity}
                  onChange={(v) => setVal("currencyOpacity", v)}
                />
                <IntField
                  label="Currency Size (px)"
                  value={form.currencySize}
                  onChange={(v) => setVal("currencySize", v)}
                />
                <IntField
                  label="Currency Font Weight"
                  value={form.currencyWeight}
                  onChange={(v) => setVal("currencyWeight", v)}
                />

                <ColorField
                  label="Amount Color"
                  value={form.amountColor}
                  onChange={(v) => setVal("amountColor", v)}
                />
                <IntField
                  label="Amount Size (px)"
                  value={form.amountSize}
                  onChange={(v) => setVal("amountSize", v)}
                />
                <IntField
                  label="Amount Font Weight"
                  value={form.amountWeight}
                  onChange={(v) => setVal("amountWeight", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Refresh Button (Circular)</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Refresh Button BG"
                  value={form.refreshBtnBg}
                  onChange={(v) => setVal("refreshBtnBg", v)}
                />
                <ColorField
                  label="Refresh Border Color"
                  value={form.refreshBtnBorderColor}
                  onChange={(v) => setVal("refreshBtnBorderColor", v)}
                />
                <NumField
                  label="Refresh Border Opacity"
                  value={form.refreshBtnBorderOpacity}
                  onChange={(v) => setVal("refreshBtnBorderOpacity", v)}
                />
                <IntField
                  label="Refresh Button Size (px)"
                  value={form.refreshBtnSize}
                  onChange={(v) => setVal("refreshBtnSize", v)}
                />
                <IntField
                  label="Refresh Border Radius (px)"
                  value={form.refreshBtnRadius}
                  onChange={(v) => setVal("refreshBtnRadius", v)}
                />
                <ColorField
                  label="Refresh Icon Color"
                  value={form.refreshIconColor}
                  onChange={(v) => setVal("refreshIconColor", v)}
                />
                <NumField
                  label="Refresh Icon Opacity"
                  value={form.refreshIconOpacity}
                  onChange={(v) => setVal("refreshIconOpacity", v)}
                />
                <IntField
                  label="Refresh Icon Size (px)"
                  value={form.refreshIconSize}
                  onChange={(v) => setVal("refreshIconSize", v)}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>
                Action Buttons (Deposit/Withdraw etc.)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Icon Box Background"
                  value={form.actionIconBoxBg}
                  onChange={(v) => setVal("actionIconBoxBg", v)}
                />
                <IntField
                  label="Icon Box Size (px)"
                  value={form.actionIconBoxSize}
                  onChange={(v) => setVal("actionIconBoxSize", v)}
                />
                <IntField
                  label="Icon Box Radius (px)"
                  value={form.actionIconBoxRadius}
                  onChange={(v) => setVal("actionIconBoxRadius", v)}
                />
                <ColorField
                  label="Action Icon Color"
                  value={form.actionIconColor}
                  onChange={(v) => setVal("actionIconColor", v)}
                />
                <IntField
                  label="Action Icon Size (px)"
                  value={form.actionIconSize}
                  onChange={(v) => setVal("actionIconSize", v)}
                />

                <ColorField
                  label="Action Label Color"
                  value={form.actionLabelColor}
                  onChange={(v) => setVal("actionLabelColor", v)}
                />
                <NumField
                  label="Action Label Opacity"
                  value={form.actionLabelOpacity}
                  onChange={(v) => setVal("actionLabelOpacity", v)}
                />
                <IntField
                  label="Action Label Size (px)"
                  value={form.actionLabelSize}
                  onChange={(v) => setVal("actionLabelSize", v)}
                />
                <IntField
                  label="Action Label Weight"
                  value={form.actionLabelWeight}
                  onChange={(v) => setVal("actionLabelWeight", v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceColorController;
