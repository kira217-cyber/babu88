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

const AffAgentColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sectionBg: "#2b2b2b",
    sectionText: "#ffffff",
    sectionPadY: 56,

    titleColor: "#ffffff",
    titleSize: 32,
    titleMarginBottom: 40,

    paraColor: "rgba(255,255,255,0.95)",
    paraSize: 16,

    checkBg: "#22c55e",
    checkIcon: "#ffffff",
    checkRadius: 2,

    listTextColor: "#ffffff",
    listTextSize: 16,

    cardBg: "#f5b400",
    cardBorder: "rgba(0,0,0,0.10)",
    cardRadius: 8,
    cardShadow: "0 8px 20px rgba(0,0,0,0.45)",

    percentColor: "#000000",
    percentSize: 72,

    stripColor: "#ffffff",
    stripSize: 24,

    btnBg: "#000000",
    btnHoverBg: "#1f1f1f",
    btnText: "#ffffff",
    btnTextSize: 16,
    btnRadius: 6,
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
      const res = await api.get("/api/aff-agent-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load agent section settings");
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
      await api.put("/api/aff-agent-color", form);
      toast.success("Agent section UI configuration saved successfully!");
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
                Affiliate Agent Section Controller
              </h2>
              <p className={subtitleCls}>
                Customize colors, spacing, typography, cards, percentage display
                & button styles for agent section
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
        {/* Section & Title */}
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
            <ColorField
              label="Section Text Color"
              name="sectionText"
              value={form.sectionText}
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

        {/* Left Paragraph */}
        <Section
          title="Description Text"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Paragraph Color"
              name="paraColor"
              value={form.paraColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Paragraph Size (px)"
              name="paraSize"
              value={form.paraSize}
              setField={setField}
              min={12}
              max={22}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Check List */}
        <Section
          title="Check List"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Checkmark Background"
              name="checkBg"
              value={form.checkBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Checkmark Icon Color"
              name="checkIcon"
              value={form.checkIcon}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Checkmark Radius (px)"
              name="checkRadius"
              value={form.checkRadius}
              setField={setField}
              min={0}
              max={12}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="List Text Color"
              name="listTextColor"
              value={form.listTextColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="List Text Size (px)"
              name="listTextSize"
              value={form.listTextSize}
              setField={setField}
              min={12}
              max={22}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Right Card */}
        <Section
          title="Right Percentage Card"
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
              placeholder="0 8px 20px rgba(0,0,0,0.45)"
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Percentage Color"
              name="percentColor"
              value={form.percentColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Percentage Size (px)"
              name="percentSize"
              value={form.percentSize}
              setField={setField}
              min={32}
              max={120}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Strip / Label Color"
              name="stripColor"
              value={form.stripColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Strip / Label Size (px)"
              name="stripSize"
              value={form.stripSize}
              setField={setField}
              min={12}
              max={40}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Button */}
        <Section
          title="Action Button"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Button Background"
              name="btnBg"
              value={form.btnBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Button Hover Background"
              name="btnHoverBg"
              value={form.btnHoverBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Button Text Color"
              name="btnText"
              value={form.btnText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Button Text Size (px)"
              name="btnTextSize"
              value={form.btnTextSize}
              setField={setField}
              min={12}
              max={24}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Button Radius (px)"
              name="btnRadius"
              value={form.btnRadius}
              setField={setField}
              min={0}
              max={24}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffAgentColorController;
