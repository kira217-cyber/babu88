import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaSyncAlt } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

/* UI HELPERS */
const Label = ({ children, required }) => (
  <label className="text-sm font-extrabold" style={{ color: "var(--l-label)" }}>
    {children} {required ? <span className="text-red-500 font-extrabold">*</span> : null}
  </label>
);

const ErrorText = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs font-semibold" style={{ color: "var(--l-error)" }}>
      {msg}
    </p>
  ) : null;

const Input = React.forwardRef(({ error, className = "", ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={["w-full px-4 py-3 md:py-4 outline-none transition", className].join(" ")}
    style={{
      borderRadius: "var(--l-input-radius)",
      background: "var(--l-input-bg)",
      color: "var(--l-input-text)",
      border: `1px solid ${error ? "var(--l-error)" : "var(--l-input-border)"}`,
      boxShadow: "var(--l-input-shadow)",
    }}
  />
));

/* COMPONENT */
export default function Login() {
  const { isBangla } = useLanguage();
  const [showPass, setShowPass] = useState(false);

  // ✅ Login Color Config
  const { data: loginCfg } = useQuery({
    queryKey: ["aff-login-color"],
    queryFn: async () => (await api.get("/api/aff-login-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const cfg = loginCfg || {};
  const cssVars = {
    "--l-page-bg": cfg.pageBg || "#4b4b4b",

    "--l-card-bg": cfg.cardBg || "#ffffff",
    "--l-card-border": cfg.cardBorder || "rgba(0,0,0,0.05)",
    "--l-card-shadow": cfg.cardShadow || "0 30px 90px rgba(0,0,0,0.35)",
    "--l-card-radius": `${cfg.cardRadius ?? 24}px`,

    "--l-header-border": cfg.headerBorder || "rgba(0,0,0,0.05)",
    "--l-title": cfg.titleColor || "#000000",
    "--l-subtitle": cfg.subtitleColor || "rgba(0,0,0,0.60)",

    "--l-label": cfg.labelColor || "rgba(0,0,0,0.80)",

    "--l-input-bg": cfg.inputBg || "#ffffff",
    "--l-input-text": cfg.inputText || "rgba(0,0,0,0.90)",
    "--l-input-border": cfg.inputBorder || "rgba(0,0,0,0.10)",
    "--l-input-shadow": cfg.inputShadow || "0 10px 30px rgba(0,0,0,0.06)",
    "--l-input-radius": `${cfg.inputRadius ?? 16}px`,
    "--l-input-placeholder": cfg.inputPlaceholder || "rgba(0,0,0,0.35)",
    "--l-input-focus-border": cfg.inputFocusBorder || "#f59e0b",
    "--l-input-focus-ring": cfg.inputFocusRing || "rgba(253,224,71,0.60)",

    "--l-icon-bg": cfg.iconBoxBg || "rgba(0,0,0,0.05)",
    "--l-icon": cfg.iconColor || "rgba(0,0,0,0.60)",

    "--l-eye": cfg.eyeIcon || "rgba(0,0,0,0.50)",
    "--l-eye-hover": cfg.eyeHoverIcon || "#000000",

    "--l-error": cfg.errorColor || "#dc2626",

    "--l-vcode-bg": cfg.vcodeBg || "#4b4b4b",
    "--l-vcode-text": cfg.vcodeText || "#ffffff",

    "--l-submit-bg": cfg.submitBg || "#f59e0b",
    "--l-submit-hover-bg": cfg.submitHoverBg || "#d97706",
    "--l-submit-text": cfg.submitText || "#000000",
    "--l-submit-shadow": cfg.submitShadow || "0 16px 40px rgba(245,158,11,0.35)",
    "--l-submit-size": `${cfg.submitTextSize ?? 16}px`,
    "--l-submit-radius": `${cfg.submitRadius ?? 16}px`,

    "--l-helper": cfg.helperText || "rgba(0,0,0,0.70)",
    "--l-link": cfg.linkColor || "#ca8a04",
    "--l-link-hover": cfg.linkHoverColor || "#a16207",
  };

  /* Verification Code */
  const genCode = () => {
    const chars = "123456789";
    let out = "";
    for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };
  const [vCode, setVCode] = useState(genCode);

  const t = useMemo(
    () => ({
      title: isBangla ? "লগইন করুন" : "Login",
      subtitle: isBangla ? "আপনার একাউন্টে প্রবেশ করুন" : "Access your account",
      username: isBangla ? "ইউজারনেম" : "Username",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      vcode: isBangla ? "ভেরিফিকেশন কোড" : "Verification Code",
      usernamePH: isBangla ? "ইউজারনেম লিখুন" : "Enter username",
      passPH: isBangla ? "পাসওয়ার্ড লিখুন" : "Enter password",
      required: isBangla ? "এই ফিল্ডটি বাধ্যতামূলক" : "This field is required",
      codeMismatch: isBangla ? "কোড মিলছে না" : "Code does not match",
      login: isBangla ? "লগইন করুন" : "Login",
      noAccount: isBangla ? "একাউন্ট নেই?" : "Don’t have an account?",
      registerNow: isBangla ? "রেজিস্টার করুন" : "Register",
    }),
    [isBangla],
  );

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: "", password: "", verifyInput: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    if ((data.verifyInput || "").trim().toUpperCase() !== vCode) return;
    // এখানে login API call দিবা
  };

  return (
    <div style={cssVars} className="min-h-screen flex items-center justify-center px-4 py-10 bg-[color:var(--l-page-bg)]">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-[520px]">
        <div
          className="overflow-hidden border"
          style={{
            background: "var(--l-card-bg)",
            borderColor: "var(--l-card-border)",
            borderRadius: "var(--l-card-radius)",
            boxShadow: "var(--l-card-shadow)",
          }}
        >
          {/* Header */}
          <div className="px-6 sm:px-8 py-6 border-b" style={{ borderColor: "var(--l-header-border)" }}>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--l-title)" }}>
              {t.title}
            </h1>
            <p className="mt-2 text-sm font-semibold" style={{ color: "var(--l-subtitle)" }}>
              {t.subtitle}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <Label required>{t.username}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="hidden sm:flex h-[52px] w-[52px] items-center justify-center"
                    style={{ borderRadius: "var(--l-input-radius)", background: "var(--l-icon-bg)", color: "var(--l-icon)" }}
                  >
                    <FaUser />
                  </div>
                  <div className="flex-1">
                    <Input placeholder={t.usernamePH} error={errors.username} {...register("username", { required: t.required })} />
                    <ErrorText msg={errors.username?.message} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <Label required>{t.password}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="hidden sm:flex h-[52px] w-[52px] items-center justify-center"
                    style={{ borderRadius: "var(--l-input-radius)", background: "var(--l-icon-bg)", color: "var(--l-icon)" }}
                  >
                    <FaLock />
                  </div>

                  <div className="flex-1 relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder={t.passPH}
                      error={errors.password}
                      {...register("password", { required: t.required })}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--l-eye)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--l-eye-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--l-eye)")}
                      aria-label="toggle password"
                    >
                      {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                    <ErrorText msg={errors.password?.message} />
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div>
                <Label required>{t.vcode}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <Input
                      error={errors.verifyInput}
                      {...register("verifyInput", {
                        required: t.required,
                        validate: (v) => (v || "").trim().toUpperCase() === vCode || t.codeMismatch,
                      })}
                    />
                    <ErrorText msg={errors.verifyInput?.message} />
                  </div>

                  <div
                    className="h-[48px] w-[120px] rounded-md flex items-center justify-between px-3"
                    style={{ background: "var(--l-vcode-bg)", color: "var(--l-vcode-text)" }}
                  >
                    <span className="font-extrabold tracking-wider text-[18px]">{vCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setVCode(genCode());
                        clearErrors("verifyInput");
                      }}
                      className="active:scale-95"
                      style={{ color: "var(--l-vcode-text)" }}
                      aria-label="refresh code"
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-4 font-extrabold transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  borderRadius: "var(--l-submit-radius)",
                  fontSize: "var(--l-submit-size)",
                  background: "var(--l-submit-bg)",
                  color: "var(--l-submit-text)",
                  boxShadow: "var(--l-submit-shadow)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--l-submit-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--l-submit-bg)")}
              >
                {isSubmitting ? (isBangla ? "প্রসেস হচ্ছে..." : "Processing...") : t.login}
              </button>

              {/* Register Link */}
              <p className="mt-4 text-center text-[13px] font-semibold" style={{ color: "var(--l-helper)" }}>
                {t.noAccount}{" "}
                <Link
                  to="/register"
                  className="font-extrabold underline underline-offset-2"
                  style={{ color: "var(--l-link)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--l-link-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--l-link)")}
                >
                  {t.registerNow}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Focus + Placeholder */}
      <style>{`
        input::placeholder { color: var(--l-input-placeholder); }
        input:focus {
          border-color: var(--l-input-focus-border) !important;
          box-shadow: 0 0 0 4px var(--l-input-focus-ring) !important;
        }
      `}</style>
    </div>
  );
}
