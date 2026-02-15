import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaults = {
  name: "Default",
  isActive: true,

  titleBn: "গুরুত্বপূর্ণ ঘোষণা",
  titleEn: "Important Announcement",
  imageUrl: "",
  navigateTo: "/promotion",

  storageKey: "promotion_modal_last_shown_v1",
  showOncePerMs: 0,

  backdropColor: "#000000",
  backdropOpacity: 0.65,

  modalBg: "#111111",
  modalRadiusPx: 12,
  modalShadow: "0 20px 60px rgba(0,0,0,0.45)",
  maxWidthPx: 420,

  headerBg: "#1a1a1a",
  headerHeightPx: 48,

  titleColor: "#f5b400",
  titleSizePx: 16,
  titleWeight: 800,
  titleLetterSpacing: 0.5,

  closeBtnBg: "#ffffff",
  closeBtnBgOpacity: 0.12,
  closeIconColor: "#f5b400",
  closeIconSizePx: 20,

  bodyPaddingPx: 16,

  imageBorderColor: "#f5b400",
  imageBorderOpacity: 0.25,
  imageRadiusPx: 10,
};

// ────────────────────────────────────────────────
// Styles (matching your sidebar dark + yellow theme)
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// Reusable field components
// ────────────────────────────────────────────────
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

const IntField = ({ label, value, onChange, min = 0, max = 1000 }) => (
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

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
const PromotionModalController = () => {
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(""); // live preview

  const setVal = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/promotion-modal");
      if (!res.data) {
        setDocId(null);
        setForm(defaults);
        setPreviewImage("");
        return;
      }
      setDocId(res.data._id);
      const cleaned = { ...defaults, ...res.data };
      delete cleaned.__v;
      delete cleaned.createdAt;
      delete cleaned.updatedAt;
      setForm(cleaned);
      setPreviewImage(
        cleaned.imageUrl ? `${api.defaults.baseURL}${cleaned.imageUrl}` : "",
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

      const res = await api.put("/api/promotion-modal", payload);
      setDocId(res.data._id || docId);
      toast.success(docId ? "Updated successfully" : "Created successfully");
      await loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);

      const { data } = await api.post("/api/promotion-modal/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fullUrl = data?.imageUrl?.startsWith("http")
        ? data.imageUrl
        : `${api.defaults.baseURL}${data.imageUrl || ""}`;

      setVal("imageUrl", data?.imageUrl || "");
      setPreviewImage(fullUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const headerText = useMemo(() => {
    if (loading) return "Loading configuration...";
    return docId ? "Promotion Modal (Edit)" : "Promotion Modal (Create)";
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
          {/* Top meta */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
            <div>
              <label className={labelCls}>Config Name</label>
              <input
                className={`${fieldCls} mt-1.5`}
                value={form.name}
                onChange={(e) => setVal("name", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setVal("isActive", e.target.checked)}
                  className="h-5 w-5 accent-yellow-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-yellow-100/90 cursor-pointer"
                >
                  Active (clients will see this modal)
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Navigate To</label>
                <input
                  className={`${fieldCls} mt-1.5`}
                  value={form.navigateTo}
                  onChange={(e) => setVal("navigateTo", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Storage Key</label>
                <input
                  className={`${fieldCls} mt-1.5`}
                  value={form.storageKey}
                  onChange={(e) => setVal("storageKey", e.target.value)}
                />
              </div>

              <IntField
                label="Show Once Per (ms) — 0 = always show"
                value={form.showOncePerMs}
                onChange={(v) => setVal("showOncePerMs", v)}
                min={0}
                max={31536000000} // 1 year in ms
              />
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
            <div>
              <label className={labelCls}>Title (Bangla)</label>
              <input
                className={`${fieldCls} mt-1.5`}
                value={form.titleBn}
                onChange={(e) => setVal("titleBn", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Title (English)</label>
              <input
                className={`${fieldCls} mt-1.5`}
                value={form.titleEn}
                onChange={(e) => setVal("titleEn", e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload + Compact Preview */}
          <div className="mb-8">
            <h3 className={sectionTitleCls}>Promotion Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-yellow-100/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/20 file:text-yellow-400 hover:file:bg-yellow-500/30"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <p className="mt-2 text-xs text-yellow-100/50">
                  {uploading
                    ? "Uploading..."
                    : "Recommended: ~420px wide, PNG/JPG/WebP"}
                </p>
              </div>

              {/* Compact live preview */}
              <div>
                <label className={labelCls}>Preview</label>
                <div className="mt-2 rounded-lg overflow-hidden border border-yellow-900/40 bg-black/40 h-32 flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Promotion preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-yellow-100/40 text-sm">
                      No image uploaded
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Manual URL fallback */}
            <div className="mt-4">
              <label className={labelCls}>Image URL (manual override)</label>
              <input
                className={`${fieldCls} mt-1.5`}
                value={form.imageUrl}
                onChange={(e) => {
                  setVal("imageUrl", e.target.value);
                  setPreviewImage(e.target.value);
                }}
                placeholder="https://... or /uploads/..."
              />
            </div>
          </div>

          {/* Style sections */}
          <div className="space-y-10">
            <div>
              <h3 className={sectionTitleCls}>Backdrop & Modal Window</h3>
              <div className="grid grid-cols-1 gap-3">
                <ColorField
                  label="Backdrop Color"
                  value={form.backdropColor}
                  onChange={(v) => setVal("backdropColor", v)}
                />
                <ColorField
                  label="Modal Background"
                  value={form.modalBg}
                  onChange={(v) => setVal("modalBg", v)}
                />
                <NumField
                  label="Backdrop Opacity"
                  value={form.backdropOpacity}
                  onChange={(v) => setVal("backdropOpacity", v)}
                />
                <IntField
                  label="Modal Radius (px)"
                  value={form.modalRadiusPx}
                  onChange={(v) => setVal("modalRadiusPx", v)}
                />
                <IntField
                  label="Max Width (px)"
                  value={form.maxWidthPx}
                  onChange={(v) => setVal("maxWidthPx", v)}
                  min={300}
                  max={600}
                />
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <label className={labelCls}>Modal Shadow (css)</label>
                  <input
                    className={`${fieldCls} mt-1.5`}
                    value={form.modalShadow}
                    onChange={(e) => setVal("modalShadow", e.target.value)}
                    placeholder="0 20px 60px rgba(0,0,0,0.45)"
                  />
                  <p className="mt-1 text-xs text-yellow-100/50">
                    Example: 0 20px 60px rgba(0,0,0,0.45)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Header & Title</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Header Background"
                  value={form.headerBg}
                  onChange={(v) => setVal("headerBg", v)}
                />
                <ColorField
                  label="Title Color"
                  value={form.titleColor}
                  onChange={(v) => setVal("titleColor", v)}
                />
                <IntField
                  label="Header Height (px)"
                  value={form.headerHeightPx}
                  onChange={(v) => setVal("headerHeightPx", v)}
                  min={40}
                  max={80}
                />
                <IntField
                  label="Title Size (px)"
                  value={form.titleSizePx}
                  onChange={(v) => setVal("titleSizePx", v)}
                  min={12}
                  max={28}
                />
                <IntField
                  label="Title Weight"
                  value={form.titleWeight}
                  onChange={(v) => setVal("titleWeight", v)}
                  min={400}
                  max={900}
                />
                <NumField
                  label="Title Letter Spacing (em)"
                  value={form.titleLetterSpacing}
                  onChange={(v) => setVal("titleLetterSpacing", v)}
                  step={0.01}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Close Button & Body Padding</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Close Button BG"
                  value={form.closeBtnBg}
                  onChange={(v) => setVal("closeBtnBg", v)}
                />
                <ColorField
                  label="Close Icon Color"
                  value={form.closeIconColor}
                  onChange={(v) => setVal("closeIconColor", v)}
                />
                <NumField
                  label="Close BG Opacity"
                  value={form.closeBtnBgOpacity}
                  onChange={(v) => setVal("closeBtnBgOpacity", v)}
                />
                <IntField
                  label="Close Icon Size (px)"
                  value={form.closeIconSizePx}
                  onChange={(v) => setVal("closeIconSizePx", v)}
                  min={16}
                  max={40}
                />
                <IntField
                  label="Body Padding (px)"
                  value={form.bodyPaddingPx}
                  onChange={(v) => setVal("bodyPaddingPx", v)}
                  min={8}
                  max={40}
                />
              </div>
            </div>

            <div>
              <h3 className={sectionTitleCls}>Image Styling</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                <ColorField
                  label="Image Border Color"
                  value={form.imageBorderColor}
                  onChange={(v) => setVal("imageBorderColor", v)}
                />
                <NumField
                  label="Image Border Opacity"
                  value={form.imageBorderOpacity}
                  onChange={(v) => setVal("imageBorderOpacity", v)}
                />
                <IntField
                  label="Image Radius (px)"
                  value={form.imageRadiusPx}
                  onChange={(v) => setVal("imageRadiusPx", v)}
                  min={0}
                  max={30}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionModalController;
