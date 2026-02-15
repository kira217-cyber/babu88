import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffFooterColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    footerBg: "#000000",
    footerText: "#ffffff",
    dashedLineColor: "rgba(255,255,255,0.30)",

    titleColor: "#ffffff",
    bodyTextColor: "rgba(255,255,255,0.80)",

    titleSize: 18,
    bodySize: 15,
    copyrightSize: 14,

    emptyLogoBg: "rgba(255,255,255,0.05)",
    emptyLogoBorder: "rgba(255,255,255,0.10)",
    emptyLogoText: "rgba(255,255,255,0.60)",

    imageOpacity: 0.8,
    imageGrayScale: true,

    socialBg: "rgba(255,255,255,0.10)",
    socialHoverBg: "#ffffff",
    socialIconColor: "#ffffff",
    socialHoverIconColor: "#000000",
    socialSize: 40,
    socialRadius: 9999,
  });

  // Consistent styling classes (same as sidebar & previous controller)
  const containerCls =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 sm:p-6 lg:p-8";
  const cardCls =
    "bg-gradient-to-b from-black/70 via-yellow-950/30 to-black/60 backdrop-blur-sm border border-yellow-700/40 rounded-xl shadow-xl shadow-yellow-900/20 overflow-hidden";
  const headerCls =
    "p-5 sm:p-6 border-b border-yellow-700/40 bg-gradient-to-r from-black/80 to-yellow-950/40";
  const sectionTitleCls =
    "text-xl sm:text-2xl font-bold tracking-tight text-white";
  const subtitleCls = "text-sm text-yellow-200/80 mt-1";
  const labelCls = "text-sm font-semibold text-yellow-100/90 mb-2 block";
  const inputBase =
    "w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/60 " +
    "focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all duration-200";
  const colorInputWrapper = "flex items-center gap-3";
  const colorPickerCls =
    "h-10 w-12 rounded-md border border-yellow-700/50 cursor-pointer bg-transparent";
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const reloadBtn = `${btnBase} border border-yellow-700/60 bg-yellow-950/40 hover:bg-yellow-900/50 text-yellow-100`;
  const saveBtn = `${btnBase} bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black shadow-md shadow-yellow-900/40 font-semibold`;

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/aff-footer-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load footer settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await api.put("/api/aff-footer-color", form);
      toast.success("Footer configuration saved successfully!");
      await load();
    } catch (e) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const ColorField = ({ label, name }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className={colorInputWrapper}>
        <input
          type="color"
          value={
            String(form[name] || "#000000").startsWith("#")
              ? form[name]
              : "#000000"
          }
          onChange={(e) => setField(name, e.target.value)}
          className={colorPickerCls}
          title="Pick color"
        />
        <input
          type="text"
          value={form[name] || ""}
          onChange={(e) => setField(name, e.target.value)}
          placeholder="#ffffff or rgba(255,255,255,0.8)"
          className={inputBase}
        />
      </div>
      <p className="mt-1.5 text-xs text-yellow-400/60">
        Tip: Use rgba(...) for transparency — color picker works only with #hex
      </p>
    </div>
  );

  const NumberField = ({ label, name, min = 0, max = 999, step = 1 }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number(form[name] ?? min)}
        onChange={(e) => setField(name, Number(e.target.value))}
        className={inputBase}
      />
    </div>
  );

  const ToggleField = ({ label, name }) => (
    <label className="flex items-center gap-3 mt-2 cursor-pointer group">
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={!!form[name]}
          onChange={(e) => setField(name, e.target.checked)}
          className="sr-only peer"
        />
        <div
          className="
          w-10 h-5 bg-yellow-950/60 rounded-full peer 
          peer-checked:bg-gradient-to-r peer-checked:from-yellow-600 peer-checked:to-amber-600
          after:content-[''] after:absolute after:top-0.5 after:left-0.5 
          after:bg-white after:rounded-full after:h-4 after:w-4 
          after:transition-all after:duration-200
          peer-checked:after:translate-x-5
        "
        ></div>
      </div>
      <span className="text-sm font-medium text-yellow-100/90 group-hover:text-yellow-50 transition-colors">
        {label}
      </span>
    </label>
  );

  const Section = ({ title, children }) => (
    <div className={cardCls}>
      <div className={headerCls}>
        <h3 className={sectionTitleCls}>{title}</h3>
      </div>
      <div className="p-5 sm:p-6 lg:p-8">{children}</div>
    </div>
  );

  return (
    <div className={containerCls}>
      {/* Header Card */}
      <div className={`${cardCls} mb-6 sm:mb-8`}>
        <div className={headerCls}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={sectionTitleCls}>Affiliate Footer Controller</h2>
              <p className={subtitleCls}>
                Customize footer background, text, social icons, images & layout
                from here
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={load}
                disabled={loading || saving}
                className={reloadBtn}
              >
                {loading ? "Loading..." : "Reload"}
              </button>
              <button
                onClick={save}
                disabled={loading || saving}
                className={saveBtn}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wrapper + Lines */}
        <Section title="Footer Wrapper & Lines">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Footer Background" name="footerBg" />
            <ColorField label="Footer Base Text Color" name="footerText" />
            <ColorField label="Dashed Line Color" name="dashedLineColor" />
          </div>
        </Section>

        {/* Text Colors & Sizes */}
        <Section title="Text Colors & Sizes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Title Color" name="titleColor" />
            <ColorField label="Body Text Color" name="bodyTextColor" />
            <NumberField
              label="Title Size (px)"
              name="titleSize"
              min={12}
              max={40}
            />
            <NumberField
              label="Body Size (px)"
              name="bodySize"
              min={10}
              max={30}
            />
            <NumberField
              label="Copyright Size (px)"
              name="copyrightSize"
              min={10}
              max={26}
            />
          </div>
        </Section>

        {/* Empty Logo Box */}
        <Section title="Empty Logo Placeholder">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Background" name="emptyLogoBg" />
            <ColorField label="Border Color" name="emptyLogoBorder" />
            <ColorField label="Text Color" name="emptyLogoText" />
          </div>
        </Section>

        {/* Partner/Payment Images */}
        <Section title="Partner & Payment Images">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Image Opacity (0–1)"
              name="imageOpacity"
              min={0}
              max={1}
              step={0.05}
            />
            <div className="flex items-end">
              <ToggleField
                label="Enable Grayscale by default"
                name="imageGrayScale"
              />
            </div>
          </div>
        </Section>

        {/* Social Icons */}
        <Section title="Social Media Icons">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Background" name="socialBg" />
            <ColorField label="Hover Background" name="socialHoverBg" />
            <ColorField label="Icon Color" name="socialIconColor" />
            <ColorField label="Hover Icon Color" name="socialHoverIconColor" />
            <NumberField
              label="Icon Size (px)"
              name="socialSize"
              min={24}
              max={80}
            />
            <NumberField
              label="Border Radius (px)"
              name="socialRadius"
              min={0}
              max={9999}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffFooterColorController;
