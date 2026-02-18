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

// ──────────────────────────────────────────────
// Mobile Login (standalone)
// ──────────────────────────────────────────────
const MobileLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const [showPass, setShowPass] = useState(false);

  const { data: loginColor } = useQuery({
    queryKey: ["login-color-mobile"],
    queryFn: fetchLoginColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = loginColor || {};
    return {
      // desktop keys use করছ mobile ui তে (তোমার design same রাখতে)
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

      desktopDivider: rgba(
        d.desktopDividerColor || "#000000",
        d.desktopDividerOpacity ?? 0.2,
      ),

      mobilePageBg: d.mobilePageBg || "#ffffff",
      mobileTopBarBg: d.mobileTopBarBg || "#000000",
      mobileTopBarTextColor: d.mobileTopBarTextColor || "#ffffff",
      mobileTopBarTextSize: d.mobileTopBarTextSize ?? 16,

      mobileForgotColor: d.mobileForgotColor || "#000000",
      mobileForgotOpacity: d.mobileForgotOpacity ?? 0.4,

      mobileLoginBtnBg: d.mobileLoginBtnBg || "#0a63c8",
      mobileLoginBtnText: d.mobileLoginBtnText || "#ffd000",
      mobileLoginBtnTextSize: d.mobileLoginBtnTextSize ?? 15,

      mobileSignupBtnBg: d.mobileSignupBtnBg || "#ffd000",
      mobileSignupBtnText: d.mobileSignupBtnText || "#000000",
      mobileSignupBtnTextSize: d.mobileSignupBtnTextSize ?? 15,

      mobileMutedTextColor: d.mobileMutedTextColor || "#000000",
      mobileMutedTextOpacity: d.mobileMutedTextOpacity ?? 0.4,
    };
  }, [loginColor]);

  const t = useMemo(() => {
    if (isBangla) {
      return {
        topMobile: "লগইন করুন",
        username: "ইউজারনেম",
        password: "পাসওয়ার্ড",
        placeholder: "এখানে লিখুন",
        login: "লগইন",
        forgot: "পাসওয়ার্ড ভুলে গেছেন",
        dontHave: "অ্যাকাউন্ট নেই?",
        signUp: "সাইন আপ",

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
      topMobile: "Login",
      username: "Username",
      password: "Password",
      placeholder: "Fill up here",
      login: "Login",
      forgot: "Forgot Password",
      dontHave: "Don't have an account?",
      signUp: "Sign Up",

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
      className="md:hidden min-h-screen bg-white"
      style={{ backgroundColor: ui.mobilePageBg }}
    >
      <div
        className="w-full bg-black py-3 text-center"
        style={{ backgroundColor: ui.mobileTopBarBg }}
      >
        <p
          className="text-white font-extrabold text-[16px]"
          style={{
            color: ui.mobileTopBarTextColor,
            fontSize: ui.mobileTopBarTextSize,
          }}
        >
          {t.topMobile}
        </p>
      </div>

      <div className="px-4 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Username */}
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[14px] font-semibold text-black"
              style={{
                color: ui.desktopLabelColor,
                fontSize: ui.desktopLabelSize,
                fontWeight: ui.desktopLabelWeight,
              }}
            >
              {t.username}{" "}
              <span style={{ color: ui.desktopRequiredColor }}>*</span>
            </p>
            <QIcon />
          </div>

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

          {/* Password */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-[14px] font-semibold text-black"
                style={{
                  color: ui.desktopLabelColor,
                  fontSize: ui.desktopLabelSize,
                  fontWeight: ui.desktopLabelWeight,
                }}
              >
                {t.password}{" "}
                <span style={{ color: ui.desktopRequiredColor }}>*</span>
              </p>
              <QIcon />
            </div>

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

            {/* <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[13px] text-black/40 underline font-semibold cursor-pointer"
                style={{
                  color: ui.mobileForgotColor,
                  opacity: ui.mobileForgotOpacity,
                }}
              >
                {t.forgot}
              </button>
            </div> */}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 h-12 rounded-xl bg-[#0a63c8] text-[#ffd000] font-extrabold text-[15px] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: ui.mobileLoginBtnBg,
              color: ui.mobileLoginBtnText,
              fontSize: ui.mobileLoginBtnTextSize,
            }}
          >
            {isSubmitting
              ? isBangla
                ? "প্রসেস হচ্ছে..."
                : "Processing..."
              : t.login}
          </button>

          <div
            className="mt-6 border-t border-black/20"
            style={{ borderTopColor: ui.desktopDivider }}
          />

          {/* Register */}
          <div className="mt-5">
            <p
              className="text-[14px] text-black/40 font-semibold"
              style={{
                color: ui.mobileMutedTextColor,
                opacity: ui.mobileMutedTextOpacity,
              }}
            >
              {t.dontHave}
            </p>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full mt-3 h-12 rounded-xl bg-[#ffd000] text-black font-extrabold text-[15px] active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: ui.mobileSignupBtnBg,
                color: ui.mobileSignupBtnText,
                fontSize: ui.mobileSignupBtnTextSize,
              }}
            >
              {t.signUp}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileLogin;
