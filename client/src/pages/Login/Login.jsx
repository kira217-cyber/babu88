import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { demoLogin } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

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

const Login = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();

  const { data: loginColor } = useQuery({
    queryKey: ["login-color"],
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

  const handleDemoLogin = () => {
    dispatch(demoLogin());
    navigate("/");
  };

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
        topMobile: "লগইন করুন",
        dontHave: "অ্যাকাউন্ট নেই?",
        signUp: "সাইন আপ",
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
      topMobile: "Login",
      dontHave: "Don't have an account?",
      signUp: "Sign Up",
    };
  }, [isBangla]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = () => {
    navigate("/");
  };

  const QIcon = () => (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/60 text-[12px] font-black text-black/80">
      ?
    </span>
  );

  const LabelRow = ({ label, required }) => (
    <div className="flex items-center justify-between mb-2">
      <p
        className="text-[14px] font-semibold text-black"
        style={{
          color: ui.desktopLabelColor,
          fontSize: ui.desktopLabelSize,
          fontWeight: ui.desktopLabelWeight,
        }}
      >
        {label}{" "}
        {required && <span style={{ color: ui.desktopRequiredColor }}>*</span>}
      </p>
      <QIcon />
    </div>
  );

  const DesktopView = () => (
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
          >
            <LabelRow label={t.username} required />
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
                {...register("username", { required: true })}
              />
            </div>

            <div className="mt-6">
              <LabelRow label={t.password} required />
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
                    className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
                    style={{
                      backgroundColor: ui.desktopInputBg,
                      color: ui.desktopInputTextColor,
                      fontSize: ui.desktopInputTextSize,
                    }}
                    placeholder={t.placeholder}
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="px-4 text-black/55"
                    aria-label="toggle password"
                    style={{
                      color: ui.desktopEyeColor,
                      opacity: ui.desktopEyeOpacity,
                    }}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              onClick={handleDemoLogin}
              className="w-full mt-8 h-14 rounded-xl bg-[#ffd000] text-black font-extrabold text-[16px] active:scale-[0.99]"
              style={{
                backgroundColor: ui.desktopLoginBtnBg,
                color: ui.desktopLoginBtnText,
                fontSize: ui.desktopLoginBtnTextSize,
              }}
            >
              {t.login}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[12px] text-blue-600 underline"
                style={{ color: ui.desktopForgotColor }}
              >
                {t.forgot}
              </button>
            </div>

            <div className="mt-1 text-center text-[12px] text-black/70">
              {t.noAcc}{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 underline"
                style={{ color: ui.desktopRegisterColor }}
              >
                {t.registerHere}
              </button>
            </div>

            <div
              className="mt-6 border-t border-black/20"
              style={{ borderTopColor: ui.desktopDivider }}
            />

            <p
              className="mt-4 text-center text-[11px] text-black/75 leading-relaxed"
              style={{
                color: ui.desktopHelpColor,
                opacity: ui.desktopHelpOpacity,
              }}
            >
              {t.help}
            </p>
          </form>
        </div>
      </div>
    </div>
  );

  const MobileView = () => (
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
        <form onSubmit={handleSubmit(onSubmit)}>
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
              {...register("username", { required: true })}
            />
          </div>

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
                  className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
                  style={{
                    backgroundColor: ui.desktopInputBg,
                    color: ui.desktopInputTextColor,
                    fontSize: ui.desktopInputTextSize,
                  }}
                  placeholder={t.placeholder}
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="px-4 text-black/55"
                  aria-label="toggle password"
                  style={{
                    color: ui.desktopEyeColor,
                    opacity: ui.desktopEyeOpacity,
                  }}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[13px] text-black/40 underline font-semibold"
                style={{
                  color: ui.mobileForgotColor,
                  opacity: ui.mobileForgotOpacity,
                }}
              >
                {t.forgot}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 h-12 rounded-xl bg-[#0a63c8] text-[#ffd000] font-extrabold text-[15px] active:scale-[0.99]"
            style={{
              backgroundColor: ui.mobileLoginBtnBg,
              color: ui.mobileLoginBtnText,
              fontSize: ui.mobileLoginBtnTextSize,
            }}
          >
            {t.login}
          </button>

          <div
            className="mt-6 border-t border-black/20"
            style={{ borderTopColor: ui.desktopDivider }}
          />

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
              className="w-full mt-3 h-12 rounded-xl bg-[#ffd000] text-black font-extrabold text-[15px] active:scale-[0.99]"
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

  return (
    <>
      <DesktopView />
      <MobileView />
    </>
  );
};

export default Login;
