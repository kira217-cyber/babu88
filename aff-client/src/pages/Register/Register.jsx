import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaPhoneAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

/* FLAGS unchanged */
const BdFlag = ({ className = "" }) => (
  <span
    className={`relative inline-block rounded-full bg-[#006a4e] ${className}`}
    aria-hidden="true"
  >
    <span className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f42a41]" />
  </span>
);

const EnFlag = ({ className = "" }) => (
  <span
    className={`relative inline-block rounded-full bg-[#012169] ${className}`}
    aria-hidden="true"
  >
    <span className="absolute inset-0 rounded-full opacity-90" />
    <span className="absolute left-1/2 top-0 h-full w-[28%] -translate-x-1/2 bg-white/95" />
    <span className="absolute top-1/2 left-0 w-full h-[28%] -translate-y-1/2 bg-white/95" />
    <span className="absolute left-1/2 top-0 h-full w-[16%] -translate-x-1/2 bg-[#C8102E]" />
    <span className="absolute top-1/2 left-0 w-full h-[16%] -translate-y-1/2 bg-[#C8102E]" />
  </span>
);

const Label = ({ children, required }) => (
  <label className="text-sm font-extrabold" style={{ color: "var(--r-label)" }}>
    {children}{" "}
    {required ? <span className="text-red-500 font-extrabold">*</span> : null}
  </label>
);

const ErrorText = ({ msg }) =>
  msg ? (
    <p
      className="mt-1 text-xs font-semibold"
      style={{ color: "var(--r-error)" }}
    >
      {msg}
    </p>
  ) : null;

const Input = React.forwardRef(({ error, className = "", ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={[
      "w-full px-4 py-3 md:py-4 outline-none transition",
      className,
    ].join(" ")}
    style={{
      borderRadius: "var(--r-input-radius)",
      background: "var(--r-input-bg)",
      color: "var(--r-input-text)",
      border: `1px solid ${error ? "var(--r-error)" : "var(--r-input-border)"}`,
      boxShadow: "var(--r-input-shadow)",
    }}
    placeholder={props.placeholder}
  />
));

const Select = React.forwardRef(
  ({ error, className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      {...props}
      className={[
        "w-full px-4 py-3 md:py-4 outline-none transition",
        className,
      ].join(" ")}
      style={{
        borderRadius: "var(--r-input-radius)",
        background: "var(--r-input-bg)",
        color: "var(--r-input-text)",
        border: `1px solid ${error ? "var(--r-error)" : "var(--r-input-border)"}`,
        boxShadow: "var(--r-input-shadow)",
      }}
    >
      {children}
    </select>
  ),
);

export default function Register() {
  const { isBangla } = useLanguage();
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // ✅ Register Color Config
  const { data: regCfg } = useQuery({
    queryKey: ["aff-register-color"],
    queryFn: async () => (await api.get("/api/aff-register-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const cfg = regCfg || {};
  const cssVars = {
    "--r-page-bg": cfg.pageBg || "#4b4b4b",

    "--r-card-bg": cfg.cardBg || "#ffffff",
    "--r-card-border": cfg.cardBorder || "rgba(0,0,0,0.05)",
    "--r-card-shadow": cfg.cardShadow || "0 30px 90px rgba(0,0,0,0.35)",
    "--r-card-radius": `${cfg.cardRadius ?? 24}px`,

    "--r-header-border": cfg.headerBorder || "rgba(0,0,0,0.05)",
    "--r-title": cfg.titleColor || "#000000",
    "--r-subtitle": cfg.subtitleColor || "rgba(0,0,0,0.60)",

    "--r-label": cfg.labelColor || "rgba(0,0,0,0.80)",

    "--r-input-bg": cfg.inputBg || "#ffffff",
    "--r-input-text": cfg.inputText || "rgba(0,0,0,0.90)",
    "--r-input-border": cfg.inputBorder || "rgba(0,0,0,0.10)",
    "--r-input-shadow": cfg.inputShadow || "0 10px 30px rgba(0,0,0,0.06)",
    "--r-input-radius": `${cfg.inputRadius ?? 16}px`,

    "--r-icon-bg": cfg.iconBoxBg || "rgba(0,0,0,0.05)",
    "--r-icon": cfg.iconColor || "rgba(0,0,0,0.60)",

    "--r-error": cfg.errorColor || "#dc2626",

    "--r-vcode-bg": cfg.vcodeBg || "#4b4b4b",
    "--r-vcode-text": cfg.vcodeText || "#ffffff",

    "--r-agree": cfg.agreeTextColor || "rgba(0,0,0,0.65)",

    "--r-submit-bg": cfg.submitBg || "#f59e0b",
    "--r-submit-hover-bg": cfg.submitHoverBg || "#d97706",
    "--r-submit-text": cfg.submitText || "#000000",
    "--r-submit-shadow":
      cfg.submitShadow || "0 16px 40px rgba(245,158,11,0.35)",
    "--r-submit-size": `${cfg.submitTextSize ?? 16}px`,

    "--r-link": cfg.linkColor || "#ca8a04",
    "--r-link-hover": cfg.linkHoverColor || "#a16207",

    "--r-note": cfg.noteTextColor || "rgba(0,0,0,0.55)",
  };

  // generate verification code
  const genCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 5; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };
  const [vCode, setVCode] = useState(genCode);

  const t = useMemo(
    () => ({
      title: isBangla ? "নতুন একাউন্ট তৈরি করুন" : "Create your account",
      subtitle: isBangla
        ? "রেজিস্ট্রেশন ফর্মটি পূরণ করুন"
        : "Fill the form to register",
      username: isBangla ? "ইউজারনেম" : "Username",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      currency: isBangla ? "কারেন্সি" : "Currency",
      mobile: isBangla ? "মোবাইল নাম্বার" : "Mobile Number",
      vcode: isBangla ? "ভেরিফিকেশন কোড" : "Verification Code",
      referral: isBangla ? "রেফারেল কোড (ঐচ্ছিক)" : "Referral Code (Optional)",
      agreeText: isBangla
        ? "আমি শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত"
        : "I agree to the Terms & Privacy Policy",
      haveAccount: isBangla
        ? "ইতিমধ্যে একাউন্ট আছে?"
        : "Already have an account?",
      loginNow: isBangla ? "লগইন করুন" : "Login",
      register: isBangla ? "রেজিস্টার করুন" : "Register",
      usernamePH: isBangla ? "ইউজারনেম লিখুন" : "Enter username",
      passPH: isBangla ? "পাসওয়ার্ড লিখুন" : "Enter password",
      confirmPH: isBangla ? "আবার পাসওয়ার্ড লিখুন" : "Re-enter password",
      mobilePH: isBangla ? "০১XXXXXXXXX" : "01XXXXXXXXX",
      referralPH: isBangla ? "রেফারেল কোড" : "Referral code",
      required: isBangla ? "এই ফিল্ডটি বাধ্যতামূলক" : "This field is required",
      passMin: isBangla
        ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
        : "Password must be at least 6 characters",
      passMatch: isBangla ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match",
      mobileInvalid: isBangla
        ? "সঠিক মোবাইল নাম্বার দিন (১১ ডিজিট)"
        : "Enter a valid 11-digit mobile number",
      codeMismatch: isBangla ? "কোড মিলছে না" : "Code does not match",
    }),
    [isBangla],
  );

  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      currency: "BDT",
      mobile: "",
      verifyInput: "",
      referralCode: "",
      agree: false,
    },
    mode: "onTouched",
  });

  const currency = watch("currency");
  const passwordValue = watch("password");

  const CurrencyFlag = () => (
    <span className="inline-flex items-center justify-center">
      {currency === "BDT" ? (
        <BdFlag className="h-10 w-10" />
      ) : (
        <EnFlag className="h-10 w-10" />
      )}
    </span>
  );

  const onSubmit = async (data) => {
    // তোমার API call এখানে দিবা
  };

  return (
    <div
      style={cssVars}
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-[color:var(--r-page-bg)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[980px]"
      >
        <div
          className="overflow-hidden border"
          style={{
            background: "var(--r-card-bg)",
            borderColor: "var(--r-card-border)",
            borderRadius: "var(--r-card-radius)",
            boxShadow: "var(--r-card-shadow)",
          }}
        >
          <div
            className="px-6 sm:px-10 py-4 sm:py-4 border-b"
            style={{ borderColor: "var(--r-header-border)" }}
          >
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-center"
              style={{ color: "var(--r-title)" }}
            >
              {t.title}
            </h1>
            <p
              className="mt-2 text-sm sm:text-[15px] text-center font-semibold"
              style={{ color: "var(--r-subtitle)" }}
            >
              {t.subtitle}
            </p>
          </div>

          <div className="px-6 sm:px-10 py-6 sm:py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <Label required>{t.username}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="hidden sm:flex h-[52px] w-[52px] items-center justify-center"
                    style={{
                      borderRadius: "var(--r-input-radius)",
                      background: "var(--r-icon-bg)",
                      color: "var(--r-icon)",
                    }}
                  >
                    <FaUser />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={t.usernamePH}
                      error={errors.username}
                      autoComplete="username"
                      {...register("username", { required: t.required })}
                    />
                    <ErrorText msg={errors.username?.message} />
                  </div>
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label required>{t.password}</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className="hidden sm:flex h-[52px] w-[52px] items-center justify-center"
                      style={{
                        borderRadius: "var(--r-input-radius)",
                        background: "var(--r-icon-bg)",
                        color: "var(--r-icon)",
                      }}
                    >
                      <FaLock />
                    </div>

                    <div className="flex-1 relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder={t.passPH}
                        error={errors.password}
                        autoComplete="new-password"
                        {...register("password", {
                          required: t.required,
                          minLength: { value: 6, message: t.passMin },
                        })}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(0,0,0,0.55)" }}
                        aria-label="toggle password"
                      >
                        {showPass ? (
                          <FaEyeSlash size={18} />
                        ) : (
                          <FaEye size={18} />
                        )}
                      </button>
                      <ErrorText msg={errors.password?.message} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label required>{t.confirmPassword}</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className="hidden sm:flex h-[52px] w-[52px] items-center justify-center"
                      style={{
                        borderRadius: "var(--r-input-radius)",
                        background: "var(--r-icon-bg)",
                        color: "var(--r-icon)",
                      }}
                    >
                      <FaLock />
                    </div>

                    <div className="flex-1 relative">
                      <Input
                        type={showPass2 ? "text" : "password"}
                        placeholder={t.confirmPH}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        {...register("confirmPassword", {
                          required: t.required,
                          validate: (v) => v === passwordValue || t.passMatch,
                        })}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass2((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(0,0,0,0.55)" }}
                        aria-label="toggle confirm password"
                      >
                        {showPass2 ? (
                          <FaEyeSlash size={18} />
                        ) : (
                          <FaEye size={18} />
                        )}
                      </button>
                      <ErrorText msg={errors.confirmPassword?.message} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="mt-4">
                <Label required>{t.currency}</Label>
                <div className="flex items-center gap-3 mt-2">
                  <CurrencyFlag />
                  <div className="flex-1">
                    <Select
                      error={errors.currency}
                      {...register("currency", { required: t.required })}
                    >
                      <option value="BDT">BDT</option>
                      <option value="USDT">USDT</option>
                    </Select>
                    <ErrorText msg={errors.currency?.message} />
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="mt-4">
                <Label required>{t.mobile}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="hidden sm:flex h-[52px] w-[52px] items-center justify-center"
                    style={{
                      borderRadius: "var(--r-input-radius)",
                      background: "var(--r-icon-bg)",
                      color: "var(--r-icon)",
                    }}
                  >
                    <FaPhoneAlt />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={t.mobilePH}
                      error={errors.mobile}
                      inputMode="numeric"
                      {...register("mobile", {
                        required: t.required,
                        pattern: {
                          value: /^01\d{9}$/,
                          message: t.mobileInvalid,
                        },
                      })}
                    />
                    <ErrorText msg={errors.mobile?.message} />
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div className="mt-4">
                <Label required>{t.vcode}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <Input
                      placeholder=""
                      error={errors.verifyInput}
                      {...register("verifyInput", {
                        required: t.required,
                        validate: (v) =>
                          (v || "").trim().toUpperCase() === vCode ||
                          t.codeMismatch,
                      })}
                    />
                    <ErrorText msg={errors.verifyInput?.message} />
                  </div>

                  <div
                    className="h-[48px] w-[120px] rounded-md flex items-center justify-between px-3"
                    style={{
                      background: "var(--r-vcode-bg)",
                      color: "var(--r-vcode-text)",
                    }}
                  >
                    <span className="font-extrabold tracking-wider text-[18px]">
                      {vCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVCode(genCode());
                        clearErrors("verifyInput");
                      }}
                      className="active:scale-95"
                      style={{ color: "var(--r-vcode-text)" }}
                      aria-label="refresh code"
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral */}
              <div className="mt-4">
                <Label>{t.referral}</Label>
                <div className="mt-2">
                  <Input
                    placeholder={t.referralPH}
                    error={errors.referralCode}
                    {...register("referralCode")}
                  />
                </div>
              </div>

              {/* Agree */}
              <div className="mt-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-[2px] h-6 w-6"
                  style={{ accentColor: cfg.checkboxAccent || "#000000" }}
                  {...register("agree", { required: t.required })}
                />
                <p
                  className="text-[12px] leading-snug font-semibold"
                  style={{ color: "var(--r-agree)" }}
                >
                  {t.agreeText}
                </p>
              </div>
              <ErrorText msg={errors.agree?.message} />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-4 font-extrabold transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  borderRadius: "16px",
                  fontSize: "var(--r-submit-size)",
                  background: "var(--r-submit-bg)",
                  color: "var(--r-submit-text)",
                  boxShadow: "var(--r-submit-shadow)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--r-submit-hover-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--r-submit-bg)")
                }
              >
                {isSubmitting
                  ? isBangla
                    ? "প্রসেস হচ্ছে..."
                    : "Processing..."
                  : t.register}
              </button>

              {/* Login link */}
              <p
                className="mt-4 text-center text-[13px] font-semibold"
                style={{ color: "rgba(0,0,0,0.70)" }}
              >
                {t.haveAccount}{" "}
                <Link
                  to="/login"
                  className="font-extrabold underline underline-offset-2"
                  style={{ color: "var(--r-link)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--r-link-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--r-link)")
                  }
                >
                  {t.loginNow}
                </Link>
              </p>

              <p
                className="text-xs sm:text-sm text-center font-semibold mt-3"
                style={{ color: "var(--r-note)" }}
              >
                {isBangla
                  ? "রেজিস্টার করলে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।"
                  : "By registering, you agree to our terms."}
              </p>
            </form>
          </div>
        </div>
      </motion.div>

      {/* ✅ Focus colors (CSS vars based) */}
      <style>{`
        input::placeholder { color: var(--r-input-placeholder, rgba(0,0,0,0.35)); }
        input:focus, select:focus {
          border-color: var(--r-input-focus-border) !important;
          box-shadow: 0 0 0 4px var(--r-input-focus-ring) !important;
        }
      `}</style>
    </div>
  );
}
