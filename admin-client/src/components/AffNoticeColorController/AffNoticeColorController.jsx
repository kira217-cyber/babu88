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

const AffNoticeColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    outerBg: "#2b2b2b",

    pillBg: "#f5b400",
    pillText: "#000000",

    radius: 6,
    padX: 24,
    padY: 12,

    textSizeMobile: 14,
    textSizeSm: 16,
    textSizeMd: 18,
    fontWeight: 700,

    speedSecDefault: 16,
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
      const res = await api.get("/api/aff-notice-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load notice bar settings");
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
      await api.put("/api/aff-notice-color", form);
      toast.success("Notice bar configuration saved successfully!");
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
              <h2 className={sectionTitleCls}>
                Affiliate Notice Bar Controller
              </h2>
              <p className={subtitleCls}>
                Customize background, pill colors, text sizes, spacing, radius &
                animation speed for the notice bar
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
        {/* Colors */}
        <Section
          title="Notice Bar Colors"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Outer Background"
              name="outerBg"
              value={form.outerBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Pill / Highlight Background"
              name="pillBg"
              value={form.pillBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Pill / Text Color"
              name="pillText"
              value={form.pillText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>

        {/* Spacing & Shape */}
        <Section
          title="Spacing & Shape"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Border Radius (px)"
              name="radius"
              value={form.radius}
              setField={setField}
              min={0}
              max={30}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Horizontal Padding (px)"
              name="padX"
              value={form.padX}
              setField={setField}
              min={0}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Vertical Padding (px)"
              name="padY"
              value={form.padY}
              setField={setField}
              min={0}
              max={40}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Typography */}
        <Section
          title="Text Styles"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Text Size Mobile (px)"
              name="textSizeMobile"
              value={form.textSizeMobile}
              setField={setField}
              min={10}
              max={24}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Text Size SM (px)"
              name="textSizeSm"
              value={form.textSizeSm}
              setField={setField}
              min={10}
              max={28}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Text Size MD+ (px)"
              name="textSizeMd"
              value={form.textSizeMd}
              setField={setField}
              min={10}
              max={32}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Font Weight"
              name="fontWeight"
              value={form.fontWeight}
              setField={setField}
              min={300}
              max={900}
              step={100}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Animation */}
        <Section
          title="Marquee Animation"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Default Speed (seconds)"
              name="speedSecDefault"
              value={form.speedSecDefault}
              setField={setField}
              min={4}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <div className="sm:col-span-2 text-yellow-400/80 text-sm mt-2">
              Note: If <code>/api/aff-notice</code> returns{" "}
              <code>speedSec</code>, it will override this default value.
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffNoticeColorController;
