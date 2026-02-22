// src/pages/Profile/Withdraw/Withdraw.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { toast } from "react-toastify";

// ✅ Redux selectors
import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectIsActiveUser,
} from "../../features/auth/authSelectors";
import DepositWithdrawTabs from "../../components/DepositWithdrawTabs/DepositWithdrawTabs";
import { useNavigate } from "react-router";

const Withdraw = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);
  const navigate = useNavigate();

  // ✅ auth
  const user = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);
  const isActiveUser = useSelector(selectIsActiveUser);

  // ✅ derive phoneVerified from user (fallback safe)
  const phoneVerified =
    user?.phoneVerified === true ||
    user?.isPhoneVerified === true ||
    user?.verified?.phone === true ||
    false;

  // notices (same)
  const notices = useMemo(
    () => [
      {
        title: t(
          "Use Official Deposit & Withdrawal Channels Only:",
          "Use Official Deposit & Withdrawal Channels Only:",
        ),
        body: t(
          "দয়া করে শুধু অফিসিয়াল ডিপোজিট/উইথড্র চ্যানেল ব্যবহার করুন। কোনো থার্ড-পার্টি/অনঅফিসিয়াল মাধ্যম ব্যবহার করবেন না।",
          "Kindly, withdraw funds through the designated official channels available on our website. Avoid any unofficial or third-party platforms.",
        ),
      },
      {
        title: t(
          "Live Chat Support for Pending Transactions:",
          "Live Chat Support for Pending Transactions:",
        ),
        body: t(
          "আপনার উইথড্র ১৫ মিনিটের বেশি পেন্ডিং থাকলে ২৪/৭ লাইভ চ্যাটে যোগাযোগ করুন।",
          "If your withdrawal remains pending for more than 15 minutes, please contact our 24/7 live chat support for real-time updates.",
        ),
      },
      {
        title: t(
          "Caution Regarding Cash-Outs:",
          "Caution Regarding Cash-Outs:",
        ),
        body: t(
          "উইথড্র করার সময় সঠিক ওয়ালেট/নাম্বার ব্যবহার করুন। ভুল নাম্বারে গেলে সমস্যা হতে পারে।",
          "During withdrawal, use the correct wallet/number. Wrong numbers may cause delays or issues.",
        ),
      },
      {
        title: t("Use Verified Phone Number:", "Use Verified Phone Number:"),
        body: t(
          "শুধু আপনার ভেরিফাইড ফোন নাম্বার ব্যবহার করুন। ভেরিফিকেশন ছাড়া উইথড্র করা যাবে না।",
          "Use only your verified phone number. Withdrawal is not allowed without verification.",
        ),
      },
    ],
    [isBangla],
  );

  // ───────────────────────────────
  // API: load withdraw methods
  // ───────────────────────────────
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methods, setMethods] = useState([]);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.get("/api/withdraw-methods");
      const rows = res?.data?.data || res?.data || [];
      setMethods(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setMethods([]);
      console.error("Failed to load withdraw methods", e);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  // ───────────────────────────────
  // ✅ Eligibility: turnover পূরণ হয়েছে কিনা
  // ───────────────────────────────
  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: true,
    hasRunningTurnover: false,
    remaining: 0,
    message: "",
  });

  const loadEligibility = async () => {
    // ✅ not logged in -> don't call
    if (!isAuthed) {
      setElig({
        eligible: false,
        hasRunningTurnover: false,
        remaining: 0,
        message: t("উইথড্র করার জন্য লগইন করুন।", "Please login to withdraw."),
      });
      return;
    }

    try {
      setEligLoading(true);
      const { data } = await api.get("/api/withdraw-requests/eligibility");
      const payload = data?.data || data || {};
      setElig({
        eligible: !!payload.eligible,
        hasRunningTurnover: !!payload.hasRunningTurnover,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
      });
    } catch (e) {
      // eligibility call fail হলেও hard-block না
      setElig((p) => ({ ...p, eligible: true }));
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  // selected method
  const [selectedId, setSelectedId] = useState("");
  const selectedMethod = useMemo(() => {
    if (!methods.length) return null;
    return (
      methods.find((m) => String(m.methodId) === String(selectedId)) || null
    );
  }, [methods, selectedId]);

  // ensure default selected
  useEffect(() => {
    if (!selectedId && methods.length) {
      setSelectedId(methods[0]?.methodId || "");
    }
  }, [methods, selectedId]);

  // dynamic form values for selected method fields
  const [formValues, setFormValues] = useState({});

  // reset formValues when method changes
  useEffect(() => {
    if (!selectedMethod) return;
    const next = {};
    (selectedMethod.fields || []).forEach((f) => {
      next[f.key] = "";
    });
    setFormValues(next);
  }, [selectedMethod?._id]);

  const setVal = (key, value) => {
    setFormValues((p) => ({ ...p, [key]: value }));
  };

  // amount states
  const [amount, setAmount] = useState("");

  // ✅ NEW: dynamic min/max from selected method (fallback to previous 500/30000)
  const min = useMemo(() => {
    const v = Number(selectedMethod?.minimumWithdrawAmount ?? 500);
    return Number.isFinite(v) && v >= 0 ? v : 500;
  }, [selectedMethod]);

  const max = useMemo(() => {
    const v = Number(selectedMethod?.maximumWithdrawAmount ?? 30000);
    return Number.isFinite(v) && v >= 0 ? v : 30000;
  }, [selectedMethod]);

  const amountNum = Number(amount || 0);

  // ✅ NEW: if max=0 => no upper limit (same pattern you used in deposit note)
  const hasMax = Number(max) > 0;

  const validAmount = useMemo(() => {
    if (!Number.isFinite(amountNum)) return false;
    if (amountNum < Number(min)) return false;
    if (hasMax && amountNum > Number(max)) return false;
    return true;
  }, [amountNum, min, max, hasMax]);

  // ✅ NEW: amount range message
  const amountErrorText = useMemo(() => {
    if (!amount) return "";
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return t("সঠিক পরিমাণ লিখুন।", "Enter a valid amount.");
    }
    if (amountNum < Number(min)) {
      return t(
        `সর্বনিম্ন উইথড্র পরিমাণ ৳ ${Number(min).toLocaleString()}।`,
        `Minimum withdraw amount is ৳ ${Number(min).toLocaleString()}.`,
      );
    }
    if (hasMax && amountNum > Number(max)) {
      return t(
        `সর্বোচ্চ উইথড্র পরিমাণ ৳ ${Number(max).toLocaleString()}।`,
        `Maximum withdraw amount is ৳ ${Number(max).toLocaleString()}.`,
      );
    }
    return "";
  }, [amount, amountNum, min, max, hasMax, isBangla]);

  // basic validation for dynamic fields
  const fieldErrors = useMemo(() => {
    const errs = {};
    const fields = selectedMethod?.fields || [];

    fields.forEach((f) => {
      const v = String(formValues?.[f.key] ?? "").trim();

      if (f.required !== false && !v) {
        errs[f.key] = t("এই ঘরটি আবশ্যক", "This field is required");
        return;
      }

      if (v) {
        if (f.type === "email") {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          if (!ok) errs[f.key] = t("সঠিক ইমেইল দিন", "Enter a valid email");
        }
        if (f.type === "tel") {
          const bdOk = /^01[3-9]\d{8}$/.test(v);
          if (v.startsWith("01") && v.length >= 11 && !bdOk) {
            errs[f.key] = t(
              "সঠিক বাংলাদেশি ফোন নাম্বার দিন (01XXXXXXXXX)",
              "Enter a valid Bangladeshi phone number (01XXXXXXXXX)",
            );
          }
        }
        if (f.type === "number") {
          const n = Number(v);
          if (!Number.isFinite(n))
            errs[f.key] = t("শুধু সংখ্যা দিন", "Numbers only");
        }
      }
    });

    return errs;
  }, [selectedMethod, formValues, isBangla]);

  const allRequiredOk = useMemo(() => {
    const fields = selectedMethod?.fields || [];
    for (const f of fields) {
      if (f.required !== false) {
        const v = String(formValues?.[f.key] ?? "").trim();
        if (!v) return false;
      }
    }
    return true;
  }, [selectedMethod, formValues]);

  const noTypeErrors = Object.keys(fieldErrors).length === 0;

  // ✅ overall gate
  const accountOk = isAuthed && isActiveUser;

  const canSubmit =
    accountOk &&
    !!selectedMethod &&
    validAmount &&
    allRequiredOk &&
    noTypeErrors &&
    elig.eligible;

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;

    const payload = {
      methodId: selectedMethod?.methodId,
      amount: amountNum,
      fields: { ...formValues },
    };

    try {
      setSubmitting(true);

      const { data } = await api.post("/api/withdraw-requests", payload);

      toast.success(
        isBangla
          ? "উইথড্র রিকোয়েস্ট সাবমিট হয়েছে!"
          : "Withdraw request submitted!",
      );
      navigate("/profile/history");

      // reset inputs
      setAmount("");
      const next = {};
      (selectedMethod?.fields || []).forEach((f) => (next[f.key] = ""));
      setFormValues(next);

      // refresh eligibility
      loadEligibility();

      console.log("withdraw created:", data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          t("উইথড্র রিকোয়েস্ট ব্যর্থ হয়েছে", "Withdraw request failed"),
      );
      loadEligibility();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DepositWithdrawTabs />
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* LEFT */}
          <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] p-4 sm:p-6">
            {/* Title */}
            <div className="text-[20px] font-extrabold text-black">
              {t("উইথড্র", "Withdrawal")}
            </div>

            {/* ✅ Auth / Active warnings */}
            {!isAuthed && (
              <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="text-[14px] font-extrabold text-yellow-800">
                  {t("লগইন প্রয়োজন", "Login Required")}
                </div>
                <div className="mt-1 text-[13px] text-yellow-800/90">
                  {t(
                    "উইথড্র করার জন্য অনুগ্রহ করে লগইন করুন।",
                    "Please login to submit a withdraw request.",
                  )}
                </div>
              </div>
            )}

            {isAuthed && !isActiveUser && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="text-[14px] font-extrabold text-red-700">
                  {t("একাউন্ট নিষ্ক্রিয়", "Account Inactive")}
                </div>
                <div className="mt-1 text-[13px] text-red-700/90">
                  {t(
                    "আপনার একাউন্ট বর্তমানে নিষ্ক্রিয়। সাপোর্টে যোগাযোগ করুন।",
                    "Your account is inactive. Please contact support.",
                  )}
                </div>
              </div>
            )}

            {/* ✅ Turnover warning */}
            {isAuthed && !eligLoading && !elig.eligible && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="text-[14px] font-extrabold text-red-700">
                  {t("উইথড্র করা যাবে না", "Withdrawal Not Allowed")}
                </div>
                <div className="mt-1 text-[13px] text-red-700/90">
                  {elig.message ||
                    t(
                      "আপনার টার্নওভার চলমান আছে। উইথড্র করার আগে টার্নওভার পূরণ করুন।",
                      "You have an active turnover. Complete it before withdrawing.",
                    )}
                </div>
                {elig.remaining > 0 && (
                  <div className="mt-2 text-[13px] font-bold text-red-700">
                    {t("বাকি টার্নওভার:", "Remaining turnover:")} ৳{" "}
                    {elig.remaining.toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {isAuthed && eligLoading && (
              <div className="mt-4 text-[12px] text-black/50">
                {t("টার্নওভার চেক করা হচ্ছে…", "Checking turnover…")}
              </div>
            )}

            {/* Withdrawal Options */}
            <div className="mt-5">
              <label className="text-[14px] font-semibold text-black">
                {t("Withdrawal Options", "Withdrawal Options")}{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="mt-3 flex flex-wrap gap-3">
                {loadingMethods ? (
                  <div className="text-[13px] text-black/60">
                    {t("লোড হচ্ছে...", "Loading...")}
                  </div>
                ) : methods.length ? (
                  methods.map((m) => {
                    const active = String(selectedId) === String(m.methodId);
                    const logo = m.logoUrl
                      ? `${import.meta.env.VITE_API_URL}${m.logoUrl}`
                      : "";

                    return (
                      <button
                        key={m._id || m.methodId}
                        type="button"
                        onClick={() => setSelectedId(m.methodId)}
                        disabled={!accountOk}
                        className={`
                        h-[56px] w-[92px] sm:w-[110px]
                        rounded-md border-2 bg-white
                        flex items-center justify-center
                        transition
                        ${
                          active
                            ? "border-[#f5c400] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
                            : "border-black/20 hover:border-black/35"
                        }
                        ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                        title={m?.name?.en || m?.methodId}
                      >
                        {logo ? (
                          <img
                            src={logo}
                            alt={m?.name?.en || m?.methodId}
                            className="max-h-[32px] max-w-[80px] object-contain"
                          />
                        ) : (
                          <div className="text-[11px] font-extrabold text-black/50">
                            {m?.name?.en || m?.methodId}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-[13px] text-black/60">
                    {t(
                      "কোনো উইথড্র মেথড পাওয়া যায়নি।",
                      "No withdraw methods found.",
                    )}
                  </div>
                )}
              </div>

              {!!selectedMethod && (
                <div className="mt-3 text-[12px] text-black/60">
                  {t("Selected:", "Selected:")}{" "}
                  <span className="font-bold text-black">
                    {isBangla
                      ? selectedMethod?.name?.bn
                      : selectedMethod?.name?.en}
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic Fields */}
            {!!selectedMethod?.fields?.length && (
              <div className="mt-6">
                <div className="text-[14px] font-semibold text-black">
                  {t("Account Information", "Account Information")}{" "}
                  <span className="text-red-500">*</span>
                </div>

                <div className="mt-3 max-w-[520px] space-y-4">
                  {selectedMethod.fields.map((f) => {
                    const label = isBangla ? f?.label?.bn : f?.label?.en;
                    const placeholder = isBangla
                      ? f?.placeholder?.bn
                      : f?.placeholder?.en;

                    const err = fieldErrors?.[f.key];

                    return (
                      <div key={f.key}>
                        <label className="text-[14px] font-semibold text-black">
                          {label || f.key}{" "}
                          {f.required !== false && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>

                        <input
                          disabled={!accountOk}
                          type={f.type === "number" ? "text" : f.type}
                          value={formValues?.[f.key] ?? ""}
                          onChange={(e) => setVal(f.key, e.target.value)}
                          placeholder={placeholder || ""}
                          className={`
                          mt-3 w-full h-[44px]
                          rounded-lg border border-black/20 bg-white
                          px-4 text-[14px] outline-none
                          focus:ring-2 focus:ring-black/10
                          ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}
                        `}
                          inputMode={
                            f.type === "number" ? "numeric" : undefined
                          }
                        />

                        {!!err && (
                          <div className="mt-2 text-[12px] text-red-600">
                            {err}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!phoneVerified && (
                  <div className="mt-3 max-w-[520px] text-[12px] text-black/55">
                    {t(
                      "দয়া করে আপনার ভেরিফাইড তথ্য/নাম্বার ব্যবহার করুন।",
                      "Please use your verified info/number.",
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Withdrawable Amount */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 max-w-[520px]">
                <label className="text-[14px] font-semibold text-black">
                  {t("Withdrawable Amount", "Withdrawable Amount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <FaQuestionCircle className="text-black/70" />
              </div>

              <div className="mt-3 max-w-[520px]">
                <input
                  disabled={!accountOk}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    hasMax
                      ? `${t("Min", "Min")} ৳ ${Number(min).toLocaleString()} - ${t("Max", "Max")} ৳ ${Number(max).toLocaleString()}`
                      : `${t("Min", "Min")} ৳ ${Number(min).toLocaleString()}`
                  }
                  className={`
                  w-full h-[44px]
                  rounded-lg border border-black/20 bg-white
                  px-4 text-[14px] outline-none
                  focus:ring-2 focus:ring-black/10
                  ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}
                `}
                  inputMode="numeric"
                />

                {/* ✅ NEW: dynamic range validation message */}
                {!!amountErrorText && (
                  <div className="mt-2 text-[12px] text-red-600">
                    {amountErrorText}
                  </div>
                )}
              </div>
            </div>

            {/* Withdraw Button */}
            <div className="mt-7 max-w-[520px]">
              <button
                type="button"
                disabled={!canSubmit || submitting}
                className={`
                w-full h-[48px] rounded-full
                font-extrabold text-[14px]
                transition
                ${
                  canSubmit && !submitting
                    ? "bg-black cursor-pointer text-white hover:brightness-95 active:scale-[0.99]"
                    : "bg-[#e5e5e5] text-black/30 cursor-not-allowed"
                }
              `}
                onClick={onSubmit}
              >
                {submitting
                  ? t("Submitting…", "Submitting…")
                  : t("WITHDRAWAL", "WITHDRAWAL")}
              </button>

              <div className="mt-2 text-[12px] text-black/55">
                {t(
                  "দয়া করে ভেরিফাইড নাম্বার ব্যবহার করুন।",
                  "Please use verified number.",
                )}
              </div>

              {!canSubmit && !submitting && (
                <div className="mt-2 text-[12px] text-black/45">
                  {!isAuthed
                    ? t("লগইন করুন।", "Please login.")
                    : !isActiveUser
                      ? t("একাউন্ট নিষ্ক্রিয়।", "Account inactive.")
                      : !elig.eligible
                        ? t("টার্নওভার পূরণ করুন।", "Complete turnover first.")
                        : !selectedMethod
                          ? t("একটি মেথড সিলেক্ট করুন।", "Select a method.")
                          : !allRequiredOk
                            ? t(
                                "সব আবশ্যক ঘর পূরণ করুন।",
                                "Fill all required fields.",
                              )
                            : !noTypeErrors
                              ? t(
                                  "কিছু ইনপুট ভুল আছে।",
                                  "Some inputs are invalid.",
                                )
                              : !validAmount
                                ? t("Amount সঠিক নয়।", "Amount is invalid.")
                                : null}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT – Notices */}
          <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="text-[14px] font-extrabold text-black">
              {t("Important Notice", "Important Notice")}
            </div>
            <div className="mt-3 space-y-4 text-[12px] leading-relaxed text-black/70">
              {notices.map((n, idx) => (
                <div key={idx}>
                  <div className="font-extrabold text-black/90">
                    {idx + 1}. {n.title}
                  </div>
                  <p className="mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Withdraw;
