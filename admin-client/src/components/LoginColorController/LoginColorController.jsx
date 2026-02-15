import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Login Theme",
  isActive: true,

  // Desktop styles
  desktopPageBg: "#0a0a0a",
  desktopTitleColor: "#f5b400",
  desktopSubColor: "#e0e0e0",
  desktopSubOpacity: 0.85,

  desktopCardBg: "#111111",
  desktopCardBorderColor: "#f5b400",
  desktopCardBorderOpacity: 0.22,

  desktopLabelColor: "#e0e0e0",
  desktopLabelSize: 14,
  desktopLabelWeight: 600,

  desktopRequiredColor: "#ef4444",

  desktopInputBg: "#1a1a1a",
  desktopInputTextColor: "#ffffff",
  desktopInputTextSize: 14,
  desktopInputBorderColor: "#f5b400",
  desktopInputBorderOpacity: 0.35,
  desktopInputErrorBorderColor: "#ef4444",

  desktopEyeColor: "#f5b400",
  desktopEyeOpacity: 0.8,

  desktopLoginBtnBg: "#f5b400",
  desktopLoginBtnText: "#000000",
  desktopLoginBtnTextSize: 15,

  desktopForgotColor: "#fbbf24",
  desktopRegisterColor: "#fbbf24",

  desktopHelpColor: "#d1d1d1",
  desktopHelpOpacity: 0.75,

  desktopDividerColor: "#f5b400",
  desktopDividerOpacity: 0.18,

  // Mobile styles
  mobilePageBg: "#000000",

  mobileTopBarBg: "#0f0f0f",
  mobileTopBarTextColor: "#f5b400",
  mobileTopBarTextSize: 16,

  mobileForgotColor: "#fbbf24",
  mobileForgotOpacity: 0.85,

  mobileLoginBtnBg: "#f5b400",
  mobileLoginBtnText: "#000000",
  mobileLoginBtnTextSize: 15,

  mobileSignupBtnBg: "#1a1a1a",
  mobileSignupBtnText: "#f5b400",
  mobileSignupBtnTextSize: 15,

  mobileMutedTextColor: "#d1d1d1",
  mobileMutedTextOpacity: 0.7,
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

const IntField = ({ label, value, onChange, min = 8, max = 60 }) => (
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

const LoginColorController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/login-color");
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

      const res = await api.put("/api/login-color", payload);
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
      ? "Login Page Color Controller (Edit)"
      : "Login Page Color Controller (Create New)";
  }, [docId, loading]);

  const groups = useMemo(
    () => [
      {
        title: "Desktop Page & Card",
        fields: [
          { key: "desktopPageBg", label: "Page Background", type: "color" },
          { key: "desktopCardBg", label: "Card Background", type: "color" },
          {
            key: "desktopCardBorderColor",
            label: "Card Border Color",
            type: "color",
          },
          {
            key: "desktopCardBorderOpacity",
            label: "Card Border Opacity",
            type: "num",
          },
        ],
      },
      {
        title: "Desktop Text & Labels",
        fields: [
          { key: "desktopTitleColor", label: "Title Color", type: "color" },
          { key: "desktopSubColor", label: "Subtitle Color", type: "color" },
          { key: "desktopSubOpacity", label: "Subtitle Opacity", type: "num" },
          { key: "desktopLabelColor", label: "Label Color", type: "color" },
          {
            key: "desktopLabelSize",
            label: "Label Size (px)",
            type: "int",
            min: 10,
            max: 24,
          },
          {
            key: "desktopLabelWeight",
            label: "Label Weight",
            type: "int",
            min: 100,
            max: 900,
          },
          {
            key: "desktopRequiredColor",
            label: "Required * Color",
            type: "color",
          },
          {
            key: "desktopForgotColor",
            label: "Forgot Password Color",
            type: "color",
          },
          {
            key: "desktopRegisterColor",
            label: "Register Link Color",
            type: "color",
          },
          { key: "desktopHelpColor", label: "Help Text Color", type: "color" },
          { key: "desktopHelpOpacity", label: "Help Opacity", type: "num" },
          { key: "desktopDividerColor", label: "Divider Color", type: "color" },
          {
            key: "desktopDividerOpacity",
            label: "Divider Opacity",
            type: "num",
          },
        ],
      },
      {
        title: "Desktop Inputs & Eye Icon",
        fields: [
          { key: "desktopInputBg", label: "Input Background", type: "color" },
          {
            key: "desktopInputTextColor",
            label: "Input Text Color",
            type: "color",
          },
          {
            key: "desktopInputTextSize",
            label: "Input Text Size (px)",
            type: "int",
            min: 10,
            max: 24,
          },
          {
            key: "desktopInputBorderColor",
            label: "Input Border Color",
            type: "color",
          },
          {
            key: "desktopInputBorderOpacity",
            label: "Input Border Opacity",
            type: "num",
          },
          {
            key: "desktopInputErrorBorderColor",
            label: "Error Border Color",
            type: "color",
          },
          { key: "desktopEyeColor", label: "Eye Icon Color", type: "color" },
          { key: "desktopEyeOpacity", label: "Eye Icon Opacity", type: "num" },
        ],
      },
      {
        title: "Desktop Login Button",
        fields: [
          { key: "desktopLoginBtnBg", label: "Login Button BG", type: "color" },
          {
            key: "desktopLoginBtnText",
            label: "Login Button Text",
            type: "color",
          },
          {
            key: "desktopLoginBtnTextSize",
            label: "Login Button Text Size (px)",
            type: "int",
            min: 12,
            max: 30,
          },
        ],
      },
      {
        title: "Mobile Styles",
        fields: [
          {
            key: "mobilePageBg",
            label: "Mobile Page Background",
            type: "color",
          },
          { key: "mobileTopBarBg", label: "Mobile Top Bar BG", type: "color" },
          {
            key: "mobileTopBarTextColor",
            label: "Top Bar Text Color",
            type: "color",
          },
          {
            key: "mobileTopBarTextSize",
            label: "Top Bar Text Size (px)",
            type: "int",
            min: 12,
            max: 28,
          },
          {
            key: "mobileForgotColor",
            label: "Forgot Link Color",
            type: "color",
          },
          {
            key: "mobileForgotOpacity",
            label: "Forgot Link Opacity",
            type: "num",
          },
          {
            key: "mobileLoginBtnBg",
            label: "Mobile Login Button BG",
            type: "color",
          },
          {
            key: "mobileLoginBtnText",
            label: "Mobile Login Button Text",
            type: "color",
          },
          {
            key: "mobileLoginBtnTextSize",
            label: "Mobile Login Text Size (px)",
            type: "int",
            min: 12,
            max: 28,
          },
          {
            key: "mobileSignupBtnBg",
            label: "Mobile Signup Button BG",
            type: "color",
          },
          {
            key: "mobileSignupBtnText",
            label: "Mobile Signup Button Text",
            type: "color",
          },
          {
            key: "mobileSignupBtnTextSize",
            label: "Mobile Signup Text Size (px)",
            type: "int",
            min: 12,
            max: 28,
          },
          {
            key: "mobileMutedTextColor",
            label: "Muted Text Color",
            type: "color",
          },
          {
            key: "mobileMutedTextOpacity",
            label: "Muted Text Opacity",
            type: "num",
          },
        ],
      },
    ],
    [],
  );

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

          {/* Grouped Sections */}
          <div className="space-y-10 sm:space-y-12">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className={sectionTitleCls}>{group.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                  {group.fields.map((field) => {
                    if (field.type === "color") {
                      return (
                        <ColorField
                          key={field.key}
                          label={field.label}
                          value={form[field.key]}
                          onChange={(v) => setVal(field.key, v)}
                        />
                      );
                    }
                    if (field.type === "num") {
                      return (
                        <NumField
                          key={field.key}
                          label={field.label}
                          value={form[field.key]}
                          onChange={(v) => setVal(field.key, v)}
                        />
                      );
                    }
                    if (field.type === "int") {
                      return (
                        <IntField
                          key={field.key}
                          label={field.label}
                          value={form[field.key]}
                          onChange={(v) => setVal(field.key, v)}
                          min={field.min}
                          max={field.max}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginColorController;
