// src/pages/Profile/Deposit/AutoDeposit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSelectors";
import { toast } from "react-toastify";
import DepositWithdrawTabs from "../../components/DepositWithdrawTabs/DepositWithdrawTabs";
import Loading from "../../components/Loading/Loading";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const clampNumber = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
};

const DepositDetailsModal = ({ open, onClose, onConfirm, details, t }) => {
  if (!open) return null;

  const Row = ({ k, v }) => (
    <div className="flex items-center justify-between">
      <div className="text-[14px] font-semibold text-black/35">{k}</div>
      <div className="text-[14px] font-extrabold text-black/80">{v}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[92vw] max-w-[420px] bg-white rounded-lg shadow-[0_22px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="text-[18px] font-extrabold text-black">
            {t("ডিপোজিট ডিটেইলস", "Deposit Details")}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-black/5"
            aria-label={t("বন্ধ করুন", "Close")}
          >
            <span className="text-[22px] leading-none text-black/60">×</span>
          </button>
        </div>

        <div className="px-6">
          <div className="h-[1px] bg-black/25" />
        </div>

        <div className="px-6 py-5 max-h-[55vh] overflow-auto">
          <div className="space-y-3">
            <Row
              k={t("ডিপোজিট এমাউন্ট", "Deposit amount")}
              v={money(details.amount)}
            />
            <Row k={t("ফি", "Fees")} v={money(details.fee)} />
            <Row
              k={t("আপনি পেমেন্ট করবেন", "You will pay")}
              v={money(details.total)}
            />
            <Row k={t("ইনভয়েস", "Invoice")} v={details.invoiceNumber} />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full cursor-pointer max-w-[260px] h-[44px] rounded-lg bg-black text-[#f5c400] font-extrabold text-[14px]
                         shadow-[0_10px_22px_rgba(0,0,0,0.25)] hover:brightness-95 active:scale-[0.99] transition"
            >
              {t("কনফার্ম", "Confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AutoDeposit = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const user = useSelector(selectUser);
  const userId = user?._id;

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState(5);
  const [maxAmount, setMaxAmount] = useState(0);

  const quickAmounts = useMemo(
    () => [200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
    [],
  );

  const [amount, setAmount] = useState("1000");
  const [processing, setProcessing] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoadingStatus(true);
        const { data } = await api.get("/api/auto-deposit/status");
        setEnabled(!!data?.data?.enabled);
        setMinAmount(Number(data?.data?.minAmount || 5));
        setMaxAmount(Number(data?.data?.maxAmount || 0));
      } catch {
        setEnabled(false);
        setMinAmount(5);
        setMaxAmount(0);
      } finally {
        setLoadingStatus(false);
      }
    };
    loadStatus();
  }, []);

  const amountNum = clampNumber(amount);
  const amountHasValue = amountNum > 0;

  const inMin = amountNum >= (minAmount > 0 ? minAmount : 0);
  const inMax = maxAmount > 0 ? amountNum <= maxAmount : true;

  const amountValid = amountHasValue && inMin && inMax;

  const amountHint = useMemo(() => {
    const minTxt = minAmount > 0 ? money(minAmount) : null;
    const maxTxt = maxAmount > 0 ? money(maxAmount) : null;

    if (minTxt && maxTxt)
      return `${t("সর্বনিম্ন", "Minimum")} ${minTxt} — ${t("সর্বোচ্চ", "Maximum")} ${maxTxt}`;
    if (minTxt)
      return `${t("সর্বনিম্ন ডিপোজিট", "Minimum deposit")}: ${minTxt}`;
    if (maxTxt) return `${t("সর্বোচ্চ ডিপোজিট", "Maximum deposit")}: ${maxTxt}`;
    return "";
  }, [minAmount, maxAmount, isBangla]);

  const amountErrorText = useMemo(() => {
    if (!amountHasValue) return "";
    if (!inMin)
      return t(
        `ন্যূনতম ডিপোজিট ${money(minAmount)} হতে হবে`,
        `Minimum deposit must be ${money(minAmount)}`,
      );
    if (!inMax)
      return t(
        `সর্বোচ্চ ডিপোজিট ${money(maxAmount)} পর্যন্ত`,
        `Maximum deposit is ${money(maxAmount)}`,
      );
    return "";
  }, [amountHasValue, inMin, inMax, minAmount, maxAmount, isBangla]);

  const onPickAmount = (v) => setAmount(String(v));

  const fee = 0;
  const total = amountNum + fee;

  const canDeposit = enabled && !!userId && amountValid && !processing;

  const openConfirm = () => {
    if (!enabled) {
      toast.error(t("এখন Auto Deposit উপলব্ধ নেই", "Auto Deposit is disabled"));
      return;
    }
    if (!userId) {
      toast.error(
        t("অনুগ্রহ করে আবার লগইন করুন", "User not found. Please login again."),
      );
      return;
    }
    if (!amountValid) return;

    const invoice = `DEP-${userId}-${Date.now()}`;
    setPendingInvoice(invoice);
    setDetailsOpen(true);
  };

  const confirmAndPay = async () => {
    try {
      setProcessing(true);

      const invoiceNumber = pendingInvoice || `DEP-${userId}-${Date.now()}`;

      const { data } = await api.post("/api/auto-deposit/create", {
        amount: amountNum,
        userIdentity: userId,
        invoiceNumber,
        checkoutItems: {
          type: "deposit",
          method: "auto",
          gateway: "oraclepay",
          username: user?.username || "",
        },
      });

      if (data?.success && data?.payment_page_url) {
        window.location.href = data.payment_page_url;
        return;
      }

      toast.error(
        data?.message ||
          t("পেমেন্ট লিংক তৈরি করা যায়নি", "Payment link create failed"),
      );
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          t("পেমেন্ট লিংক তৈরি করা যায়নি", "Payment link create failed"),
      );
    } finally {
      setProcessing(false);
      setDetailsOpen(false);
    }
  };

  // ✅ UPDATED: use your Loading component here
  if (loadingStatus) {
    return <Loading open text={t("লোড হচ্ছে...", "Loading...")} />;
  }

  if (!enabled) {
    return (
      <>
        <DepositWithdrawTabs />
        <div className="p-3 md:p-6 min-h-screen md:min-h-0">
          <div className="bg-white border rounded-xl p-6 text-center">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900">
              {t("অটো ডিপোজিট", "Auto Deposit")}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t(
                "এই মুহূর্তে অটো ডিপোজিট বন্ধ আছে। পরে আবার চেষ্টা করুন।",
                "Auto Deposit is currently disabled. Please try later.",
              )}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DepositWithdrawTabs />

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* LEFT */}
          <div className="bg-white rounded-xl border border-black/10 p-5 sm:p-6 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[18px] font-extrabold text-black">
                {t("অটো ডিপোজিট", "Auto Deposit")}
              </div>

              <div className="text-right">
                <div className="text-[11px] text-black/45 font-semibold">
                  {t("ইউজার", "User")}
                </div>
                <div className="text-[13px] font-extrabold text-black/80">
                  {user?.username || t("ইউজার", "User")}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[14px] font-semibold text-black">
                  {t("ডিপোজিট এমাউন্ট", "Deposit Amount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[12px] font-bold text-black/50">
                  {amountHint || ""}
                </span>
              </div>

              <div className="mt-3">
                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={`w-full max-w-[520px] bg-white border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-black/10 ${
                    amountHasValue && !amountValid
                      ? "border-red-400"
                      : "border-black/20"
                  }`}
                  placeholder="1000"
                  inputMode="numeric"
                />
              </div>

              {amountErrorText ? (
                <div className="mt-2 text-[12px] font-semibold text-red-500">
                  {amountErrorText}
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-[720px]">
                {quickAmounts.map((v) => {
                  const activeBtn = String(v) === String(amount);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onPickAmount(v)}
                      className={`
                        relative h-[44px] cursor-pointer rounded-lg font-extrabold text-[15px] transition
                        ${
                          activeBtn
                            ? "bg-[#f5c400] text-black"
                            : "bg-[#f2f3f5] text-black/50 hover:text-black/70 hover:bg-[#e9eaee]"
                        }
                      `}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deposit Button */}
            <div className="mt-6 max-w-[520px]">
              <button
                type="button"
                onClick={openConfirm}
                disabled={!canDeposit}
                className={`
                  w-full h-[46px] rounded-full
                  font-extrabold text-[14px]
                  shadow-[0_10px_22px_rgba(0,136,255,0.25)]
                  transition
                  ${
                    canDeposit
                      ? "bg-[#0088ff] text-white hover:brightness-95 active:scale-[0.99] cursor-pointer"
                      : "bg-[#bcdcff] text-white/90 cursor-not-allowed"
                  }
                `}
              >
                {processing
                  ? t("প্রসেস হচ্ছে...", "Processing...")
                  : t("ডিপোজিট", "Deposit")}
              </button>

              <div className="mt-2 text-[12px] text-black/55">
                {t(
                  "কনফার্ম করলে OraclePay পেমেন্ট পেইজে নিয়ে যাবে।",
                  "After confirm, you’ll be redirected to OraclePay payment page.",
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="text-[14px] font-extrabold text-black">
              {t("গুরুত্বপূর্ণ নোটিশ", "Important Notice")}
            </div>
            <div className="mt-3 text-[12px] leading-relaxed text-black/70 space-y-2">
              <div>
                •{" "}
                {t(
                  "অটো ডিপোজিট শুধু Active থাকলেই কাজ করবে।",
                  "Auto Deposit works only when enabled.",
                )}
              </div>
              <div>
                •{" "}
                {t(
                  "Min/Max লিমিট মেনে এমাউন্ট দিন।",
                  "Please follow min/max deposit limits.",
                )}
              </div>
              <div>
                •{" "}
                {t(
                  "পেমেন্ট সম্পন্ন হলে ব্যালেন্স অটো যোগ হবে।",
                  "After completion, balance will be added automatically.",
                )}
              </div>
              <div>
                •{" "}
                {t(
                  "সমস্যা হলে লাইভ সাপোর্টে যোগাযোগ করুন।",
                  "If you face issues, contact live support.",
                )}
              </div>
            </div>
          </div>
        </div>

        <DepositDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onConfirm={confirmAndPay}
          details={{
            amount: amountNum,
            fee,
            total,
            invoiceNumber: pendingInvoice,
          }}
          t={t}
        />
      </div>

      {/* ✅ Optional: show loader during processing as overlay */}
      <Loading open={processing} text={t("প্রসেস হচ্ছে...", "Processing...")} />
    </>
  );
};

export default AutoDeposit;
