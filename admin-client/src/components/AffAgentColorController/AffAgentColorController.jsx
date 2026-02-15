import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

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

  // Consistent styling classes (same as other controllers)
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section & Title */}
        <Section title="Main Section">
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
            <NumberField
              label="Section Vertical Padding (px)"
              name="sectionPadY"
              min={20}
              max={120}
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
            <NumberField
              label="Title Margin Bottom (px)"
              name="titleMarginBottom"
              min={0}
              max={80}
            />
          </div>
        </Section>

        {/* Left Paragraph */}
        <Section title="Description Text">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Paragraph Color" name="paraColor" />
            <NumberField
              label="Paragraph Size (px)"
              name="paraSize"
              min={12}
              max={22}
            />
          </div>
        </Section>

        {/* Check List */}
        <Section title="Check List">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Checkmark Background"
              name="checkBg"
              allowRgba={false}
            />
            <ColorField
              label="Checkmark Icon Color"
              name="checkIcon"
              allowRgba={false}
            />
            <NumberField
              label="Checkmark Radius (px)"
              name="checkRadius"
              min={0}
              max={12}
            />
            <ColorField
              label="List Text Color"
              name="listTextColor"
              allowRgba={false}
            />
            <NumberField
              label="List Text Size (px)"
              name="listTextSize"
              min={12}
              max={22}
            />
          </div>
        </Section>

        {/* Right Card */}
        <Section title="Right Percentage Card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Card Background"
              name="cardBg"
              allowRgba={false}
            />
            <ColorField label="Card Border" name="cardBorder" />
            <NumberField
              label="Card Radius (px)"
              name="cardRadius"
              min={0}
              max={30}
            />
            <ShadowField
              label="Card Shadow (CSS)"
              name="cardShadow"
              placeholder="0 8px 20px rgba(0,0,0,0.45)"
            />
            <ColorField
              label="Percentage Color"
              name="percentColor"
              allowRgba={false}
            />
            <NumberField
              label="Percentage Size (px)"
              name="percentSize"
              min={32}
              max={120}
            />
            <ColorField
              label="Strip / Label Color"
              name="stripColor"
              allowRgba={false}
            />
            <NumberField
              label="Strip / Label Size (px)"
              name="stripSize"
              min={12}
              max={40}
            />
          </div>
        </Section>

        {/* Button */}
        <Section title="Action Button">
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
      </div>
    </div>
  );
};

export default AffAgentColorController;
