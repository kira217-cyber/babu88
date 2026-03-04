import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

/* -------------------- Helpers (OUTSIDE = stable, fixes picker close) -------------------- */

const safeHex = (v, fallback = "#000000") => {
  const s = String(v || "").trim();
  if (!s) return fallback;
  const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
  return ok ? s : fallback;
};

const isValidHex = (v) =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(v || "").trim());

const isValidRgba = (v) =>
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*(0(\.\d+)?|1(\.0+)?|\.\d+)\s*)?\)\s*$/i.test(
    String(v || "").trim(),
  );

const ColorField = React.memo(function ColorField({
  label,
  name,
  value,
  setField,
  allowRgba = true,
  labelCls,
  inputBase,
  colorInputWrapper,
  colorPickerCls,
}) {
  const [draft, setDraft] = useState(value || "");
  const rafRef = useRef(null);

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  const commitDraft = useCallback(() => {
    const next = String(draft || "").trim();
    if (!next) return;

    if (isValidHex(next) || (allowRgba && isValidRgba(next))) {
      setField(name, next);
    }
  }, [draft, name, setField, allowRgba]);

  const onColorChange = useCallback(
    (hex) => {
      setDraft(hex);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setField(name, hex);
      });
    },
    [name, setField],
  );

  const pickerValue = (() => {
    const v = String(value || "");
    return safeHex(v.startsWith("#") ? v : "", "#000000");
  })();

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className={colorInputWrapper}>
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onColorChange(e.target.value)}
          className={colorPickerCls}
          title="Pick color"
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder={allowRgba ? "#ffffff or rgba(...)" : "#ffffff"}
          className={inputBase}
        />
      </div>
      {allowRgba && (
        <p className="mt-1.5 text-xs text-yellow-400/60">
          Use rgba(...) for transparency — color picker works only with #hex
        </p>
      )}
    </div>
  );
});

const NumberField = React.memo(function NumberField({
  label,
  name,
  value,
  setField,
  min = 0,
  max = 999,
  step = 1,
  labelCls,
  inputBase,
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number(value ?? min)}
        onChange={(e) => setField(name, Number(e.target.value))}
        className={inputBase}
      />
    </div>
  );
});

const Section = React.memo(function Section({
  title,
  children,
  cardCls,
  headerCls,
  sectionTitleCls,
}) {
  return (
    <div className={cardCls}>
      <div className={headerCls}>
        <h3 className={sectionTitleCls}>{title}</h3>
      </div>
      <div className="p-5 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
});

/* -------------------- Main Component -------------------- */

const AffSliderColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sectionBg: "#2b2b2b",
    padYMobile: 8,
    padYMd: 24,

    frameRadius: 2,
    frameBorderColor: "rgba(42,166,166,0.60)",
    frameBorderWidth: 1,
    frameBg: "rgba(255,255,255,0.05)",

    hMobile: 120,
    hSm: 260,
    hMd: 320,

    paginationBottom: 10,
    bulletW: 4,
    bulletH: 4,
    bulletOpacity: 0.6,
    bulletActiveOpacity: 1,

    navColor: "#ffffff",
    navBox: 24,
    navIconSize: 12,
    navFontWeight: 700,
    hideNavBelow: 360,
  });

  // Consistent styling classes (UNCHANGED)
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

  const setField = useCallback((k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/aff-slider-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load slider settings");
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
      await api.put("/api/aff-slider-color", form);
      toast.success("Slider configuration saved successfully!");
      await load();
    } catch (e) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={containerCls}>
      {/* Header Card */}
      <div className={`${cardCls} mb-6 sm:mb-8`}>
        <div className={headerCls}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={sectionTitleCls}>Affiliate Slider Controller</h2>
              <p className={subtitleCls}>
                Customize slider section background, frame, height breakpoints,
                pagination bullets & navigation arrows
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
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section Settings */}
        <Section
          title="Slider Section"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Section Background"
              name="sectionBg"
              value={form.sectionBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Padding Y Mobile (px)"
              name="padYMobile"
              value={form.padYMobile}
              setField={setField}
              min={0}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Padding Y MD+ (px)"
              name="padYMd"
              value={form.padYMd}
              setField={setField}
              min={0}
              max={80}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Frame / Container */}
        <Section
          title="Slide Frame"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Frame Radius (px)"
              name="frameRadius"
              value={form.frameRadius}
              setField={setField}
              min={0}
              max={30}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Frame Border Color"
              name="frameBorderColor"
              value={form.frameBorderColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Frame Border Width (px)"
              name="frameBorderWidth"
              value={form.frameBorderWidth}
              setField={setField}
              min={0}
              max={6}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Frame Background (overlay)"
              name="frameBg"
              value={form.frameBg}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>

        {/* Heights (Responsive) */}
        <Section
          title="Slider Heights (Responsive)"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Height Mobile (px)"
              name="hMobile"
              value={form.hMobile}
              setField={setField}
              min={80}
              max={400}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Height SM (px)"
              name="hSm"
              value={form.hSm}
              setField={setField}
              min={120}
              max={600}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Height MD+ (px)"
              name="hMd"
              value={form.hMd}
              setField={setField}
              min={160}
              max={700}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Pagination (Bullets) */}
        <Section
          title="Pagination Bullets"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Pagination Bottom Offset (px)"
              name="paginationBottom"
              value={form.paginationBottom}
              setField={setField}
              min={0}
              max={40}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Bullet Width (px)"
              name="bulletW"
              value={form.bulletW}
              setField={setField}
              min={2}
              max={16}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Bullet Height (px)"
              name="bulletH"
              value={form.bulletH}
              setField={setField}
              min={2}
              max={16}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Bullet Inactive Opacity"
              name="bulletOpacity"
              value={form.bulletOpacity}
              setField={setField}
              min={0}
              max={1}
              step={0.05}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Bullet Active Opacity"
              name="bulletActiveOpacity"
              value={form.bulletActiveOpacity}
              setField={setField}
              min={0}
              max={1}
              step={0.05}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Navigation Arrows */}
        <Section
          title="Navigation Arrows"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Arrow / Nav Color"
              name="navColor"
              value={form.navColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Nav Box Size (px)"
              name="navBox"
              value={form.navBox}
              setField={setField}
              min={14}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Nav Icon Size (px)"
              name="navIconSize"
              value={form.navIconSize}
              setField={setField}
              min={8}
              max={30}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Nav Font Weight"
              name="navFontWeight"
              value={form.navFontWeight}
              setField={setField}
              min={300}
              max={900}
              step={100}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Hide Navigation Below (px)"
              name="hideNavBelow"
              value={form.hideNavBelow}
              setField={setField}
              min={0}
              max={900}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffSliderColorController;
