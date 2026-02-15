import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffBottomNavbarColorController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    barBg: "#2b2b2b",
    barBorderTop: "rgba(255,255,255,0.10)",

    padX: 12,
    padY: 8,
    gap: 12,

    btnTextSize: 14,
    btnRadius: 6,
    btnPadY: 12,

    loginBg: "#3f3f3f",
    loginHoverBg: "#4b4b4b",
    loginText: "#ffffff",
    loginActiveRing: "#f5b400",
    loginActiveRingWidth: 2,

    registerBg: "#f5b400",
    registerHoverBg: "#e2a800",
    registerText: "#000000",
    registerActiveRing: "rgba(0,0,0,0.40)",
    registerActiveRingWidth: 2,
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
      const res = await api.get("/api/aff-bottom-navbar-color");
      if (res.data) setForm((p) => ({ ...p, ...res.data }));
    } catch (e) {
      toast.error("Failed to load bottom navbar settings");
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
      await api.put("/api/aff-bottom-navbar-color", form);
      toast.success("Bottom navbar configuration saved successfully!");
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
                Affiliate Bottom Navbar Controller
              </h2>
              <p className={subtitleCls}>
                Customize background, buttons, spacing, active states & sizes of
                the bottom navigation bar
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
        {/* Bar Settings */}
        <Section title="Bottom Bar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Bar Background" name="barBg" allowRgba={false} />
            <ColorField label="Top Border Color" name="barBorderTop" />
            <NumberField label="Padding X (px)" name="padX" min={0} max={40} />
            <NumberField label="Padding Y (px)" name="padY" min={0} max={40} />
            <NumberField
              label="Gap Between Buttons (px)"
              name="gap"
              min={0}
              max={40}
            />
          </div>
        </Section>

        {/* Common Button Styles */}
        <Section title="Buttons (Common Styles)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Button Text Size (px)"
              name="btnTextSize"
              min={10}
              max={24}
            />
            <NumberField
              label="Button Radius (px)"
              name="btnRadius"
              min={0}
              max={30}
            />
            <NumberField
              label="Button Vertical Padding (px)"
              name="btnPadY"
              min={6}
              max={24}
            />
          </div>
        </Section>

        {/* Login Button */}
        <Section title="Login Button">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField label="Background" name="loginBg" allowRgba={false} />
            <ColorField
              label="Hover Background"
              name="loginHoverBg"
              allowRgba={false}
            />
            <ColorField label="Text Color" name="loginText" allowRgba={false} />
            <ColorField
              label="Active Ring Color"
              name="loginActiveRing"
              allowRgba={false}
            />
            <NumberField
              label="Active Ring Width (px)"
              name="loginActiveRingWidth"
              min={0}
              max={8}
            />
          </div>
        </Section>

        {/* Register Button */}
        <Section title="Register Button">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorField
              label="Background"
              name="registerBg"
              allowRgba={false}
            />
            <ColorField
              label="Hover Background"
              name="registerHoverBg"
              allowRgba={false}
            />
            <ColorField
              label="Text Color"
              name="registerText"
              allowRgba={false}
            />
            <ColorField label="Active Ring Color" name="registerActiveRing" />
            <NumberField
              label="Active Ring Width (px)"
              name="registerActiveRingWidth"
              min={0}
              max={8}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AffBottomNavbarColorController;
