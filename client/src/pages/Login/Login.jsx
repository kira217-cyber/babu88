import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";

const Login = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const [showPass, setShowPass] = useState(false);

  const t = useMemo(() => {
    if (isBangla) {
      return {
        // desktop
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
        // mobile
        topMobile: "BABU88 এ লগইন করুন",
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
      topMobile: "Login to BABU88",
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

  const onSubmit = (data) => {
    // ✅ এখানে তোমার real login flow বসবে
    // console.log(data);
    navigate("/");
  };

  const QIcon = () => (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/60 text-[12px] font-black text-black/80">
      ?
    </span>
  );

  const LabelRow = ({ label, required }) => (
    <div className="flex items-center justify-between mb-2">
      <p className="text-[14px] font-semibold text-black">
        {label} {required && <span className="text-red-600">*</span>}
      </p>
      <QIcon />
    </div>
  );

  /* =========================
     ✅ DESKTOP (matches 1st image)
  ========================== */
  const DesktopView = () => (
    <div className="hidden md:flex min-h-screen bg-[#e9e9e9] items-start justify-center py-10">
      <div className="w-full max-w-[680px]">
        {/* top title */}
        <div className="text-center">
          <h1 className="text-[22px] font-extrabold text-black">
            {t.titleDesktop}
          </h1>
          <p className="mt-1 text-[14px] text-black/80">{t.subDesktop}</p>
        </div>

        {/* card */}
        <div className="mt-6 bg-white border border-black/10 px-12 py-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-[620px] mx-auto"
          >
            {/* Username */}
            <LabelRow label={t.username} required />
            <div
              className={`w-full rounded-xl border bg-white ${
                errors.username ? "border-red-500" : "border-black/40"
              }`}
            >
              <input
                className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
                placeholder={t.placeholder}
                {...register("username", { required: true })}
              />
            </div>

            {/* Password */}
            <div className="mt-6">
              <LabelRow label={t.password} required />
              <div
                className={`w-full rounded-xl border bg-white ${
                  errors.password ? "border-red-500" : "border-black/40"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
                    placeholder={t.placeholder}
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="px-4 text-black/55"
                    aria-label="toggle password"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full mt-8 h-14 rounded-xl bg-[#ffd000] text-black font-extrabold text-[16px] active:scale-[0.99]"
            >
              {t.login}
            </button>

            {/* Forgot */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[12px] text-blue-600 underline"
              >
                {t.forgot}
              </button>
            </div>

            {/* register line */}
            <div className="mt-1 text-center text-[12px] text-black/70">
              {t.noAcc}{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 underline"
              >
                {t.registerHere}
              </button>
            </div>

            {/* divider */}
            <div className="mt-6 border-t border-black/20" />

            {/* help text */}
            <p className="mt-4 text-center text-[11px] text-black/75 leading-relaxed">
              {t.help}
            </p>
          </form>
        </div>
      </div>
    </div>
  );

  /* =========================
     ✅ MOBILE (matches 2nd image)
  ========================== */
  const MobileView = () => (
    <div className="md:hidden min-h-screen bg-white">
      {/* top black bar */}
      <div className="w-full bg-black py-3 text-center">
        <p className="text-white font-extrabold text-[16px]">{t.topMobile}</p>
      </div>

      <div className="px-4 pt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-semibold text-black">
              {t.username} <span className="text-red-600">*</span>
            </p>
            <QIcon />
          </div>
          <div
            className={`w-full rounded-xl border bg-white ${
              errors.username ? "border-red-500" : "border-black/40"
            }`}
          >
            <input
              className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
              placeholder={t.placeholder}
              {...register("username", { required: true })}
            />
          </div>

          {/* Password */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[14px] font-semibold text-black">
                {t.password} <span className="text-red-600">*</span>
              </p>
              <QIcon />
            </div>
            <div
              className={`w-full rounded-xl border bg-white ${
                errors.password ? "border-red-500" : "border-black/40"
              }`}
            >
              <div className="flex items-center">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full h-12 px-4 rounded-xl outline-none text-[14px]"
                  placeholder={t.placeholder}
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="px-4 text-black/55"
                  aria-label="toggle password"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* forgot password right aligned like screenshot */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[13px] text-black/40 underline font-semibold"
              >
                {t.forgot}
              </button>
            </div>
          </div>

          {/* blue login button */}
          <button
            type="submit"
            className="w-full mt-4 h-12 rounded-xl bg-[#0a63c8] text-[#ffd000] font-extrabold text-[15px] active:scale-[0.99]"
          >
            {t.login}
          </button>

          {/* divider */}
          <div className="mt-6 border-t border-black/20" />

          {/* signup block */}
          <div className="mt-5">
            <p className="text-[14px] text-black/40 font-semibold">
              {t.dontHave}
            </p>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full mt-3 h-12 rounded-xl bg-[#ffd000] text-black font-extrabold text-[15px] active:scale-[0.99]"
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
