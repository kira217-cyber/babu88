import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { api } from "../../api/axios";
import { setAuth } from "../../features/auth/authSlice";
import { useLanguage } from "../../Context/LanguageProvider";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const fetchLoginColor = async () => {
  const { data } = await api.get("/api/login-color");
  return data;
};

const rgba = (hex, a = 1) => {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
};

const QIcon = () => (
  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/60 text-[12px] font-black text-black/80">
    ?
  </span>
);

const LabelRow = ({
  label,
  required,
  labelColor,
  labelSize,
  labelWeight,
  requiredColor,
}) => (
  <div className="flex items-center justify-between mb-2">
    <p
      className="text-[14px] font-semibold text-black"
      style={{
        color: labelColor,
        fontSize: labelSize,
        fontWeight: labelWeight,
      }}
    >
      {label} {required && <span style={{ color: requiredColor }}>*</span>}
    </p>
    <QIcon />
  </div>
);

// ──────────────────────────────────────────────
// Desktop Login (standalone)
// ──────────────────────────────────────────────
const DesktopLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();
  const [showPass, setShowPass] = useState(false);

  const { data: loginColor } = useQuery({
    queryKey: ["login-color-desktop"],
    queryFn: fetchLoginColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = loginColor || {};
    return {
      desktopPageBg: d.desktopPageBg || "#e9e9e9",
      desktopTitleColor: d.desktopTitleColor || "#000000",
      desktopSubColor: d.desktopSubColor || "#000000",
      desktopSubOpacity: d.desktopSubOpacity ?? 0.8,

      desktopCardBg: d.desktopCardBg || "#ffffff",
      desktopCardBorder: rgba(
        d.desktopCardBorderColor || "#000000",
        d.desktopCardBorderOpacity ?? 0.1,
      ),

      desktopLabelColor: d.desktopLabelColor || "#000000",
      desktopLabelSize: d.desktopLabelSize ?? 14,
      desktopLabelWeight: d.desktopLabelWeight ?? 600,
      desktopRequiredColor: d.desktopRequiredColor || "#dc2626",

      desktopInputBg: d.desktopInputBg || "#ffffff",
      desktopInputTextColor: d.desktopInputTextColor || "#000000",
      desktopInputTextSize: d.desktopInputTextSize ?? 14,
      desktopInputBorder: rgba(
        d.desktopInputBorderColor || "#000000",
        d.desktopInputBorderOpacity ?? 0.4,
      ),
      desktopInputErrorBorder: d.desktopInputErrorBorderColor || "#ef4444",

      desktopEyeColor: d.desktopEyeColor || "#000000",
      desktopEyeOpacity: d.desktopEyeOpacity ?? 0.55,

      desktopLoginBtnBg: d.desktopLoginBtnBg || "#ffd000",
      desktopLoginBtnText: d.desktopLoginBtnText || "#000000",
      desktopLoginBtnTextSize: d.desktopLoginBtnTextSize ?? 16,

      desktopForgotColor: d.desktopForgotColor || "#2563eb",
      desktopRegisterColor: d.desktopRegisterColor || "#2563eb",

      desktopHelpColor: d.desktopHelpColor || "#000000",
      desktopHelpOpacity: d.desktopHelpOpacity ?? 0.75,

      desktopDivider: rgba(
        d.desktopDividerColor || "#000000",
        d.desktopDividerOpacity ?? 0.2,
      ),
    };
  }, [loginColor]);

  const t = useMemo(() => {
    if (isBangla) {
      return {
        titleDesktop: "লগইন",
        subDesktop: "আবার স্বাগতম!",
        username: "ইউজারনেম",
        password: "পাসওয়ার্ড",
        placeholder: "এখানে লিখুন",
        login: "লগইন",
        forgot: "পাসওয়ার্ড ভুলে গেছেন",
        noAcc: "অ্যাকাউন্ট নেই?",
        registerHere: "এখানে রেজিস্টার করুন",
        help: "লগইনে কোনো সমস্যা হলে সহায়তার জন্য আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন LiveChat এর মাধ্যমে।",

        required: "এটি অবশ্যই পূরণ করতে হবে",
        notUser: "এটি ইউজার একাউন্ট নয়।",
        notActive:
          "আপনার একাউন্টটি নিষ্ক্রিয়। অনুগ্রহ করে এডমিনের সাথে যোগাযোগ করুন।",
        success: "লগইন সফল হয়েছে",
        failed: "লগইন ব্যর্থ হয়েছে",
        invalidCredentials: "ইউজারনেম বা পাসওয়ার্ড ভুল",
        serverError: "সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন",
      };
    }

    return {
      titleDesktop: "Login",
      subDesktop: "Welcome back!",
      username: "Username",
      password: "Password",
      placeholder: "Fill up here",
      login: "Login",
      forgot: "Forgot Password",
      noAcc: "Don't have an account yet?",
      registerHere: "Register here",
      help: "If you encounter any issue logging in, please contact our customer service for assistance via LiveChat.",

      required: "This field is required",
      notUser: "This is not a user account.",
      notActive: "Your account is disabled. Please contact admin.",
      success: "Login successful",
      failed: "Login failed",
      invalidCredentials: "Invalid username or password",
      serverError: "Server error. Please try again later.",
    };
  }, [isBangla]);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const onSubmit = async (form) => {
    try {
      clearErrors();

      const payload = {
        username: String(form.username || "").trim(),
        password: form.password,
      };

      if (!payload.username || !payload.password) {
        toast.error(t.required);
        return;
      }

      const res = await api.post("/api/users/login", payload);

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (!token || !user || !user.role) {
        toast.error(t.failed);
        return;
      }

      if (user.role !== "user") {
        toast.error(t.notUser);
        return;
      }

      if (user.isActive !== true) {
        toast.error(t.notActive);
        return;
      }

      dispatch(setAuth({ user, token }));
      toast.success(t.success);
      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message || err?.message || t.failed;

      if (status === 400) msg = t.required;
      else if (status === 401) msg = t.invalidCredentials;
      else if (status === 403)
        msg = err?.response?.data?.message || t.notActive;
      else if (status >= 500) msg = t.serverError;

      toast.error(msg);
    }
  };

  return (
    <div
      className="hidden md:flex min-h-screen bg-[#e9e9e9] items-start justify-center py-10"
      style={{ backgroundColor: ui.desktopPageBg }}
    >
      <div className="w-full max-w-[680px]">
        <div className="text-center">
          <h1
            className="text-[22px] font-extrabold text-black"
            style={{ color: ui.desktopTitleColor }}
          >
            {t.titleDesktop}
          </h1>
          <p
            className="mt-1 text-[14px] text-black/80"
            style={{ color: ui.desktopSubColor, opacity: ui.desktopSubOpacity }}
          >
            {t.subDesktop}
          </p>
        </div>

        <div
          className="mt-6 bg-white border border-black/10 px-12 py-10"
          style={{
            backgroundColor: ui.desktopCardBg,
            borderColor: ui.desktopCardBorder,
          }}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-[620px] mx-auto"
            noValidate
          >
            <LabelRow
              label={t.username}
              required
              labelColor={ui.desktopLabelColor}
              labelSize={ui.desktopLabelSize}
              labelWeight={ui.desktopLabelWeight}
              requiredColor={ui.desktopRequiredColor}
            />

            <div
              className={`w-full rounded-xl border bg-white ${
                errors.username ? "border-red-500" : "border-black/40"
              }`}
              style={{
                backgroundColor: ui.desktopInputBg,
                borderColor: errors.username
                  ? ui.desktopInputErrorBorder
                  : ui.desktopInputBorder,
              }}
            >
              <input
                className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
                style={{
                  backgroundColor: ui.desktopInputBg,
                  color: ui.desktopInputTextColor,
                  fontSize: ui.desktopInputTextSize,
                }}
                placeholder={t.placeholder}
                autoComplete="username"
                {...register("username", { required: t.required })}
              />
            </div>

            {errors.username && (
              <p className="mt-2 text-[12px] font-semibold text-red-500">
                {errors.username.message}
              </p>
            )}

            <div className="mt-6">
              <LabelRow
                label={t.password}
                required
                labelColor={ui.desktopLabelColor}
                labelSize={ui.desktopLabelSize}
                labelWeight={ui.desktopLabelWeight}
                requiredColor={ui.desktopRequiredColor}
              />

              <div
                className={`w-full rounded-xl border bg-white ${
                  errors.password ? "border-red-500" : "border-black/40"
                }`}
                style={{
                  backgroundColor: ui.desktopInputBg,
                  borderColor: errors.password
                    ? ui.desktopInputErrorBorder
                    : ui.desktopInputBorder,
                }}
              >
                <div className="flex items-center">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full h-12 px-4 rounded-xl outline-none text-[14px] flex-1"
                    style={{
                      backgroundColor: ui.desktopInputBg,
                      color: ui.desktopInputTextColor,
                      fontSize: ui.desktopInputTextSize,
                    }}
                    placeholder={t.placeholder}
                    autoComplete="current-password"
                    {...register("password", { required: t.required })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="px-4 text-black/55 cursor-pointer"
                    aria-label="toggle password visibility"
                    style={{
                      color: ui.desktopEyeColor,
                      opacity: ui.desktopEyeOpacity,
                    }}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {errors.password && (
                <p className="mt-2 text-[12px] font-semibold text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 h-14 rounded-xl bg-[#ffd000] text-black font-extrabold text-[16px] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: ui.desktopLoginBtnBg,
                color: ui.desktopLoginBtnText,
                fontSize: ui.desktopLoginBtnTextSize,
              }}
            >
              {isSubmitting
                ? isBangla
                  ? "প্রসেস হচ্ছে..."
                  : "Processing..."
                : t.login}
            </button>

            {/* <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[12px] text-blue-600 underline cursor-pointer"
                style={{ color: ui.desktopForgotColor }}
              >
                {t.forgot}
              </button>
            </div> */}

            <div
              className="mt-6 border-t border-black/20"
              style={{ borderTopColor: ui.desktopDivider }}
            />

            <div className="mt-5 text-center">
              <p
                className="text-[14px] text-black/70"
                style={{
                  color: ui.desktopHelpColor,
                  opacity: ui.desktopHelpOpacity,
                }}
              >
                {t.noAcc}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 underline cursor-pointer"
                  style={{ color: ui.desktopRegisterColor }}
                >
                  {t.registerHere}
                </button>
              </p>
            </div>

            <div className="mt-8 text-center">
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color: ui.desktopHelpColor,
                  opacity: ui.desktopHelpOpacity,
                }}
              >
                {t.help}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesktopLogin;
