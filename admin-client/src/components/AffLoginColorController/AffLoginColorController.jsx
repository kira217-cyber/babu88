import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffLoginColorController = () => {
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
    inputShadow: "0 10px 30px rgba(0,0,0,0.06)",
    inputRadius: 16,
    inputFocusBorder: "#f59e0b",
    inputFocusRing: "rgba(253,224,71,0.60)",

    iconBoxBg: "rgba(0,0,0,0.05)",
    iconColor: "rgba(0,0,0,0.60)",

    eyeIcon: "rgba(0,0,0,0.50)",
    eyeHoverIcon: "#000000",

    errorColor: "#dc2626",

    vcodeBg: "#4b4b4b",
    vcodeText: "#ffffff",

    submitBg: "#f59e0b",
    submitHoverBg: "#d97706",
    submitText: "#000000",
    submitShadow: "0 16px 40px rgba(245,158,11,0.35)",
    submitTextSize: 16,
    submitRadius: 16,

    helperText: "rgba(0,0,0,0.70)",
    linkColor: "#ca8a04",
    linkHoverColor: "#a16207",
  });

  // ──────────────────────────────────────────────
  // Consistent styling classes (same as other controllers)
  // ──────────────────────────────────────────────
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
      const res = await api.get("/api/aff-login-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load login page settings");
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
      await api.put("/api/aff-login-color", form);
      toast.success("Login page configuration saved successfully!");
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
                Affiliate Login Page Controller
              </h2>
              <p className={subtitleCls}>
                Customize colors, shadows, radii, and elements of the affiliate
                login page
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
        {/* Page + Card */}
        <Section title="Page & Card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Page Background"
              name="pageBg"
              allowRgba={false}
            />
            <ColorField
              label="Card Background"
              name="cardBg"
              allowRgba={false}
            />
            <ColorField label="Card Border" name="cardBorder" />
            <ShadowField
              label="Card Shadow (CSS)"
              name="cardShadow"
              placeholder="0 30px 90px rgba(0,0,0,0.35)"
            />
            <NumberField
              label="Card Radius (px)"
              name="cardRadius"
              min={0}
              max={60}
            />
            <ColorField label="Header Border" name="headerBorder" />
          </div>
        </Section>

        {/* Header + Labels */}
        <Section title="Header & Text">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Title Color"
              name="titleColor"
              allowRgba={false}
            />
            <ColorField label="Subtitle Color" name="subtitleColor" />
            <ColorField label="Label Color" name="labelColor" />
            <ColorField
              label="Error Message Color"
              name="errorColor"
              allowRgba={false}
            />
          </div>
        </Section>

        {/* Inputs + Icons */}
        <Section title="Form Inputs & Icons">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Input Background"
              name="inputBg"
              allowRgba={false}
            />
            <ColorField label="Input Text Color" name="inputText" />
            <ColorField label="Placeholder Color" name="inputPlaceholder" />
            <ColorField label="Input Border" name="inputBorder" />
            <ColorField
              label="Focus Border Color"
              name="inputFocusBorder"
              allowRgba={false}
            />
            <ColorField
              label="Focus Ring (rgba recommended)"
              name="inputFocusRing"
            />
            <ShadowField
              label="Input Shadow (CSS)"
              name="inputShadow"
              placeholder="0 10px 30px rgba(0,0,0,0.06)"
            />
            <NumberField
              label="Input Radius (px)"
              name="inputRadius"
              min={0}
              max={40}
            />

            <ColorField label="Icon Box Background" name="iconBoxBg" />
            <ColorField label="Icon Color" name="iconColor" />
            <ColorField label="Eye Icon Color" name="eyeIcon" />
            <ColorField
              label="Eye Icon Hover Color"
              name="eyeHoverIcon"
              allowRgba={false}
            />
          </div>
        </Section>

        {/* Verification Code */}
        <Section title="Verification Code Box">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Background" name="vcodeBg" allowRgba={false} />
            <ColorField label="Text Color" name="vcodeText" allowRgba={false} />
          </div>
        </Section>

        {/* Submit Button + Link */}
        <Section title="Submit Button & Register Link">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Submit Background"
              name="submitBg"
              allowRgba={false}
            />
            <ColorField
              label="Submit Hover Background"
              name="submitHoverBg"
              allowRgba={false}
            />
            <ColorField
              label="Submit Text Color"
              name="submitText"
              allowRgba={false}
            />
            <ShadowField
              label="Submit Button Shadow (CSS)"
              name="submitShadow"
              placeholder="0 16px 40px rgba(245,158,11,0.35)"
            />
            <NumberField
              label="Submit Text Size (px)"
              name="submitTextSize"
              min={12}
              max={24}
            />
            <NumberField
              label="Submit Radius (px)"
              name="submitRadius"
              min={0}
              max={40}
            />

            <ColorField label="Helper Text Color" name="helperText" />
            <ColorField
              label="Register Link Color"
              name="linkColor"
              allowRgba={false}
            />
            <ColorField
              label="Register Link Hover Color"
              name="linkHoverColor"
              allowRgba={false}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffLoginColorController;
