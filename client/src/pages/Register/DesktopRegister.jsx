import React, { useMemo, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FaEye, FaEyeSlash, FaSyncAlt, FaChevronDown } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setAuth } from "../../features/auth/authSlice";

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

const DesktopRegister = ({ refCode = "" }) => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      isActive: d?.isActive ?? true,

      bannerUrl:
        resolveUrl(api.defaults.baseURL, d?.desktopBannerUrl) ||
        "https://babu88.gold/static/image/banner/registerBanner/register_banner_en.jpg",

      pageBg: d?.deskPageBg || "#f0f0f0",
      cardBg: d?.deskCardBg || "#ffffff",
      titleColor: d?.deskTitleColor || "#000000",
      subtitleColor: d?.deskSubTitleColor || "#000000",

      registerBtnBg: d?.deskRegisterBtnBg || "#f2c200",
      registerBtnText: d?.deskRegisterBtnTextColor || "#000000",
      registerBtnTextSize: d?.deskRegisterBtnTextSizePx ?? 16,

      vcodeBg: d?.deskVcodeBoxBg || "#8b8b8b",
      vcodeText: d?.deskVcodeBoxTextColor || "#ffffff",
    };
  }, [cfg]);

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
        success: "রেজিস্টার সফল হয়েছে",
        failed: "রেজিস্টার ব্যর্থ হয়েছে",
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
      success: "Registration successful",
      failed: "Registration failed",
    };
  }, [isBangla]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    reset,
    setValue, // ✅ IMPORTANT (auto fill)
    formState: { errors, isSubmitting },
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

  // ✅ auto-fill referral from URL query (?ref=KYYNNW)
  useEffect(() => {
    const code = (refCode || "").trim();
    if (!code) return;

    setValue("referral", code, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [refCode, setValue]);

  const currency = useWatch({ control, name: "currency" });

  const onSubmit = async (data) => {
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

    try {
      clearErrors();

      const raw = String(data.phone || "").trim();
      const payload = {
        username: (data.username || "").trim(),
        phone: raw,
        password: data.password,
        currency: data.currency,
        referral: (data.referral || "").trim(), // ✅ এখানে auto ref যাবে
      };

      const res = await api.post("/api/users/register", payload);

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (token && user) {
        dispatch(setAuth({ user, token }));
      }

      toast.success(t.success);

      reset();
      setVCode(genCode());
      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || t.failed;

      if (status === 409) {
        const lower = String(msg).toLowerCase();
        if (lower.includes("username")) {
          setError("username", { type: "server", message: msg });
        } else if (lower.includes("phone") || lower.includes("mobile")) {
          setError("phone", { type: "server", message: msg });
        } else {
          toast.error(msg);
        }
        return;
      }

      if (status === 400 && String(msg).toLowerCase().includes("referral")) {
        setError("referral", { type: "server", message: msg });
        return;
      }

      toast.error(msg);
    }
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

  const LabelRow = ({ children, required, right }) => (
    <div className="flex items-center justify-between mb-1">
      <p className="text-[16px] font-semibold text-black/80">
        {children} {required && <span className="text-red-600">*</span>}
      </p>
      {right ? <div className="mr-1">{right}</div> : null}
    </div>
  );

  const InputField = ({ error, ...props }) => (
    <input
      {...props}
      className={`w-full h-[48px] rounded-md border px-3 text-[18px] outline-none bg-white
      ${error ? "border-red-500" : "border-black/25"}`}
    />
  );

  const SelectField = ({ error, children, ...props }) => (
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

  if (view.isActive === false) return null;

  return (
    <>
      {/* ✅ Desktop/Tablet only */}
      <div
        className="hidden md:block min-h-screen py-10"
        style={{ background: view.pageBg }}
      >
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

          {/* Banner */}
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
                <LabelRow required right={<QIcon />}>
                  {t.username}
                </LabelRow>
                <InputField
                  placeholder={t.fillHere}
                  error={errors.username}
                  {...register("username", { required: t.required })}
                />
                <ErrorText msg={errors.username?.message} />
              </div>

              {/* Password */}
              <div className="mt-4">
                <LabelRow required right={<QIcon />}>
                  {t.password}
                </LabelRow>
                <div className="relative">
                  <InputField
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
                <LabelRow required>{t.cpass}</LabelRow>
                <div className="relative">
                  <InputField
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
                <LabelRow required>{t.currency}</LabelRow>
                <div className="flex items-center gap-2">
                  <div>
                    <CurrencyFlag />
                  </div>
                  <div className="flex-1">
                    <SelectField
                      error={errors.currency}
                      {...register("currency", { required: true })}
                    >
                      <option value="BDT">BDT</option>
                      <option value="USDT">USDT</option>
                    </SelectField>
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="mt-4">
                <LabelRow required right={<InfoIcon />}>
                  {t.mobile}
                </LabelRow>
                <div className="flex gap-2">
                  <div className="h-[48px] w-[90px] rounded-md border border-black/25 bg-[#efefef] flex items-center px-3 text-[18px] text-black/60">
                    +880
                  </div>
                  <div className="flex-1">
                    <InputField
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
                <LabelRow required>{t.vcode}</LabelRow>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <InputField
                      placeholder=""
                      error={errors.verifyInput}
                      {...register("verifyInput", { required: t.required })}
                    />
                    <ErrorText msg={errors.verifyInput?.message} />
                  </div>

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

              {/* Referral Code (✅ auto filled here) */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[18px] font-semibold text-black/70">
                    {t.referral}
                  </p>
                  <FaChevronDown className="text-black/40 text-[12px]" />
                </div>

                <InputField
                  placeholder={t.optional}
                  error={errors.referral}
                  {...register("referral")}
                />
                <ErrorText msg={errors.referral?.message} />
              </div>

              {/* Register button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 w-full h-[42px] rounded-full font-extrabold shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: view.registerBtnBg,
                  color: view.registerBtnText,
                  fontSize: view.registerBtnTextSize,
                }}
              >
                {isSubmitting
                  ? isBangla
                    ? "প্রসেস হচ্ছে..."
                    : "Processing..."
                  : t.registerBtn}
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

      <div className="md:hidden" />
    </>
  );
};

export default DesktopRegister;
