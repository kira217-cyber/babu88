// src/components/RedeemModal/RedeemModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const clampInt = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
};

const RedeemModal = ({
  open,
  onClose,
  referralWallet = 0,
  currencySymbol = "৳",
  onSuccess, // callback to refetch wallet
}) => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const walletNum = useMemo(
    () => Number(referralWallet || 0),
    [referralWallet],
  );
  const amountNum = clampInt(amount);

  const hasMax = Number(maxAmount) > 0;

  const validAmount = useMemo(() => {
    if (!enabled) return false;
    if (amountNum <= 0) return false;
    if (minAmount > 0 && amountNum < minAmount) return false;
    if (hasMax && amountNum > maxAmount) return false;
    if (amountNum > walletNum) return false;
    return true;
  }, [enabled, amountNum, minAmount, hasMax, maxAmount, walletNum]);

  const amountError = useMemo(() => {
    if (!amount) return "";
    if (!enabled) return t("রিডিম বর্তমানে বন্ধ আছে", "Redeem is disabled");
    if (amountNum <= 0) return t("সঠিক এমাউন্ট লিখুন", "Enter a valid amount");
    if (minAmount > 0 && amountNum < minAmount)
      return t(
        `সর্বনিম্ন রিডিম ${currencySymbol} ${minAmount}`,
        `Minimum redeem is ${currencySymbol} ${minAmount}`,
      );
    if (hasMax && amountNum > maxAmount)
      return t(
        `সর্বোচ্চ রিডিম ${currencySymbol} ${maxAmount}`,
        `Maximum redeem is ${currencySymbol} ${maxAmount}`,
      );
    if (amountNum > walletNum)
      return t(
        "রেফারেল ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই",
        "Insufficient referral wallet balance",
      );
    return "";
  }, [
    amount,
    enabled,
    amountNum,
    minAmount,
    hasMax,
    maxAmount,
    walletNum,
    isBangla,
    currencySymbol,
  ]);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const run = async () => {
      try {
        setLoadingStatus(true);
        const { data } = await api.get("/api/redeem/status");
        if (!mounted) return;
        const d = data?.data || {};
        setEnabled(!!d.enabled);
        setMinAmount(Number(d.minAmount || 0));
        setMaxAmount(Number(d.maxAmount || 0));
        // default amount = wallet (but still validate with max)
        setAmount(String(Math.floor(walletNum || 0)));
      } catch (e) {
        setEnabled(false);
        setMinAmount(0);
        setMaxAmount(0);
      } finally {
        setLoadingStatus(false);
      }
    };
    run();

    return () => {
      mounted = false;
    };
  }, [open, walletNum]);

  const onConfirm = async () => {
    if (submitting) return;
    if (!enabled) {
      toast.error(t("রিডিম বর্তমানে বন্ধ আছে", "Redeem is disabled"));
      return;
    }
    if (!validAmount) return;

    try {
      setSubmitting(true);
      const { data } = await api.post("/api/redeem", { amount: amountNum });

      toast.success(
        data?.message ||
          t(
            "রিডিম সফল হয়েছে! ব্যালেন্স আপডেট হয়েছে।",
            "Redeem successful! Balance updated.",
          ),
      );

      onClose?.();
      onSuccess?.();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || t("রিডিম ব্যর্থ হয়েছে", "Redeem failed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => !submitting && onClose?.()}
      />

      {/* Card */}
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-[0_26px_70px_rgba(0,0,0,0.35)] overflow-hidden border border-black/10">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-black">
              {t("রিডিম করুন", "Redeem")}
            </div>
            <div className="mt-1 text-[12px] text-black/60">
              {t(
                "রেফারেল ওয়ালেট থেকে মেইন ব্যালেন্সে ট্রান্সফার হবে এবং ১x টার্নওভার তৈরি হবে।",
                "This will transfer from referral wallet to main balance and create 1x turnover.",
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => !submitting && onClose?.()}
            className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 text-black/60 hover:text-black transition flex items-center justify-center"
            aria-label="Close"
          >
            <span className="text-[22px] leading-none">×</span>
          </button>
        </div>

        <div className="px-6">
          <div className="h-[1px] bg-black/10" />
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Wallet Summary */}
          <div className="rounded-2xl border border-black/10 bg-[#fff7d6] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-bold text-black/70">
                  {t("রেফারেল ওয়ালেট ব্যালেন্স", "Referral Wallet Balance")}
                </div>
                <div className="mt-1 text-[18px] font-extrabold text-black tabular-nums">
                  {currencySymbol} {walletNum.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold text-black/50">
                  {t("স্ট্যাটাস", "Status")}
                </div>
                <div
                  className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                    loadingStatus
                      ? "bg-white/60 text-black/60 border-black/10"
                      : enabled
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                        : "bg-red-500/15 text-red-700 border-red-500/25"
                  }`}
                >
                  {loadingStatus
                    ? t("লোড হচ্ছে...", "Loading...")
                    : enabled
                      ? t("চালু", "Enabled")
                      : t("বন্ধ", "Disabled")}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[12px] text-black/65">
              {minAmount > 0 ? (
                <div>
                  <span className="font-bold text-black/70">
                    {t("সর্বনিম্ন:", "Min:")}
                  </span>{" "}
                  {currencySymbol} {minAmount}
                </div>
              ) : null}

              <div className="mt-1">
                <span className="font-bold text-black/70">
                  {t("সর্বোচ্চ:", "Max:")}
                </span>{" "}
                {hasMax ? (
                  <>
                    {currencySymbol} {maxAmount}
                  </>
                ) : (
                  <span>{t("সীমা নেই", "No limit")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-extrabold text-black">
                {t("রিডিম এমাউন্ট", "Redeem Amount")}{" "}
                <span className="text-red-500">*</span>
              </div>

              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(walletNum || 0)))}
                disabled={!enabled || submitting}
                className="text-[12px] font-extrabold text-[#b88900] hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
                title="Use full wallet"
              >
                {t("ফুল ওয়ালেট", "Full Wallet")}
              </button>
            </div>

            <div className="mt-2 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/45 font-extrabold">
                {currencySymbol}
              </div>
              <input
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder={t("এমাউন্ট লিখুন", "Enter amount")}
                className={`w-full h-[46px] pl-10 pr-4 rounded-xl bg-white border text-black placeholder-black/35 outline-none focus:ring-2 ${
                  amountError
                    ? "border-red-400 focus:ring-red-200"
                    : "border-black/15 focus:ring-yellow-200"
                }`}
                inputMode="numeric"
                disabled={!enabled || submitting}
              />
            </div>

            {!!amountError && (
              <div className="mt-2 text-[12px] font-bold text-red-600">
                {amountError}
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAmount(String(minAmount || 0))}
                disabled={!enabled || submitting || !(minAmount > 0)}
                className="h-10 rounded-xl border border-black/10 bg-black/5 text-black font-extrabold text-[13px] hover:bg-black/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("মিনিমাম", "Minimum")}
              </button>

              <button
                type="button"
                onClick={() =>
                  setAmount(
                    String(hasMax ? maxAmount : Math.floor(walletNum || 0)),
                  )
                }
                disabled={!enabled || submitting}
                className="h-10 rounded-xl border border-black/10 bg-black/5 text-black font-extrabold text-[13px] hover:bg-black/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("ম্যাক্স", "Max")}
              </button>

              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(walletNum || 0)))}
                disabled={!enabled || submitting}
                className="h-10 rounded-xl border border-black/10 bg-black/5 text-black font-extrabold text-[13px] hover:bg-black/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("ফুল ওয়ালেট", "Full Wallet")}
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 rounded-xl bg-black/5 border border-black/10 p-3 text-[12px] text-black/70">
            <span className="font-extrabold text-black">
              {t("নোট:", "Note:")}
            </span>{" "}
            {t(
              "রিডিম করার পর আপনার মেইন ব্যালেন্সে টাকা যোগ হবে এবং ১x টার্নওভার চলবে।",
              "After redeem, your main balance will increase and 1x turnover will start.",
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => !submitting && onClose?.()}
              className="px-4 py-2 rounded-xl border border-black/15 text-black font-extrabold hover:bg-black/5 transition disabled:opacity-60"
              disabled={submitting}
            >
              {t("বাতিল", "Cancel")}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={!validAmount || submitting}
              className={`px-4 py-2 rounded-xl font-extrabold transition ${
                validAmount && !submitting
                  ? "bg-[#f5c400] hover:bg-[#e7b900] text-black shadow-[0_10px_24px_rgba(245,196,0,0.35)]"
                  : "bg-black/10 text-black/40 cursor-not-allowed"
              }`}
            >
              {submitting
                ? t("প্রসেস হচ্ছে...", "Processing...")
                : t("কনফার্ম রিডিম", "Confirm Redeem")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;
