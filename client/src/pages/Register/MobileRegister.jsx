import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { useNavigate } from "react-router";
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

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const resolveUrl = (baseURL, pathOrUrl) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseURL}${pathOrUrl}`;
};

const fetchRegisterConfig = async () => {
  const { data } = await api.get("/api/register-config");
  return data;
};

const MobileRegister = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);

  const genCode = () => String(Math.floor(1000 + Math.random() * 9000));
  const [vCode, setVCode] = useState(genCode());

  // ✅ load admin config
  const { data: cfg } = useQuery({
    queryKey: ["register-config"],
    queryFn: fetchRegisterConfig,
    staleTime: 1000 * 60 * 10,
  });

  // ✅ config view (mobile)
  const view = useMemo(() => {
    const d = cfg || {};

    // image
    const bannerUrl =
      resolveUrl(api.defaults.baseURL, d?.mobileBannerUrl) ||
      "https://babu88.gold/static/image/banner/registerBanner/register_banner_en.jpg";

    return {
      isActive: d?.isActive ?? true,

      // banner image
      bannerUrl,

      // page
      pageBg: d?.mobPageBg || "#ffffff",

      // top bar
      topBarBg: d?.mobTopBarBg || "#000000",
      topBarText: d?.mobTopBarTextColor || "#f5b400",
      topBarTextSize: d?.mobTopBarTextSizePx ?? 16,

      // stepper
      stepCircleActiveBg: d?.mobStepCircleActiveBg || "#000000",
      stepCircleActiveText: d?.mobStepCircleActiveText || "#ffffff",
      stepCircleInactiveBg: d?.mobStepCircleInactiveBg || "#d9d9d9",
      stepCircleInactiveText: d?.mobStepCircleInactiveText || "#ffffff",
      stepDoneOuterBg: d?.mobStepDoneOuterBg || "#000000",
      stepDoneBorder: d?.mobStepDoneBorder || "#f5b400",
      stepDoneTick: d?.mobStepDoneTick || "#f5b400",
      stepLineActive: d?.mobStepLineActive || "#000000",
      stepLineInactive: d?.mobStepLineInactive || "#d9d9d9",

      // labels / inputs
      labelColor: d?.mobLabelColor || "#000000",
      inputBg: d?.mobInputBg || "#ffffff",
      inputBorder: d?.mobInputBorder || "rgba(0,0,0,0.25)",
      inputText: d?.mobInputTextColor || "#000000",
      inputTextSize: d?.mobInputTextSizePx ?? 14,
      inputIconColor: d?.mobInputIconColor || "rgba(0,0,0,0.6)",
      errorText: d?.mobErrorTextColor || "#ef4444",

      // select
      selectBg: d?.mobSelectBg || "#ffffff",
      selectBorder: d?.mobSelectBorder || "rgba(0,0,0,0.25)",

      // verify code box
      vcodeBoxBg: d?.mobVcodeBoxBg || "#4b4b4b",
      vcodeBoxText: d?.mobVcodeBoxText || "#ffffff",

      // country prefix box
      prefixBg: d?.mobPrefixBg || "#efefef",
      prefixBorder: d?.mobPrefixBorder || "rgba(0,0,0,0.25)",
      prefixText: d?.mobPrefixText || "rgba(0,0,0,0.7)",

      // checkbox accent
      checkboxAccent: d?.mobCheckboxAccent || "#000000",

      // buttons
      primaryBtnBg: d?.mobPrimaryBtnBg || "#0a63c8",
      primaryBtnText: d?.mobPrimaryBtnText || "#ffffff",
      primaryBtnTextSize: d?.mobPrimaryBtnTextSizePx ?? 15,

      yellowBtnBg: d?.mobYellowBtnBg || "#d7a900",
      yellowBtnText: d?.mobYellowBtnText || "#000000",
      yellowBtnTextSize: d?.mobYellowBtnTextSizePx ?? 15,

      // back link
      backLinkColor: d?.mobBackLinkColor || "rgba(0,0,0,0.7)",
    };
  }, [cfg]);

  const t = useMemo(() => {
    if (isBangla) {
      return {
        topRegister: "রেজিস্টার করুন",
        topWelcome: "Babu88 এ স্বাগতম",
        step1: {
          username: "ইউজারনেম",
          password: "পাসওয়ার্ড",
          cpass: "কনফার্ম পাসওয়ার্ড",
          currency: "কারেন্সি",
          next: "পরবর্তী",
          required: "এটি অবশ্যই পূরণ করতে হবে",
          passMin: "কমপক্ষে ৬ অক্ষর",
          passMismatch: "পাসওয়ার্ড মিলেনি",
          fillHere: "এখানে লিখুন",
          fillPass: "এখানে পাসওয়ার্ড লিখুন",
          confirmPass: "পাসওয়ার্ড নিশ্চিত করুন",
        },
        step2: {
          code: "ভেরিফিকেশন কোড",
          phone: "ফোন নাম্বার",
          referral: "রেফারেল কোড",
          optional: "(ঐচ্ছিক)",
          complete: "রেজিস্ট্রেশন সম্পন্ন করুন",
          back: "পেছনে যান",
          invalidCode: "ভুল ভেরিফিকেশন কোড",
          agreeNeed: "আপনাকে সম্মত হতে হবে",
          agreeText1: "আমি আইনগত বয়সের এবং আমি সম্মত",
          terms: "শর্তাবলী",
          and: "এবং",
          conditions: "নিয়মাবলী",
          fillPhone: "এখানে লিখুন",
          validPhone: "সঠিক নাম্বার দিন",
        },
        done: {
          congrats: "অভিনন্দন!",
          msg1: "আপনি এখন রেজিস্টার্ড মেম্বার হয়েছেন",
          msg2: "Bangladesh’s #1 Cricket Exchange and",
          msg3: "Betting Platform",
          bonus: "এখনই ডিপোজিট করুন এবং ১০০% ওয়েলকাম বোনাস নিন!",
          deposit: "ডিপোজিট করুন",
          home: "হোম পেজে যান",
        },
      };
    }

    return {
      topRegister: "Register now",
      topWelcome: "Welcome to Babu88",
      step1: {
        username: "Username",
        password: "Password",
        cpass: "Confirm Password",
        currency: "Currency",
        next: "Next",
        required: "This is a mandatory field",
        passMin: "Minimum 6 characters",
        passMismatch: "Password does not match",
        fillHere: "Fill up here",
        fillPass: "Fill up password here",
        confirmPass: "Confirm the password",
      },
      step2: {
        code: "Verification Code",
        phone: "Phone Number",
        referral: "Referral Code",
        optional: "(Optional)",
        complete: "Complete Registration",
        back: "Back",
        invalidCode: "Invalid verification code",
        agreeNeed: "You must agree",
        agreeText1: "I am of legal age and i agree with the",
        terms: "Terms",
        and: "and",
        conditions: "Conditions",
        fillPhone: "Fill up here",
        validPhone: "Enter valid number",
      },
      done: {
        congrats: "Congratulations!",
        msg1: "You are now a registered member of",
        msg2: "Bangladesh’s #1 Cricket Exchange and",
        msg3: "Betting Platform",
        bonus: "Deposit now and get 100% Welcome Bonus!",
        deposit: "Deposit Now",
        home: "Go to Home page",
      },
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
      referral: "",
      agree: false,
      verifyInput: "",
    },
    mode: "onSubmit",
  });

  const selectedCurrency = useWatch({ control, name: "currency" });

  const onStep1 = (data, e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "validate",
        message: t.step1.passMismatch,
      });
      return;
    }
    clearErrors("confirmPassword");
    setStep(1);
  };

  const onStep2 = (data, e) => {
    e.preventDefault();
    if ((data.verifyInput || "").trim() !== vCode) {
      setError("verifyInput", {
        type: "validate",
        message: t.step2.invalidCode,
      });
      return;
    }
    if (!data.agree) {
      setError("agree", { type: "validate", message: t.step2.agreeNeed });
      return;
    }
    setStep(2);
  };

  const TopBar = ({ title }) => (
    <div
      className="w-full py-3 text-center"
      style={{ background: view.topBarBg }}
    >
      <p
        className="font-extrabold"
        style={{ color: view.topBarText, fontSize: view.topBarTextSize }}
      >
        {title}
      </p>
    </div>
  );

  const Banner = () => (
    <div className="w-full h-[86px] relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${view.bannerUrl})` }}
      />
    </div>
  );

  const Stepper = () => {
    const Circle = ({ active, done, children }) => {
      if (done) {
        return (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: view.stepDoneOuterBg }}
          >
            <div
              className="w-7 h-7 rounded-full border-[3px] flex items-center justify-center"
              style={{ borderColor: view.stepDoneBorder }}
            >
              <span
                className="text-base font-black"
                style={{ color: view.stepDoneTick }}
              >
                ✓
              </span>
            </div>
          </div>
        );
      }

      return (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: active
              ? view.stepCircleActiveBg
              : view.stepCircleInactiveBg,
            color: active
              ? view.stepCircleActiveText
              : view.stepCircleInactiveText,
          }}
        >
          <span className="font-black">{children}</span>
        </div>
      );
    };

    const Line = ({ active }) => (
      <div
        className="h-[3px] w-14 rounded-full"
        style={{
          background: active ? view.stepLineActive : view.stepLineInactive,
        }}
      />
    );

    return (
      <div className="w-full flex items-center justify-center gap-3 py-5">
        <Circle active={step === 0} done={step > 0}>
          1
        </Circle>
        <Line active={step > 0} />
        <Circle active={step === 1} done={step > 1}>
          2
        </Circle>
        <Line active={step > 1} />
        <Circle active={false} done={step > 1}>
          3
        </Circle>
      </div>
    );
  };

  const LabelRow = ({ label, required, rightIcon }) => (
    <div className="flex items-center justify-between mb-2">
      <p
        className="font-semibold"
        style={{ color: view.labelColor, fontSize: 14 }}
      >
        {label} {required && <span className="text-red-600">*</span>}
      </p>
      {rightIcon ? (
        <div style={{ color: view.inputIconColor }} className="text-lg">
          {rightIcon}
        </div>
      ) : null}
    </div>
  );

  const ErrorText = ({ msg }) =>
    msg ? (
      <p className="text-[11px] mt-1" style={{ color: view.errorText }}>
        {msg}
      </p>
    ) : null;

  const InputShell = ({ children, hasError }) => (
    <div
      className="w-full rounded-lg border"
      style={{
        background: view.inputBg,
        borderColor: hasError ? view.errorText : view.inputBorder,
      }}
    >
      {children}
    </div>
  );

  const PrimaryBtn = ({ children, type = "button", onClick }) => (
    <button
      type={type}
      onClick={onClick}
      className="w-full mt-5 h-12 rounded-xl font-extrabold active:scale-[0.99]"
      style={{
        background: view.primaryBtnBg,
        color: view.primaryBtnText,
        fontSize: view.primaryBtnTextSize,
      }}
    >
      {children}
    </button>
  );

  const YellowBtn = ({ children, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-xl font-extrabold active:scale-[0.99]"
      style={{
        background: view.yellowBtnBg,
        color: view.yellowBtnText,
        fontSize: view.yellowBtnTextSize,
      }}
    >
      {children}
    </button>
  );

  const CurrencyIcon = () => (
    <span className="inline-flex items-center justify-center">
      {selectedCurrency === "BDT" ? (
        <BdFlag className="h-5 w-5" />
      ) : (
        <EnFlag className="h-5 w-5" />
      )}
    </span>
  );

  const Step1 = () => (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit">
      <form
        onSubmit={handleSubmit(onStep1)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        noValidate
        className="px-4 pb-6"
      >
        <LabelRow
          label={t.step1.username}
          required
          rightIcon={<span>?</span>}
        />
        <InputShell hasError={!!errors.username}>
          <input
            className="w-full h-11 px-3 rounded-lg outline-none"
            style={{
              fontSize: view.inputTextSize,
              color: view.inputText,
              background: "transparent",
            }}
            placeholder={t.step1.fillHere}
            {...register("username", { required: t.step1.required })}
          />
        </InputShell>
        <ErrorText msg={errors.username?.message} />

        <div className="mt-4">
          <LabelRow
            label={t.step1.password}
            required
            rightIcon={<span>?</span>}
          />
          <InputShell hasError={!!errors.password}>
            <div className="flex items-center">
              <input
                type={showPass ? "text" : "password"}
                className="w-full h-11 px-3 rounded-lg outline-none"
                style={{
                  fontSize: view.inputTextSize,
                  color: view.inputText,
                  background: "transparent",
                }}
                placeholder={t.step1.fillPass}
                {...register("password", {
                  required: t.step1.required,
                  minLength: { value: 6, message: t.step1.passMin },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="px-3"
                style={{ color: view.inputIconColor }}
                aria-label="toggle password"
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </InputShell>
          <ErrorText msg={errors.password?.message} />
        </div>

        <div className="mt-4">
          <LabelRow label={t.step1.cpass} required />
          <InputShell hasError={!!errors.confirmPassword}>
            <div className="flex items-center">
              <input
                type={showCpass ? "text" : "password"}
                className="w-full h-11 px-3 rounded-lg outline-none"
                style={{
                  fontSize: view.inputTextSize,
                  color: view.inputText,
                  background: "transparent",
                }}
                placeholder={t.step1.confirmPass}
                {...register("confirmPassword", { required: t.step1.required })}
              />
              <button
                type="button"
                onClick={() => setShowCpass((s) => !s)}
                className="px-3"
                style={{ color: view.inputIconColor }}
                aria-label="toggle confirm password"
              >
                {showCpass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </InputShell>
          <ErrorText msg={errors.confirmPassword?.message} />
        </div>

        <div className="mt-4">
          <LabelRow label={t.step1.currency} required />
          <div className="flex items-center gap-3">
            <CurrencyIcon />
            <div className="flex-1">
              <select
                className="w-full h-11 rounded-lg border px-3 pr-10 outline-none"
                style={{
                  background: view.selectBg,
                  borderColor: view.selectBorder,
                  fontSize: view.inputTextSize,
                  color: view.inputText,
                }}
                {...register("currency", { required: true })}
              >
                <option value="BDT">BDT</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>
        </div>

        <PrimaryBtn type="submit">{t.step1.next}</PrimaryBtn>
      </form>
    </motion.div>
  );

  const Step2 = () => (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit">
      <form
        onSubmit={handleSubmit(onStep2)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        noValidate
        className="px-4 pb-6"
      >
        <LabelRow label={t.step2.code} required />
        <div className="flex items-stretch gap-3">
          <InputShell hasError={!!errors.verifyInput}>
            <input
              className="w-full h-11 px-3 rounded-lg outline-none"
              style={{
                fontSize: view.inputTextSize,
                color: view.inputText,
                background: "transparent",
              }}
              placeholder=""
              {...register("verifyInput", { required: t.step1.required })}
            />
          </InputShell>

          <div
            className="w-[130px] h-11 rounded-lg flex items-center justify-between px-3"
            style={{ background: view.vcodeBoxBg, color: view.vcodeBoxText }}
          >
            <span className="font-extrabold tracking-wider">{vCode}</span>
            <button
              type="button"
              onClick={() => {
                setVCode(genCode());
                clearErrors("verifyInput");
              }}
              className="active:scale-95"
              style={{ color: view.vcodeBoxText }}
              aria-label="refresh code"
            >
              <FaSyncAlt />
            </button>
          </div>
        </div>
        <ErrorText msg={errors.verifyInput?.message} />

        <div className="mt-4">
          <LabelRow label={t.step2.phone} required />
          <div className="flex gap-3">
            <div
              className="w-[120px] h-11 rounded-lg border flex items-center px-3"
              style={{
                background: view.prefixBg,
                borderColor: view.prefixBorder,
                color: view.prefixText,
                fontSize: view.inputTextSize,
              }}
            >
              +880
            </div>
            <InputShell hasError={!!errors.phone}>
              <input
                className="w-full h-11 px-3 rounded-lg outline-none"
                style={{
                  fontSize: view.inputTextSize,
                  color: view.inputText,
                  background: "transparent",
                }}
                placeholder={t.step2.fillPhone}
                {...register("phone", {
                  required: t.step1.required,
                  pattern: {
                    value: /^[0-9]{9,11}$/,
                    message: t.step2.validPhone,
                  },
                })}
              />
            </InputShell>
          </div>
          <ErrorText msg={errors.phone?.message} />
        </div>

        <div className="mt-4">
          <LabelRow label={t.step2.referral} required={false} />
          <InputShell hasError={false}>
            <input
              className="w-full h-11 px-3 rounded-lg outline-none"
              style={{
                fontSize: view.inputTextSize,
                color: view.inputText,
                background: "transparent",
              }}
              placeholder={t.step2.optional}
              {...register("referral")}
            />
          </InputShell>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            style={{ accentColor: view.checkboxAccent }}
            {...register("agree")}
          />
          <p className="text-[13px] text-black/80 leading-snug">
            {t.step2.agreeText1}{" "}
            <span className="underline font-semibold">{t.step2.terms}</span>{" "}
            {t.step2.and}{" "}
            <span className="underline font-semibold">
              {t.step2.conditions}
            </span>
            .
          </p>
        </div>
        <ErrorText msg={errors.agree?.message} />

        <PrimaryBtn type="submit">{t.step2.complete}</PrimaryBtn>

        <button
          type="button"
          onClick={() => setStep(0)}
          className="w-full mt-3 text-center text-[13px] font-semibold underline"
          style={{ color: view.backLinkColor }}
        >
          {t.step2.back}
        </button>
      </form>
    </motion.div>
  );

  const Done = () => (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit">
      <div className="px-6 pb-7 text-center">
        <div className="mt-10">
          <p className="font-extrabold text-[16px] text-black">
            {t.done.congrats}
          </p>
          <p className="mt-2 text-[13px] text-black/80 leading-relaxed">
            {t.done.msg1}
            <br />
            {t.done.msg2}
            <br />
            {t.done.msg3}
          </p>

          <p className="mt-6 text-[13px] text-black font-semibold">
            {t.done.bonus}
          </p>
        </div>

        <div className="mt-16">
          <PrimaryBtn onClick={() => navigate("/deposit")}>
            {t.done.deposit}
          </PrimaryBtn>
          <div className="mt-3">
            <YellowBtn onClick={() => navigate("/")}>{t.done.home}</YellowBtn>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const topTitle = useMemo(() => {
    if (step === 2) return t.topWelcome;
    return t.topRegister;
  }, [step, t]);

  if (view.isActive === false) return null;

  return (
    <div className="md:hidden min-h-screen" style={{ background: view.pageBg }}>
      <TopBar title={topTitle} />
      <Banner />
      <Stepper />

      <AnimatePresence mode="wait">
        {step === 0 && <Step1 key="s1" />}
        {step === 1 && <Step2 key="s2" />}
        {step === 2 && <Done key="done" />}
      </AnimatePresence>
    </div>
  );
};

export default MobileRegister;
