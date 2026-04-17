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

const computeBonusPreview = ({ amount, selectedBonus }) => {
  const depositAmount = clampNumber(amount);

  if (!selectedBonus) {
    return {
      depositAmount,
      bonusAmount: 0,
      creditedAmount: depositAmount,
      turnoverMultiplier: 1,
      targetTurnover: depositAmount,
      bonusType: "",
    };
  }

  const bonusType =
    String(selectedBonus?.bonusType || "fixed").toLowerCase() === "percent"
      ? "percent"
      : "fixed";

  const bonusValue = Number(selectedBonus?.bonusValue || 0);
  let bonusAmount = 0;

  if (bonusType === "percent") {
    bonusAmount = Math.floor((depositAmount * bonusValue) / 100);
  } else {
    bonusAmount = Math.floor(bonusValue);
  }

  const turnoverMultiplier = Math.max(
    Number(selectedBonus?.turnoverMultiplier || 1),
    0,
  );

  const creditedAmount = depositAmount + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    depositAmount,
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
    bonusType,
  };
};

const DepositDetailsModal = ({
  open,
  onClose,
  onConfirm,
  details,
  t,
  selectedBonus,
}) => {
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

        <div className="px-6 py-5 max-h-[60vh] overflow-auto">
          <div className="space-y-3">
            <Row
              k={t("ডিপোজিট এমাউন্ট", "Deposit amount")}
              v={money(details.amount)}
            />
            <Row k={t("বোনাস", "Bonus")} v={money(details.bonusAmount)} />
            <Row
              k={t("মোট ক্রেডিট", "Total credited")}
              v={money(details.creditedAmount)}
            />
            <Row
              k={t("টার্নওভার মাল্টিপ্লায়ার", "Turnover multiplier")}
              v={`x${details.turnoverMultiplier}`}
            />
            <Row
              k={t("টার্গেট টার্নওভার", "Target turnover")}
              v={money(details.targetTurnover)}
            />
            <Row k={t("ফি", "Fees")} v={money(details.fee)} />
            <Row
              k={t("আপনি পেমেন্ট করবেন", "You will pay")}
              v={money(details.total)}
            />
            <Row k={t("ইনভয়েস", "Invoice")} v={details.invoiceNumber} />
          </div>

          <div className="mt-4 rounded-lg bg-[#f7f7f7] border border-black/10 p-3">
            <div className="text-[12px] font-bold text-black/70">
              {t("সিলেক্টেড বোনাস", "Selected Bonus")}
            </div>
            <div className="mt-1 text-[13px] font-semibold text-black/80">
              {selectedBonus
                ? `${selectedBonus?.title?.bn || "—"} / ${selectedBonus?.title?.en || "—"}`
                : t("কোনো বোনাস সিলেক্ট করা হয়নি", "No bonus selected")}
            </div>
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
  const [bonuses, setBonuses] = useState([]);
  const [selectedBonusId, setSelectedBonusId] = useState("");

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
        setBonuses(Array.isArray(data?.data?.bonuses) ? data.data.bonuses : []);
      } catch {
        setEnabled(false);
        setMinAmount(5);
        setMaxAmount(0);
        setBonuses([]);
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

  const selectedBonus = useMemo(
    () =>
      bonuses.find((b) => String(b?._id) === String(selectedBonusId)) || null,
    [bonuses, selectedBonusId],
  );

  const bonusPreview = useMemo(
    () =>
      computeBonusPreview({
        amount: amountNum,
        selectedBonus,
      }),
    [amountNum, selectedBonus],
  );

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
        selectedBonusId: selectedBonus?._id || "",
        checkoutItems: {
          type: "deposit",
          method: "auto",
          gateway: "oraclepay",
          username: user?.username || "",
          selectedBonusId: selectedBonus?._id || "",
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

            {/* Bonus Select */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[14px] font-semibold text-black">
                  {t("বোনাস সিলেক্ট করুন", "Select Bonus")}
                </label>
                <span className="text-[12px] font-bold text-black/50">
                  {selectedBonus
                    ? t("বোনাস একটিভ", "Bonus selected")
                    : t("না নিলেও চলবে", "Optional")}
                </span>
              </div>

              <div className="mt-3">
                <select
                  value={selectedBonusId}
                  onChange={(e) => setSelectedBonusId(e.target.value)}
                  className="w-full max-w-[520px] bg-white border border-black/20 rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="">
                    {t(
                      "কোনো বোনাস নিবো না (১x টার্নওভার)",
                      "No bonus selected (1x turnover)",
                    )}
                  </option>

                  {bonuses.map((bonus) => {
                    const label = isBangla
                      ? bonus?.title?.bn || bonus?.title?.en || "Bonus"
                      : bonus?.title?.en || bonus?.title?.bn || "Bonus";

                    const suffix =
                      String(bonus?.bonusType) === "percent"
                        ? `${Number(bonus?.bonusValue || 0)}%`
                        : money(Number(bonus?.bonusValue || 0));

                    return (
                      <option key={bonus._id} value={bonus._id}>
                        {label} - {suffix} - x
                        {Number(bonus?.turnoverMultiplier || 1)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBonus ? (
                <div className="mt-3 max-w-[520px] rounded-xl border border-black/10 bg-[#f8f8f8] p-3">
                  <div className="text-[13px] font-extrabold text-black">
                    {isBangla
                      ? selectedBonus?.title?.bn || "বোনাস"
                      : selectedBonus?.title?.en || "Bonus"}
                  </div>
                  <div className="mt-1 text-[12px] text-black/65">
                    {String(selectedBonus?.bonusType) === "percent"
                      ? t(
                          `এই বোনাসে ${Number(selectedBonus?.bonusValue || 0)}% বোনাস পাবেন`,
                          `You will get ${Number(selectedBonus?.bonusValue || 0)}% bonus`,
                        )
                      : t(
                          `এই বোনাসে ${money(Number(selectedBonus?.bonusValue || 0))} ফিক্সড বোনাস পাবেন`,
                          `You will get ${money(Number(selectedBonus?.bonusValue || 0))} fixed bonus`,
                        )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 max-w-[520px] rounded-xl border border-black/10 bg-[#f8f8f8] p-3">
                  <div className="text-[13px] font-semibold text-black/70">
                    {t(
                      "কোনো বোনাস সিলেক্ট করা হয়নি। এই ক্ষেত্রে আপনার টার্নওভার হবে ডিপোজিটের ১ গুণ।",
                      "No bonus selected. In this case, your turnover will be 1x of your deposit.",
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            {/* <div className="mt-6 max-w-[520px] rounded-xl border border-black/10 bg-[#fafafa] p-4">
              <div className="text-[14px] font-extrabold text-black">
                {t("ডিপোজিট সামারি", "Deposit Summary")}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-black/55">
                    {t("ডিপোজিট এমাউন্ট", "Deposit amount")}
                  </div>
                  <div className="text-[13px] font-extrabold text-black">
                    {money(bonusPreview.depositAmount)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-black/55">
                    {t("বোনাস এমাউন্ট", "Bonus amount")}
                  </div>
                  <div className="text-[13px] font-extrabold text-black">
                    {money(bonusPreview.bonusAmount)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-black/55">
                    {t("মোট ক্রেডিট", "Total credited")}
                  </div>
                  <div className="text-[13px] font-extrabold text-black">
                    {money(bonusPreview.creditedAmount)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-black/55">
                    {t("টার্নওভার মাল্টিপ্লায়ার", "Turnover multiplier")}
                  </div>
                  <div className="text-[13px] font-extrabold text-black">
                    x{Number(bonusPreview.turnoverMultiplier || 1)}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/10 pt-3">
                  <div className="text-[13px] font-semibold text-black/55">
                    {t("টার্গেট টার্নওভার", "Target turnover")}
                  </div>
                  <div className="text-[14px] font-extrabold text-[#0088ff]">
                    {money(bonusPreview.targetTurnover)}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white border border-black/10 p-3 text-[12px] text-black/65 leading-relaxed">
                {selectedBonus
                  ? t(
                      `এই বোনাস নিলে আপনার মোট ক্রেডিট হবে ${money(
                        bonusPreview.creditedAmount,
                      )} এবং টার্গেট টার্নওভার হবে ${money(
                        bonusPreview.targetTurnover,
                      )}।`,
                      `With this bonus, your total credited amount will be ${money(
                        bonusPreview.creditedAmount,
                      )} and target turnover will be ${money(
                        bonusPreview.targetTurnover,
                      )}.`,
                    )
                  : t(
                      `কোনো বোনাস না নিলে আপনার ডিপোজিট ${money(
                        bonusPreview.depositAmount,
                      )} এর উপর ১x টার্নওভার হবে, অর্থাৎ ${money(
                        bonusPreview.targetTurnover,
                      )}।`,
                      `If you do not select any bonus, your deposit ${money(
                        bonusPreview.depositAmount,
                      )} will have 1x turnover, which is ${money(
                        bonusPreview.targetTurnover,
                      )}.`,
                    )}
              </div>
            </div> */}

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
                  "বোনাস নিলে credited amount এবং turnover bonus অনুযায়ী হিসাব হবে।",
                  "If you choose a bonus, credited amount and turnover will be calculated based on that bonus.",
                )}
              </div>
              <div>
                •{" "}
                {t(
                  "কোনো বোনাস না নিলে ১x turnover হবে।",
                  "If no bonus is selected, turnover will be 1x.",
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
            bonusAmount: bonusPreview.bonusAmount,
            creditedAmount: bonusPreview.creditedAmount,
            turnoverMultiplier: bonusPreview.turnoverMultiplier,
            targetTurnover: bonusPreview.targetTurnover,
            fee,
            total,
            invoiceNumber: pendingInvoice,
          }}
          selectedBonus={selectedBonus}
          t={t}
        />
      </div>

      <Loading open={processing} text={t("প্রসেস হচ্ছে...", "Processing...")} />
    </>
  );
};

export default AutoDeposit;
