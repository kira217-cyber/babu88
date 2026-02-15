import React, { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FaEye, FaEyeSlash, FaSyncAlt, FaChevronDown } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

// Tiny Flag components (unchanged)
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

const resolveUrl = (baseURL, pathOrUrl) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseURL}${pathOrUrl}`;
};

const fetchRegisterConfig = async () => {
  const { data } = await api.get("/api/register-config");
  return data;
};

const DesktopRegister = () => {
  const { isBangla } = useLanguage();

  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);

  const genCode = () => String(Math.floor(1000 + Math.random() * 9000));
  const [vCode, setVCode] = useState(genCode());

  // ✅ config load
  const { data: cfg } = useQuery({
    queryKey: ["register-config"],
    queryFn: fetchRegisterConfig,
    staleTime: 1000 * 60 * 10,
  });

  // ✅ config view (desktop)
  const view = useMemo(() => {
    const d = cfg || {};
    return {
      // if you ever want to hide register by config
      isActive: d?.isActive ?? true,

      // images
      bannerUrl:
        resolveUrl(api.defaults.baseURL, d?.desktopBannerUrl) ||
        "https://babu88.gold/static/image/banner/registerBanner/register_banner_en.jpg",

      // desktop colors
      pageBg: d?.deskPageBg || "#f0f0f0",
      cardBg: d?.deskCardBg || "#ffffff",
      titleColor: d?.deskTitleColor || "#000000",
      subtitleColor: d?.deskSubTitleColor || "#000000",

      // register button
      registerBtnBg: d?.deskRegisterBtnBg || "#f2c200",
      registerBtnText: d?.deskRegisterBtnTextColor || "#000000",
      registerBtnTextSize: d?.deskRegisterBtnTextSizePx ?? 16,

      // vcode box
      vcodeBg: d?.deskVcodeBoxBg || "#8b8b8b",
      vcodeText: d?.deskVcodeBoxTextColor || "#ffffff",
    };
  }, [cfg]);

  // ✅ text (unchanged)
  const t = useMemo(() => {
    if (isBangla) {
      return {
        title: "অ্যাকাউন্ট খুলুন",
        subtitle:
          "No.1 Cricket Exchange & Betting Platform এ রেজিস্ট্রেশন করুন",
        username: "ইউজারনেম",
        password: "পাসওয়ার্ড",
        cpass: "কনফার্ম পাসওয়ার্ড",
        currency: "কারেন্সি",
        mobile: "মোবাইল নাম্বার",
        vcode: "ভেরিফিকেশন কোড",
        referral: "রেফারেল কোড",
        optional: "(ঐচ্ছিক)",
        registerBtn: "রেজিস্টার",
        required: "এটি অবশ্যই পূরণ করতে হবে",
        mismatch: "New password and confirm password is not same",
        min6: "কমপক্ষে ৬ অক্ষর",
        invalidCode: "ভুল ভেরিফিকেশন কোড",
        phoneInvalid: "সঠিক নাম্বার দিন",
        agreeText:
          "Register বাটনে ক্লিক করে আমি স্বীকার করছি যে আমার বয়স ১৮+ এবং আমি পড়েছি ও গ্রহণ করেছি শর্তাবলী ও নিয়মাবলী।",
        fillHere: "Fill up here",
        fillPass: "Fill up password here",
        fillCpass: "Confirm the password",
      };
    }

    return {
      title: "Create Account",
      subtitle:
        "Let's get you registered on the No.1 Cricket Exchange & Betting Platform",
      username: "Username",
      password: "Password",
      cpass: "Confirm Password",
      currency: "Currency",
      mobile: "Mobile Number",
      vcode: "Verification Code",
      referral: "Referral Code",
      optional: "(Optional)",
      registerBtn: "Register",
      required: "This is a mandatory field",
      mismatch: "New password and confirm password is not same",
      min6: "Minimum 6 characters",
      invalidCode: "Invalid verification code",
      phoneInvalid: "Enter valid number",
      agreeText:
        "By clicking the Register button, I hereby acknowledge that I am above 18 years old and have read and accepted your terms & conditions.",
      fillHere: "Fill up here",
      fillPass: "Fill up password here",
      fillCpass: "Confirm the password",
    };
  }, [isBangla]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      currency: "BDT",
      phone: "",
      verifyInput: "",
      referral: "",
      agree: false,
    },
    mode: "onSubmit",
  });

  const currency = useWatch({ control, name: "currency" });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "validate", message: t.mismatch });
      return;
    }
    if ((data.verifyInput || "").trim() !== vCode) {
      setError("verifyInput", { type: "validate", message: t.invalidCode });
      return;
    }
    if (!data.agree) {
      setError("agree", { type: "validate", message: t.required });
      return;
    }

    clearErrors();
    alert("Registered (demo)");
  };

  // --- UI atoms (match screenshot) ---
  const QIcon = () => (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-black/50 text-[10px] font-black text-black/80">
      ?
    </span>
  );

  const InfoIcon = () => (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#ff8a00] text-[10px] font-black text-[#ff8a00]">
      i
    </span>
  );

  const Label = ({ children, required, right }) => (
    <div className="flex items-center justify-between mb-1">
      <p className="text-[16px] font-semibold text-black/80">
        {children} {required && <span className="text-red-600">*</span>}
      </p>
      {right ? <div className="mr-1">{right}</div> : null}
    </div>
  );

  const Input = ({ error, ...props }) => (
    <input
      {...props}
      className={`w-full h-[48px] rounded-md border px-3 text-[18px] outline-none bg-white
      ${error ? "border-red-500" : "border-black/25"}`}
    />
  );

  const Select = ({ error, children, ...props }) => (
    <div className="relative w-full">
      <select
        {...props}
        className={`w-full h-[48px] rounded-md border bg-white px-3 pr-9 text-[18px] outline-none
        ${error ? "border-red-500" : "border-black/25"}`}
      >
        {children}
      </select>
    </div>
  );

  const ErrorText = ({ msg }) =>
    msg ? <p className="mt-1 text-[16px] text-red-500">{msg}</p> : null;

  const CurrencyFlag = () => (
    <span className="inline-flex items-center justify-center">
      {currency === "BDT" ? (
        <BdFlag className="h-10 w-10" />
      ) : (
        <EnFlag className="h-10 w-10" />
      )}
    </span>
  );

  // ✅ if you ever want to hide register by config
  if (view.isActive === false) return null;

  return (
    <>
      {/* ✅ Desktop/Tablet only */}
      <div
        className="hidden md:block min-h-screen py-10"
        style={{ background: view.pageBg }}
      >
        {/* Center card like screenshot */}
        <div
          className="mx-auto w-full max-w-5xl border border-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)]"
          style={{ background: view.cardBg }}
        >
          {/* Title */}
          <div className="pt-6 text-center px-6">
            <h1
              className="text-[18px] font-extrabold"
              style={{ color: view.titleColor }}
            >
              {t.title}
            </h1>
            <p
              className="mt-1 text-[11px]"
              style={{ color: view.subtitleColor }}
            >
              {t.subtitle}
            </p>
          </div>

          {/* Banner (full width) */}
          <div className="mt-4">
            <div className="w-full h-[220px] md overflow-hidden border border-black/10">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${view.bannerUrl})` }}
              />
            </div>
          </div>

          {/* Form area */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-8">
            <div className="mx-auto w-full max-w-[620px]">
              {/* Username */}
              <div className="mt-6">
                <Label required right={<QIcon />}>
                  {t.username}
                </Label>
                <Input
                  placeholder={t.fillHere}
                  error={errors.username}
                  {...register("username", { required: t.required })}
                />
                <ErrorText msg={errors.username?.message} />
              </div>

              {/* Password */}
              <div className="mt-4">
                <Label required right={<QIcon />}>
                  {t.password}
                </Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder={t.fillPass}
                    error={errors.password}
                    {...register("password", {
                      required: t.required,
                      minLength: { value: 6, message: t.min6 },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/45"
                    aria-label="toggle password"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorText msg={errors.password?.message} />
              </div>

              {/* Confirm Password */}
              <div className="mt-4">
                <Label required>{t.cpass}</Label>
                <div className="relative">
                  <Input
                    type={showCpass ? "text" : "password"}
                    placeholder={t.fillCpass}
                    error={errors.confirmPassword}
                    {...register("confirmPassword", { required: t.required })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/45"
                    aria-label="toggle confirm password"
                  >
                    {showCpass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorText msg={errors.confirmPassword?.message} />
              </div>

              {/* Currency */}
              <div className="mt-4">
                <Label required>{t.currency}</Label>
                <div className="flex items-center gap-2">
                  {/* right tiny flag (your requirement) */}
                  <div>
                    <CurrencyFlag />
                  </div>
                  <div className="flex-1">
                    <Select
                      error={errors.currency}
                      {...register("currency", { required: true })}
                    >
                      <option value="BDT">BDT</option>
                      <option value="USDT">USDT</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="mt-4">
                <Label required right={<InfoIcon />}>
                  {t.mobile}
                </Label>
                <div className="flex gap-2">
                  <div className="h-[48px] w-[90px] rounded-md border border-black/25 bg-[#efefef] flex items-center px-3 text-[18px] text-black/60">
                    +880
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={t.fillHere}
                      error={errors.phone}
                      {...register("phone", {
                        required: t.required,
                        pattern: {
                          value: /^[0-9]{9,11}$/,
                          message: t.phoneInvalid,
                        },
                      })}
                    />
                  </div>
                </div>
                <ErrorText msg={errors.phone?.message} />
              </div>

              {/* Verification Code */}
              <div className="mt-4">
                <Label required>{t.vcode}</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder=""
                      error={errors.verifyInput}
                      {...register("verifyInput", { required: t.required })}
                    />
                    <ErrorText msg={errors.verifyInput?.message} />
                  </div>

                  {/* code box (right) */}
                  <div
                    className="h-[48px] w-[120px] rounded-md flex items-center justify-between px-3"
                    style={{ background: view.vcodeBg, color: view.vcodeText }}
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
                      style={{ color: view.vcodeText }}
                      aria-label="refresh code"
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[18px] font-semibold text-black/70">
                    {t.referral}
                  </p>
                  <FaChevronDown className="text-black/40 text-[12px]" />
                </div>
                <Input
                  placeholder={t.optional}
                  error={false}
                  {...register("referral")}
                />
              </div>

              {/* Register button (pill) - config driven */}
              <button
                type="submit"
                className="mt-7 w-full h-[42px] rounded-full font-extrabold shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] active:scale-[0.99]"
                style={{
                  background: view.registerBtnBg,
                  color: view.registerBtnText,
                  fontSize: view.registerBtnTextSize,
                }}
              >
                {t.registerBtn}
              </button>

              {/* Agree */}
              <div className="mt-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-[2px] h-6 w-6 accent-black"
                  {...register("agree")}
                />
                <p className="text-[12px] leading-snug text-black/65">
                  {t.agreeText}
                </p>
              </div>
              <ErrorText msg={errors.agree?.message} />
            </div>
          </form>
        </div>
      </div>

      {/* mobile hidden */}
      <div className="md:hidden" />
    </>
  );
};

export default DesktopRegister;
