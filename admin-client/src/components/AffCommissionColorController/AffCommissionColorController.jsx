import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

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

  // Consistent styling classes (same as other color controllers)
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

  const ColorField = ({ label, name, allowRgba = true }) => {
    const val = String(form[name] || "");
    const isHex =
      val.startsWith("#") &&
      (val.length === 7 ||
        val.length === 4 ||
        val.length === 9 ||
        val.length === 5);
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className={colorInputWrapper}>
          <input
            type="color"
            value={isHex ? val : "#000000"}
            onChange={(e) => setField(name, e.target.value)}
            className={colorPickerCls}
            title="Pick color"
          />
          <input
            type="text"
            value={form[name] || ""}
            onChange={(e) => setField(name, e.target.value)}
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
  };

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

  const ShadowField = ({ label, name, placeholder }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={form[name] || ""}
        onChange={(e) => setField(name, e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} mt-2`}
      />
    </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section + Title */}
        <Section title="Main Section & Title">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Section Background"
              name="sectionBg"
              allowRgba={false}
            />
            <ColorField
              label="Section Text Color"
              name="sectionText"
              allowRgba={false}
            />
            <ColorField
              label="Title Color"
              name="titleColor"
              allowRgba={false}
            />
            <NumberField
              label="Title Size (px)"
              name="titleSize"
              min={18}
              max={60}
            />
          </div>
        </Section>

        {/* Main Table */}
        <Section title="Commission Table">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Table Border" name="tableBorder" />
            <ColorField
              label="Header Background"
              name="tableHeaderBg"
              allowRgba={false}
            />
            <ColorField
              label="Header Text Color"
              name="tableHeaderText"
              allowRgba={false}
            />
            <NumberField
              label="Header Text Size (px)"
              name="tableHeaderTextSize"
              min={12}
              max={28}
            />
            <ColorField
              label="Row Background"
              name="tableRowBg"
              allowRgba={false}
            />
            <ColorField
              label="Row Text Color"
              name="tableRowText"
              allowRgba={false}
            />
            <NumberField
              label="Row Text Size (px)"
              name="tableRowTextSize"
              min={12}
              max={24}
            />
            <ColorField label="Cell Border" name="tableCellBorder" />
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Action Buttons">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Button Background"
              name="btnBg"
              allowRgba={false}
            />
            <ColorField
              label="Button Hover Background"
              name="btnHoverBg"
              allowRgba={false}
            />
            <ColorField
              label="Button Text Color"
              name="btnText"
              allowRgba={false}
            />
            <NumberField
              label="Button Text Size (px)"
              name="btnTextSize"
              min={12}
              max={24}
            />
            <NumberField
              label="Button Radius (px)"
              name="btnRadius"
              min={0}
              max={24}
            />
          </div>
        </Section>

        {/* Modal */}
        <Section title="Commission Details Modal">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Overlay Opacity (0–1)"
              name="overlayOpacity"
              min={0}
              max={1}
              step={0.05}
            />
            <ColorField
              label="Modal Background"
              name="modalBg"
              allowRgba={false}
            />
            <ColorField
              label="Modal Text Color"
              name="modalText"
              allowRgba={false}
            />
            <NumberField
              label="Modal Radius (px)"
              name="modalRadius"
              min={0}
              max={30}
            />
            <ShadowField
              label="Modal Shadow (CSS)"
              name="modalShadow"
              placeholder="0 18px 50px rgba(0,0,0,0.65)"
            />
            <ColorField
              label="Modal Title Color"
              name="modalTitleColor"
              allowRgba={false}
            />
            <NumberField
              label="Modal Title Size (px)"
              name="modalTitleSize"
              min={18}
              max={70}
            />
            <ColorField label="Close Hover Background" name="closeHoverBg" />
            <ColorField
              label="Close Icon Color"
              name="closeIconColor"
              allowRgba={false}
            />
            <ColorField label="Bullet Point Color" name="bulletColor" />
            <NumberField
              label="Bullet Size (px)"
              name="bulletSize"
              min={12}
              max={22}
            />
          </div>
        </Section>

        {/* Formula Section */}
        <Section title="Commission Formula">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Formula Title Color"
              name="formulaTitleColor"
              allowRgba={false}
            />
            <NumberField
              label="Formula Title Size (px)"
              name="formulaTitleSize"
              min={16}
              max={60}
            />
            <ColorField
              label="Formula Icon Background"
              name="formulaIconBg"
              allowRgba={false}
            />
            <ColorField
              label="Formula Icon Color"
              name="formulaIconColor"
              allowRgba={false}
            />
            <ColorField
              label="Formula Label Color"
              name="formulaLabelColor"
              allowRgba={false}
            />
            <NumberField
              label="Formula Label Size (px)"
              name="formulaLabelSize"
              min={10}
              max={22}
            />
            <ColorField label="Sign Color" name="signColor" allowRgba={false} />
            <NumberField
              label="Sign Size (px)"
              name="signSize"
              min={18}
              max={70}
            />
          </div>
        </Section>

        {/* Example Table (inside modal) */}
        <Section title="Example Table (in Modal)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Table Border" name="exTableBorder" />
            <ColorField
              label="Header Background"
              name="exHeaderBg"
              allowRgba={false}
            />
            <ColorField
              label="Header Text Color"
              name="exHeaderText"
              allowRgba={false}
            />
            <ColorField label="Cell Border" name="exCellBorder" />
            <ColorField
              label="Row Background"
              name="exRowBg"
              allowRgba={false}
            />
            <ColorField
              label="Row Text Color"
              name="exRowText"
              allowRgba={false}
            />
            <ColorField
              label="Total Row Background"
              name="exTotalBg"
              allowRgba={false}
            />
            <ColorField
              label="Total Row Text Color"
              name="exTotalText"
              allowRgba={false}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffCommissionColorController;
