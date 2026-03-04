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

const ShadowField = React.memo(function ShadowField({
  label,
  name,
  value,
  setField,
  placeholder,
  labelCls,
  inputBase,
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => setField(name, e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} mt-2`}
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

const WhyUsColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sectionBg: "#2b2b2b",
    sectionPadY: 56,

    titleColor: "#ffffff",
    titleSize: 32,
    titleMarginBottom: 40,

    cardBg: "#ffffff",
    cardBorder: "rgba(0,0,0,0.10)",
    cardRadius: 6,
    cardShadow: "0 10px 25px rgba(0,0,0,0.25)",
    cardPadX: 40,
    cardPadY: 40,

    gridGap: 40,

    iconCircleBg: "#f5b400",
    iconCircleSize: 96,
    iconOverlay: "rgba(0,0,0,0.10)",
    iconColor: "#ffffff",
    iconSize: 42,

    itemTitleColor: "#000000",
    itemTitleSize: 18,
    itemTitleMarginBottom: 12,

    descColor: "rgba(0,0,0,0.80)",
    descSize: 14,
    descLineHeight: 1.6,
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
      const res = await api.get("/api/aff-whyus-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load Why Us section settings");
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
      await api.put("/api/aff-whyus-color", form);
      toast.success("Why Us section UI configuration saved successfully!");
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
                Affiliate Why Us Section Controller
              </h2>
              <p className={subtitleCls}>
                Customize background, cards, icons, typography, spacing & layout
                for the Why Us / Advantages section
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
          title="Main Section"
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
              label="Section Vertical Padding (px)"
              name="sectionPadY"
              value={form.sectionPadY}
              setField={setField}
              min={20}
              max={120}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Title Color"
              name="titleColor"
              value={form.titleColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Title Size (px)"
              name="titleSize"
              value={form.titleSize}
              setField={setField}
              min={18}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Title Margin Bottom (px)"
              name="titleMarginBottom"
              value={form.titleMarginBottom}
              setField={setField}
              min={0}
              max={80}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Card Settings */}
        <Section
          title="Feature Cards"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Card Background"
              name="cardBg"
              value={form.cardBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Card Border"
              name="cardBorder"
              value={form.cardBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Card Radius (px)"
              name="cardRadius"
              value={form.cardRadius}
              setField={setField}
              min={0}
              max={30}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ShadowField
              label="Card Shadow (CSS)"
              name="cardShadow"
              value={form.cardShadow}
              setField={setField}
              placeholder="0 10px 25px rgba(0,0,0,0.25)"
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Card Padding X (px)"
              name="cardPadX"
              value={form.cardPadX}
              setField={setField}
              min={0}
              max={80}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Card Padding Y (px)"
              name="cardPadY"
              value={form.cardPadY}
              setField={setField}
              min={0}
              max={80}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Grid Gap Between Cards (px)"
              name="gridGap"
              value={form.gridGap}
              setField={setField}
              min={10}
              max={80}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Icon Circle */}
        <Section
          title="Feature Icon Circle"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Icon Circle Background"
              name="iconCircleBg"
              value={form.iconCircleBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Circle Size (px)"
              name="iconCircleSize"
              value={form.iconCircleSize}
              setField={setField}
              min={40}
              max={140}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Icon Overlay (darken)"
              name="iconOverlay"
              value={form.iconOverlay}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Icon Color"
              name="iconColor"
              value={form.iconColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Icon Size (px)"
              name="iconSize"
              value={form.iconSize}
              setField={setField}
              min={18}
              max={80}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Item Text */}
        <Section
          title="Card Text Content"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Item Title Color"
              name="itemTitleColor"
              value={form.itemTitleColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Item Title Size (px)"
              name="itemTitleSize"
              value={form.itemTitleSize}
              setField={setField}
              min={12}
              max={28}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Item Title Margin Bottom (px)"
              name="itemTitleMarginBottom"
              value={form.itemTitleMarginBottom}
              setField={setField}
              min={0}
              max={30}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Description Color"
              name="descColor"
              value={form.descColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Description Size (px)"
              name="descSize"
              value={form.descSize}
              setField={setField}
              min={10}
              max={22}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Description Line Height"
              name="descLineHeight"
              value={form.descLineHeight}
              setField={setField}
              min={1}
              max={2.2}
              step={0.1}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default WhyUsColorController;
