import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default Registration Theme",
  isActive: true,

  mobileBannerUrl: "",
  desktopBannerUrl: "",

  // Mobile Topbar
  mobTopbarBg: "#0f0f0f",
  mobTopbarTextColor: "#f5b400",
  mobTopbarTextSizePx: 16,

  // Mobile Primary Button (Login / Continue)
  mobPrimaryBtnBg: "#f5b400",
  mobPrimaryBtnTextColor: "#000000",
  mobPrimaryBtnTextSizePx: 15,

  // Mobile Yellow Button (e.g. Google / Other)
  mobYellowBtnBg: "#fbbf24",
  mobYellowBtnTextColor: "#000000",
  mobYellowBtnTextSizePx: 15,

  // Mobile Stepper (progress dots/lines)
  mobStepperActiveBg: "#f5b400",
  mobStepperInactiveBg: "#333333",
  mobStepperLineActiveBg: "#f5b400",
  mobStepperLineInactiveBg: "#444444",
  mobStepperTickColor: "#000000",

  // Desktop Page & Card
  deskPageBg: "#0a0a0a",
  deskCardBg: "#111111",
  deskTitleColor: "#f5b400",
  deskSubTitleColor: "#e0e0e0",

  // Desktop Register Button
  deskRegisterBtnBg: "#f5b400",
  deskRegisterBtnTextColor: "#000000",
  deskRegisterBtnTextSizePx: 16,

  // Desktop Verification Code Box
  deskVcodeBoxBg: "#1a1a1a",
  deskVcodeBoxTextColor: "#ffffff",
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

const RegisterController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [mobPreview, setMobPreview] = useState("");
  const [deskPreview, setDeskPreview] = useState("");

  const setVal = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/register-config");
      if (!res.data) {
        setDocId(null);
        setForm(defaults);
        setMobPreview("");
        setDeskPreview("");
        return;
      }
      setDocId(res.data._id);
      const cleaned = { ...defaults, ...res.data };
      delete cleaned.__v;
      delete cleaned.createdAt;
      delete cleaned.updatedAt;
      setForm(cleaned);

      // Set previews
      setMobPreview(
        cleaned.mobileBannerUrl
          ? `${api.defaults.baseURL}${cleaned.mobileBannerUrl}`
          : "",
      );
      setDeskPreview(
        cleaned.desktopBannerUrl
          ? `${api.defaults.baseURL}${cleaned.desktopBannerUrl}`
          : "",
      );
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

      const res = await api.put("/api/register-config", payload);
      setDocId(res.data._id || docId);
      toast.success(docId ? "Updated successfully" : "Created successfully");
      await loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleMobileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);

      const { data } = await api.post(
        "/api/register-config/upload-mobile-banner",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const fullUrl = data?.mobileBannerUrl?.startsWith("http")
        ? data.mobileBannerUrl
        : `${api.defaults.baseURL}${data.mobileBannerUrl || ""}`;

      setVal("mobileBannerUrl", data?.mobileBannerUrl || "");
      setMobPreview(fullUrl);
      toast.success("Mobile banner uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDesktopUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);

      const { data } = await api.post(
        "/api/register-config/upload-desktop-banner",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const fullUrl = data?.desktopBannerUrl?.startsWith("http")
        ? data.desktopBannerUrl
        : `${api.defaults.baseURL}${data.desktopBannerUrl || ""}`;

      setVal("desktopBannerUrl", data?.desktopBannerUrl || "");
      setDeskPreview(fullUrl);
      toast.success("Desktop banner uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const headerText = useMemo(() => {
    if (loading) return "Loading configuration...";
    return docId
      ? "Registration Page Color Controller (Edit)"
      : "Registration Page Color Controller (Create)";
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
              disabled={loading || saving || uploading}
            >
              Refresh
            </button>
            <button
              className={btnPrimary}
              onClick={handleSave}
              disabled={loading || saving || uploading}
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

          {/* Banner Uploads + Previews */}
          <div className="mb-10">
            <h3 className={sectionTitleCls}>
              Banner Images (Mobile & Desktop)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Mobile Banner */}
              <div>
                <label className={labelCls}>Mobile Banner Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-yellow-100/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/20 file:text-yellow-400 hover:file:bg-yellow-500/30"
                  onChange={handleMobileUpload}
                  disabled={uploading}
                />
                <p className="mt-2 text-xs text-yellow-100/50">
                  {uploading ? "Uploading..." : "Recommended: 360–420px wide"}
                </p>

                {mobPreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-yellow-900/40 bg-black/40 h-40 flex items-center justify-center">
                    <img
                      src={mobPreview}
                      alt="Mobile Banner Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Desktop Banner */}
              <div>
                <label className={labelCls}>Desktop Banner Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-yellow-100/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/20 file:text-yellow-400 hover:file:bg-yellow-500/30"
                  onChange={handleDesktopUpload}
                  disabled={uploading}
                />
                <p className="mt-2 text-xs text-yellow-100/50">
                  {uploading ? "Uploading..." : "Recommended: 1200–1600px wide"}
                </p>

                {deskPreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-yellow-900/40 bg-black/40 h-40 flex items-center justify-center">
                    <img
                      src={deskPreview}
                      alt="Desktop Banner Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Styles */}
          <div className="mb-10">
            <h3 className={sectionTitleCls}>Mobile Registration Styles</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
              <ColorField
                label="Topbar Background"
                value={form.mobTopbarBg}
                onChange={(v) => setVal("mobTopbarBg", v)}
              />
              <ColorField
                label="Topbar Text Color"
                value={form.mobTopbarTextColor}
                onChange={(v) => setVal("mobTopbarTextColor", v)}
              />
              <IntField
                label="Topbar Text Size (px)"
                value={form.mobTopbarTextSizePx}
                onChange={(v) => setVal("mobTopbarTextSizePx", v)}
              />

              <ColorField
                label="Primary Button BG"
                value={form.mobPrimaryBtnBg}
                onChange={(v) => setVal("mobPrimaryBtnBg", v)}
              />
              <ColorField
                label="Primary Button Text"
                value={form.mobPrimaryBtnTextColor}
                onChange={(v) => setVal("mobPrimaryBtnTextColor", v)}
              />
              <IntField
                label="Primary Button Text Size (px)"
                value={form.mobPrimaryBtnTextSizePx}
                onChange={(v) => setVal("mobPrimaryBtnTextSizePx", v)}
              />

              <ColorField
                label="Yellow Button BG"
                value={form.mobYellowBtnBg}
                onChange={(v) => setVal("mobYellowBtnBg", v)}
              />
              <ColorField
                label="Yellow Button Text"
                value={form.mobYellowBtnTextColor}
                onChange={(v) => setVal("mobYellowBtnTextColor", v)}
              />
              <IntField
                label="Yellow Button Text Size (px)"
                value={form.mobYellowBtnTextSizePx}
                onChange={(v) => setVal("mobYellowBtnTextSizePx", v)}
              />

              <ColorField
                label="Stepper Active BG"
                value={form.mobStepperActiveBg}
                onChange={(v) => setVal("mobStepperActiveBg", v)}
              />
              <ColorField
                label="Stepper Inactive BG"
                value={form.mobStepperInactiveBg}
                onChange={(v) => setVal("mobStepperInactiveBg", v)}
              />
              <ColorField
                label="Stepper Line Active"
                value={form.mobStepperLineActiveBg}
                onChange={(v) => setVal("mobStepperLineActiveBg", v)}
              />
              <ColorField
                label="Stepper Line Inactive"
                value={form.mobStepperLineInactiveBg}
                onChange={(v) => setVal("mobStepperLineInactiveBg", v)}
              />
              <ColorField
                label="Stepper Tick Color"
                value={form.mobStepperTickColor}
                onChange={(v) => setVal("mobStepperTickColor", v)}
              />
            </div>
          </div>

          {/* Desktop Styles */}
          <div>
            <h3 className={sectionTitleCls}>Desktop Registration Styles</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
              <ColorField
                label="Page Background"
                value={form.deskPageBg}
                onChange={(v) => setVal("deskPageBg", v)}
              />
              <ColorField
                label="Card Background"
                value={form.deskCardBg}
                onChange={(v) => setVal("deskCardBg", v)}
              />
              <ColorField
                label="Title Color"
                value={form.deskTitleColor}
                onChange={(v) => setVal("deskTitleColor", v)}
              />
              <ColorField
                label="Subtitle Color"
                value={form.deskSubTitleColor}
                onChange={(v) => setVal("deskSubTitleColor", v)}
              />

              <ColorField
                label="Register Button BG"
                value={form.deskRegisterBtnBg}
                onChange={(v) => setVal("deskRegisterBtnBg", v)}
              />
              <ColorField
                label="Register Button Text"
                value={form.deskRegisterBtnTextColor}
                onChange={(v) => setVal("deskRegisterBtnTextColor", v)}
              />
              <IntField
                label="Register Button Text Size (px)"
                value={form.deskRegisterBtnTextSizePx}
                onChange={(v) => setVal("deskRegisterBtnTextSizePx", v)}
              />

              <ColorField
                label="Verification Code Box BG"
                value={form.deskVcodeBoxBg}
                onChange={(v) => setVal("deskVcodeBoxBg", v)}
              />
              <ColorField
                label="Verification Code Text"
                value={form.deskVcodeBoxTextColor}
                onChange={(v) => setVal("deskVcodeBoxTextColor", v)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterController;
