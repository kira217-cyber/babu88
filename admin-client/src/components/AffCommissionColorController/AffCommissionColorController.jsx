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
    // picker only accepts hex; if rgba -> fallback (#000000) like before
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

const AffCommissionColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sectionBg: "#2b2b2b",
    sectionText: "#ffffff",

    titleColor: "#ffffff",
    titleSize: 32,

    tableBorder: "rgba(255,255,255,0.90)",
    tableHeaderBg: "#f5b400",
    tableHeaderText: "#000000",
    tableHeaderTextSize: 18,

    tableRowBg: "#2b2b2b",
    tableRowText: "#ffffff",
    tableRowTextSize: 16,
    tableCellBorder: "rgba(255,255,255,0.90)",

    btnBg: "#f5b400",
    btnHoverBg: "#e2a800",
    btnText: "#000000",
    btnTextSize: 16,
    btnRadius: 6,

    overlayOpacity: 0.55,
    modalBg: "#ffffff",
    modalText: "#000000",
    modalRadius: 2,
    modalShadow: "0 18px 50px rgba(0,0,0,0.65)",

    modalTitleColor: "#000000",
    modalTitleSize: 40,

    closeHoverBg: "rgba(0,0,0,0.05)",
    closeIconColor: "#000000",

    bulletColor: "rgba(0,0,0,0.85)",
    bulletSize: 16,

    formulaTitleColor: "#000000",
    formulaTitleSize: 32,

    formulaIconBg: "#f5b400",
    formulaIconColor: "#ffffff",
    formulaLabelColor: "#000000",
    formulaLabelSize: 14,

    signColor: "#f5b400",
    signSize: 40,

    exTableBorder: "rgba(0,0,0,0.15)",
    exHeaderBg: "#f5b400",
    exHeaderText: "#000000",
    exCellBorder: "rgba(0,0,0,0.10)",
    exRowBg: "#ffffff",
    exRowText: "#000000",
    exTotalBg: "#f5b400",
    exTotalText: "#000000",
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
      const res = await api.get("/api/aff-commission-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load commission page settings");
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
      await api.put("/api/aff-commission-color", form);
      toast.success("Commission page UI configuration saved successfully!");
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
                Affiliate Commission Page Controller
              </h2>
              <p className={subtitleCls}>
                Customize colors, sizes, tables, buttons, modal & formula UI for
                commission page
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
        {/* Section + Title */}
        <Section
          title="Main Section & Title"
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
          </div>
        </Section>

        {/* Main Table */}
        <Section
          title="Commission Table"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Table Border"
              name="tableBorder"
              value={form.tableBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Header Background"
              name="tableHeaderBg"
              value={form.tableHeaderBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Header Text Color"
              name="tableHeaderText"
              value={form.tableHeaderText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Header Text Size (px)"
              name="tableHeaderTextSize"
              value={form.tableHeaderTextSize}
              setField={setField}
              min={12}
              max={28}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Row Background"
              name="tableRowBg"
              value={form.tableRowBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Row Text Color"
              name="tableRowText"
              value={form.tableRowText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Row Text Size (px)"
              name="tableRowTextSize"
              value={form.tableRowTextSize}
              setField={setField}
              min={12}
              max={24}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Cell Border"
              name="tableCellBorder"
              value={form.tableCellBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
          </div>
        </Section>

        {/* Buttons */}
        <Section
          title="Action Buttons"
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

        {/* Modal */}
        <Section
          title="Commission Details Modal"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Overlay Opacity (0–1)"
              name="overlayOpacity"
              value={form.overlayOpacity}
              setField={setField}
              min={0}
              max={1}
              step={0.05}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Modal Background"
              name="modalBg"
              value={form.modalBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Modal Text Color"
              name="modalText"
              value={form.modalText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Modal Radius (px)"
              name="modalRadius"
              value={form.modalRadius}
              setField={setField}
              min={0}
              max={30}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ShadowField
              label="Modal Shadow (CSS)"
              name="modalShadow"
              value={form.modalShadow}
              setField={setField}
              placeholder="0 18px 50px rgba(0,0,0,0.65)"
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Modal Title Color"
              name="modalTitleColor"
              value={form.modalTitleColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Modal Title Size (px)"
              name="modalTitleSize"
              value={form.modalTitleSize}
              setField={setField}
              min={18}
              max={70}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Close Hover Background"
              name="closeHoverBg"
              value={form.closeHoverBg}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Close Icon Color"
              name="closeIconColor"
              value={form.closeIconColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Bullet Point Color"
              name="bulletColor"
              value={form.bulletColor}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Bullet Size (px)"
              name="bulletSize"
              value={form.bulletSize}
              setField={setField}
              min={12}
              max={22}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Formula Section */}
        <Section
          title="Commission Formula"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Formula Title Color"
              name="formulaTitleColor"
              value={form.formulaTitleColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Formula Title Size (px)"
              name="formulaTitleSize"
              value={form.formulaTitleSize}
              setField={setField}
              min={16}
              max={60}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Formula Icon Background"
              name="formulaIconBg"
              value={form.formulaIconBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Formula Icon Color"
              name="formulaIconColor"
              value={form.formulaIconColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Formula Label Color"
              name="formulaLabelColor"
              value={form.formulaLabelColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Formula Label Size (px)"
              name="formulaLabelSize"
              value={form.formulaLabelSize}
              setField={setField}
              min={10}
              max={22}
              labelCls={labelCls}
              inputBase={inputBase}
            />
            <ColorField
              label="Sign Color"
              name="signColor"
              value={form.signColor}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <NumberField
              label="Sign Size (px)"
              name="signSize"
              value={form.signSize}
              setField={setField}
              min={18}
              max={70}
              labelCls={labelCls}
              inputBase={inputBase}
            />
          </div>
        </Section>

        {/* Example Table (inside modal) */}
        <Section
          title="Example Table (in Modal)"
          cardCls={cardCls}
          headerCls={headerCls}
          sectionTitleCls={sectionTitleCls}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Table Border"
              name="exTableBorder"
              value={form.exTableBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Header Background"
              name="exHeaderBg"
              value={form.exHeaderBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Header Text Color"
              name="exHeaderText"
              value={form.exHeaderText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Cell Border"
              name="exCellBorder"
              value={form.exCellBorder}
              setField={setField}
              allowRgba={true}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Row Background"
              name="exRowBg"
              value={form.exRowBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Row Text Color"
              name="exRowText"
              value={form.exRowText}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Total Row Background"
              name="exTotalBg"
              value={form.exTotalBg}
              setField={setField}
              allowRgba={false}
              labelCls={labelCls}
              inputBase={inputBase}
              colorInputWrapper={colorInputWrapper}
              colorPickerCls={colorPickerCls}
            />
            <ColorField
              label="Total Row Text Color"
              name="exTotalText"
              value={form.exTotalText}
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

export default AffCommissionColorController;
