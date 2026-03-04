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
      // picker always returns hex
      setDraft(hex);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setField(name, hex);
      });
    },
    [name, setField],
  );

  const pickerValue = (() => {
    // picker works only with hex; if current is rgba -> fallback #000000 (same behavior)
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

const AffRegisterColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    pageBg: "#4b4b4b",

    cardBg: "#ffffff",
    cardBorder: "rgba(0,0,0,0.05)",
    cardShadow: "0 30px 90px rgba(0,0,0,0.35)",
    cardRadius: 24,

    headerBorder: "rgba(0,0,0,0.05)",
    titleColor: "#000000",
    subtitleColor: "rgba(0,0,0,0.60)",

    labelColor: "rgba(0,0,0,0.80)",
    inputBg: "#ffffff",
    inputText: "rgba(0,0,0,0.90)",
    inputPlaceholder: "rgba(0,0,0,0.35)",
    inputBorder: "rgba(0,0,0,0.10)",
    inputFocusBorder: "#f59e0b",
    inputFocusRing: "rgba(253,224,71,0.60)",
    inputShadow: "0 10px 30px rgba(0,0,0,0.06)",
    inputRadius: 16,

    iconBoxBg: "rgba(0,0,0,0.05)",
    iconColor: "rgba(0,0,0,0.60)",

    errorColor: "#dc2626",

    vcodeBg: "#4b4b4b",
    vcodeText: "#ffffff",

    checkboxAccent: "#000000",
    agreeTextColor: "rgba(0,0,0,0.65)",

    submitBg: "#f59e0b",
    submitHoverBg: "#d97706",
    submitText: "#000000",
    submitShadow: "0 16px 40px rgba(245,158,11,0.35)",
    submitTextSize: 16,

    linkColor: "#ca8a04",
    linkHoverColor: "#a16207",

    noteTextColor: "rgba(0,0,0,0.55)",
  });

  // Consistent styling (UNCHANGED)
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
      const res = await api.get("/api/aff-register-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load registration page settings");
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
      await api.put("/api/aff-register-color", form);
      toast.success("Registration page configuration saved successfully!");
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
                Affiliate Registration Page Controller
              </h2>
              <p className={subtitleCls}>
                Customize colors, shadows, radii, and layout of the affiliate
                registration page
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
        {/* Page + Card */}
        <Section
          title="Page & Card"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Page Background"
              name="pageBg"
              value={form.pageBg}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Card Background"
              name="cardBg"
              value={form.cardBg}
              setField={setField}
              allowRgba={true}
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
            <ShadowField
              label="Card Shadow (CSS)"
              name="cardShadow"
              value={form.cardShadow}
              setField={setField}
              placeholder="0 30px 90px rgba(0,0,0,0.35)"
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Card Radius (px)"
              name="cardRadius"
              value={form.cardRadius}
              setField={setField}
              min={0}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Header Border"
              name="headerBorder"
              value={form.headerBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>

        {/* Text Colors */}
        <Section
          title="Text Colors"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Title Color"
              name="titleColor"
              value={form.titleColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Subtitle Color"
              name="subtitleColor"
              value={form.subtitleColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Label Color"
              name="labelColor"
              value={form.labelColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Note Text Color"
              name="noteTextColor"
              value={form.noteTextColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Agree Text Color"
              name="agreeTextColor"
              value={form.agreeTextColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Error Message Color"
              name="errorColor"
              value={form.errorColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>

        {/* Form Inputs */}
        <Section
          title="Form Inputs"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Input Background"
              name="inputBg"
              value={form.inputBg}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Input Text Color"
              name="inputText"
              value={form.inputText}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Placeholder Color"
              name="inputPlaceholder"
              value={form.inputPlaceholder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Input Border"
              name="inputBorder"
              value={form.inputBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Focus Border Color"
              name="inputFocusBorder"
              value={form.inputFocusBorder}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Focus Ring (rgba recommended)"
              name="inputFocusRing"
              value={form.inputFocusRing}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ShadowField
              label="Input Shadow (CSS)"
              name="inputShadow"
              value={form.inputShadow}
              setField={setField}
              placeholder="0 10px 30px rgba(0,0,0,0.06)"
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Input Radius (px)"
              name="inputRadius"
              value={form.inputRadius}
              setField={setField}
              min={0}
              max={40}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Icons + Verification + Checkbox */}
        <Section
          title="Icons, Verification & Checkbox"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Icon Box Background"
              name="iconBoxBg"
              value={form.iconBoxBg}
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
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Verification Code BG"
              name="vcodeBg"
              value={form.vcodeBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Verification Code Text"
              name="vcodeText"
              value={form.vcodeText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Checkbox Accent Color"
              name="checkboxAccent"
              value={form.checkboxAccent}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>

        {/* Submit Button + Links */}
        <Section
          title="Submit Button & Links"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Submit Button Background"
              name="submitBg"
              value={form.submitBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Submit Hover Background"
              name="submitHoverBg"
              value={form.submitHoverBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Submit Text Color"
              name="submitText"
              value={form.submitText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ShadowField
              label="Submit Button Shadow (CSS)"
              name="submitShadow"
              value={form.submitShadow}
              setField={setField}
              placeholder="0 16px 40px rgba(245,158,11,0.35)"
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <NumberField
              label="Submit Text Size (px)"
              name="submitTextSize"
              value={form.submitTextSize}
              setField={setField}
              min={12}
              max={24}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Login Link Color"
              name="linkColor"
              value={form.linkColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Login Link Hover Color"
              name="linkHoverColor"
              value={form.linkHoverColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffRegisterColorController;
