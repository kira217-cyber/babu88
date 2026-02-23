// src/pages/Profile/Deposit/Deposit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { FaExclamationCircle, FaQuestionCircle, FaTimes } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import DepositModal from "./DepositModal";
import DepositWithdrawTabs from "../../components/DepositWithdrawTabs/DepositWithdrawTabs";

// ✅ fallback logo placeholders (when no image)
const OptionLogo = ({ type }) => {
  const base = "w-10 h-10 rounded-full flex items-center justify-center";
  if (type === "nagad")
    return (
      <div className={`${base} bg-[#ffe9e9]`}>
        <span className="font-extrabold text-[#e11d48] text-[13px]">N</span>
      </div>
    );
  if (type === "bkash")
    return (
      <div className={`${base} bg-[#ffe8f3]`}>
        <span className="font-extrabold text-[#db2777] text-[13px]">bK</span>
      </div>
    );
  if (type === "rocket")
    return (
      <div className={`${base} bg-[#f3e8ff]`}>
        <span className="font-extrabold text-[#7c3aed] text-[13px]">R</span>
      </div>
    );
  if (type === "upay")
    return (
      <div className={`${base} bg-[#e6f2ff]`}>
        <span className="font-extrabold text-[#2563eb] text-[13px]">U</span>
      </div>
    );
  return (
    <div className={`${base} bg-[#ffe8f3]`}>
      <span className="font-extrabold text-[#db2777] text-[12px]">Pay</span>
    </div>
  );
};

const Tag = ({ text = "+0%" }) => (
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5c400] text-black text-[11px] font-extrabold px-2 py-[2px] rounded-md shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
    {text}
  </span>
);

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const parsePercentFromTag = (tagText) => {
  if (typeof tagText !== "string") return 0;
  if (!tagText.includes("%")) return 0;
  const p = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(p) ? p : 0;
};

// ✅ promo comes from selectedMethod.promotions (UI calc only; server will verify again)
const calcBonus = (
  amountNum,
  promoId,
  channelTagText,
  methodPromotions = [],
) => {
  const percent = parsePercentFromTag(channelTagText);
  const percentBonus = (amountNum * percent) / 100;

  const promoDoc = (methodPromotions || []).find(
    (p) =>
      String(p?.id || "").toLowerCase() === String(promoId || "").toLowerCase(),
  );

  let promoBonus = 0;
  if (promoDoc && promoId !== "none" && promoDoc?.isActive !== false) {
    const bonusValue = Number(promoDoc?.bonusValue ?? 0) || 0;
    if (promoDoc?.bonusType === "percent")
      promoBonus = (amountNum * bonusValue) / 100;
    else promoBonus = bonusValue;
  }

  return {
    promoBonus,
    percentBonus,
    percent,
    totalBonus: promoBonus + percentBonus,
  };
};

// ✅ Modal (deposit details)
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
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[92vw] max-w-[420px] bg-white rounded-lg shadow-[0_22px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="text-[18px] font-extrabold text-black">
            {t("Deposit Details", "Deposit Details")}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-black/5"
            aria-label="Close"
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
              k={t("Deposit amount", "Deposit amount")}
              v={money(details.depositAmount)}
            />
            <Row
              k={t("Promo Bonus", "Promo Bonus")}
              v={money(details.promoBonus)}
            />
            <Row
              k={`+${details.percent}% ${t("Channel Bonus", "Channel Bonus")}`}
              v={money(details.percentBonus)}
            />
            <Row
              k={t("Target Turnover", "Target Turnover")}
              v={money(details.targetTurnover)}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full cursor-pointer max-w-[260px] h-[44px] rounded-lg bg-black text-[#f5c400] font-extrabold text-[14px]
                         shadow-[0_10px_22px_rgba(0,0,0,0.25)] hover:brightness-95 active:scale-[0.99] transition"
            >
              {t("Confirm", "Confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Deposit = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["deposit-methods-public"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      return (res.data || []).filter((m) => m?.isActive !== false);
    },
    staleTime: 30_000,
    retry: 1,
  });

  const quickAmounts = useMemo(
    () => [
      { v: 200, tag: "" },
      { v: 1000, tag: "+3%" },
      { v: 5000, tag: "+3%" },
      { v: 10000, tag: "+3%" },
      { v: 20000, tag: "+3%" },
      { v: 30000, tag: "+3%" },
    ],
    [],
  );

  // selections
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [amount, setAmount] = useState("1000");

  const [promo, setPromo] = useState("none");
  const [promoOpen, setPromoOpen] = useState(false);

  // Modals state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  // defaults
  useEffect(() => {
    if (methods?.length && !selectedOption) {
      const first = methods[0];
      setSelectedOption(first?.methodId || "");
      const firstChannel =
        (first?.channels || []).filter((c) => c?.isActive !== false)?.[0]?.id ||
        "";
      setSelectedChannel(firstChannel);
    }
  }, [methods, selectedOption]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m.methodId === selectedOption) || null,
    [methods, selectedOption],
  );

  const channels = useMemo(() => {
    const ch = selectedMethod?.channels || [];
    return ch.filter((c) => c?.isActive !== false);
  }, [selectedMethod]);

  const selectedChannelDoc = useMemo(
    () => channels.find((c) => c.id === selectedChannel) || null,
    [channels, selectedChannel],
  );

  const promotions = useMemo(() => {
    const list = Array.isArray(selectedMethod?.promotions)
      ? selectedMethod.promotions
      : [];
    const active = list
      .filter((p) => p?.isActive !== false)
      .sort((a, b) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0));

    return [
      { id: "none", name: t("No Bonus Selected", "No Bonus Selected") },
      ...active.map((p) => ({
        id: p.id,
        name: isBangla ? p?.name?.bn || p.id : p?.name?.en || p.id,
        bonusType: p?.bonusType,
        bonusValue: p?.bonusValue,
      })),
    ];
  }, [selectedMethod, isBangla]);

  // keep selectedChannel valid
  useEffect(() => {
    if (!selectedMethod) return;
    const exists = channels.some((c) => c.id === selectedChannel);
    if (!exists) setSelectedChannel(channels?.[0]?.id || "");
  }, [selectedMethod, channels, selectedChannel]);

  // keep promo valid
  useEffect(() => {
    const exists = promotions.some((p) => p.id === promo);
    if (!exists) setPromo("none");
  }, [promotions, promo]);

  const onPickAmount = (v) => setAmount(String(v));

  const channelTagText = selectedChannelDoc?.tagText || "+0%";
  const amountNum = Number(amount || 0) || 0;

  // ✅ NEW: min/max from method
  const minDeposit = Number(selectedMethod?.minDepositAmount ?? 0) || 0;
  const maxDeposit = Number(selectedMethod?.maxDepositAmount ?? 0) || 0;

  const inMin = amountNum >= (minDeposit > 0 ? minDeposit : 0);
  const inMax = maxDeposit > 0 ? amountNum <= maxDeposit : true;

  const amountHasValue = amountNum > 0;
  const amountValid = amountHasValue && inMin && inMax;

  const amountHint = useMemo(() => {
    if (!selectedMethod) return "";
    const minTxt = minDeposit > 0 ? money(minDeposit) : null;
    const maxTxt = maxDeposit > 0 ? money(maxDeposit) : null;

    if (minTxt && maxTxt)
      return `${t("Minimum", "Minimum")} ${minTxt} — ${t("Maximum", "Maximum")} ${maxTxt}`;
    if (minTxt) return `${t("Minimum deposit", "Minimum deposit")}: ${minTxt}`;
    if (maxTxt) return `${t("Maximum deposit", "Maximum deposit")}: ${maxTxt}`;
    return ""; // no limits
  }, [selectedMethod, minDeposit, maxDeposit, isBangla]);

  const amountErrorText = useMemo(() => {
    if (!selectedMethod) return "";
    if (!amountHasValue) return "";
    if (!inMin)
      return t(
        `ন্যূনতম ডিপোজিট ${money(minDeposit)} হতে হবে`,
        `Minimum deposit must be ${money(minDeposit)}`,
      );
    if (!inMax)
      return t(
        `সর্বোচ্চ ডিপোজিট ${money(maxDeposit)} পর্যন্ত`,
        `Maximum deposit is ${money(maxDeposit)}`,
      );
    return "";
  }, [
    selectedMethod,
    amountHasValue,
    inMin,
    inMax,
    minDeposit,
    maxDeposit,
    isBangla,
  ]);

  const methodPromotionsRaw = Array.isArray(selectedMethod?.promotions)
    ? selectedMethod.promotions
    : [];
  const { promoBonus, percentBonus, percent } = calcBonus(
    amountNum,
    promo,
    channelTagText,
    methodPromotionsRaw,
  );

  const turnoverMultiplier = Number(selectedMethod?.turnoverMultiplier ?? 13);
  const targetTurnover =
    (amountNum + promoBonus + percentBonus) * turnoverMultiplier;

  const modalDetails = {
    depositAmount: amountNum,
    promoBonus,
    percentBonus,
    percent,
    targetTurnover,
  };

  const baseBonusTitle = isBangla
    ? selectedMethod?.baseBonusTitle?.bn
    : selectedMethod?.baseBonusTitle?.en;

  const apiBase = import.meta.env.VITE_API_URL || "";

  // ✅ NEW: deposit button enable condition
  const canDeposit = !!selectedMethod && !!selectedChannel && amountValid;

  return (
    <>
      <DepositWithdrawTabs />
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* LEFT */}
          <div className="bg-white rounded-xl border border-black/10 p-5 sm:p-6 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="text-[18px] font-extrabold text-black">
              {t("ম্যানুয়াল ডিপোজিট", "Manual Deposit")}
            </div>

            {/* Deposit Options */}
            <div className="mt-4">
              <label className="text-[14px] font-semibold text-black">
                {t("Deposit Options", "Deposit Options")}{" "}
                <span className="text-red-500">*</span>
              </label>

              {isLoading ? (
                <div className="mt-3 text-[13px] text-black/60">
                  {t("লোড হচ্ছে...", "Loading...")}
                </div>
              ) : methods.length ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  {methods.map((m) => {
                    const active = selectedOption === m.methodId;
                    const name = isBangla
                      ? m?.methodName?.bn
                      : m?.methodName?.en;

                    return (
                      <button
                        key={m._id || m.methodId}
                        type="button"
                        onClick={() => setSelectedOption(m.methodId)}
                        className={`
                        h-[56px] w-[92px] cursor-pointer sm:w-[110px]
                        rounded-md border-2 bg-white
                        flex items-center justify-center
                        transition
                        ${
                          active
                            ? "border-[#f5c400] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
                            : "border-black/20 hover:border-black/35"
                        }
                      `}
                        title={name || m.methodId}
                      >
                        {m.logoUrl ? (
                          <img
                            src={`${apiBase}${m.logoUrl}`}
                            alt={m.methodId}
                            className="max-h-[32px] max-w-[80px] object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <OptionLogo type={m.methodId} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 text-[13px] text-black/60">
                  {t(
                    "কোনো ডিপোজিট মেথড পাওয়া যায়নি।",
                    "No deposit methods found.",
                  )}
                </div>
              )}
            </div>

            {/* Deposit Channel */}
            <div className="mt-6">
              <label className="text-[14px] font-semibold text-black">
                {t("Deposit Channel", "Deposit Channel")}{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {channels.map((c) => {
                  const active = selectedChannel === c.id;
                  const name = isBangla ? c?.name?.bn : c?.name?.en;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedChannel(c.id)}
                      className={`
                      relative px-5 py-2 cursor-pointer rounded-lg text-[14px] font-extrabold transition bg-white border
                      ${
                        active
                          ? "border-[#f5c400] border-2 shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                          : "border-black/30 hover:border-black/45"
                      }
                    `}
                    >
                      <Tag text={c.tagText || "+0%"} />
                      {name || c.id}
                    </button>
                  );
                })}

                {!channels.length ? (
                  <div className="text-[13px] text-black/60">
                    {t("কোনো চ্যানেল নেই", "No channels")}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Deposit Amount */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[14px] font-semibold text-black">
                  {t("Deposit Amount", "Deposit Amount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <FaQuestionCircle className="text-black/70" />
              </div>

              <div className="mt-3">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full max-w-[520px] bg-white border rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-black/10 ${
                    amountHasValue && !amountValid
                      ? "border-red-400"
                      : "border-black/20"
                  }`}
                />
              </div>

              {/* ✅ NEW: min/max hint */}
              {amountHint ? (
                <div className="mt-2 text-[12px] text-black/55">
                  {amountHint}
                </div>
              ) : null}

              {/* ✅ NEW: validation message */}
              {amountErrorText ? (
                <div className="mt-2 text-[12px] font-semibold text-red-500">
                  {amountErrorText}
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-[720px]">
                {quickAmounts.map((a) => {
                  const active = String(a.v) === String(amount);
                  return (
                    <button
                      key={a.v}
                      type="button"
                      onClick={() => onPickAmount(a.v)}
                      className={`
                      relative h-[44px] cursor-pointer rounded-lg font-extrabold text-[15px] transition
                      ${
                        active
                          ? "bg-[#f5c400] text-black"
                          : "bg-[#f2f3f5] text-black/50 hover:text-black/70 hover:bg-[#e9eaee]"
                      }
                    `}
                    >
                      {a.tag ? (
                        <span className="absolute -top-2 right-3 bg-[#f5c400] text-black text-[11px] font-extrabold px-2 py-[2px] rounded-md shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
                          {a.tag}
                        </span>
                      ) : null}
                      {a.v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promotion */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-semibold text-black">
                  {t("Promotion", "Promotion")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <FaExclamationCircle className="text-[#ff8a00]" />
              </div>

              <div className="mt-3 relative max-w-[520px]">
                <button
                  type="button"
                  onClick={() => setPromoOpen((p) => !p)}
                  className="w-full flex items-center justify-between bg-white border border-black/20 rounded-xl px-4 py-3 text-[14px] hover:border-black/35 transition"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-black/80 font-semibold">
                      {promotions.find((x) => x.id === promo)?.name}
                    </span>
                    {baseBonusTitle && (
                      <span className="text-[12px] text-gray-600 mt-0.5">
                        {baseBonusTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {promo !== "none" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromo("none");
                        }}
                        className="p-1 cursor-pointer rounded-md hover:bg-black/5"
                        title="Clear"
                      >
                        <FaTimes className="text-black/40" />
                      </button>
                    )}
                    <span className="text-black/40 text-[14px] font-extrabold">
                      ▾
                    </span>
                  </div>
                </button>

                {promoOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-black/10 shadow-[0_18px_45px_rgba(0,0,0,0.15)] overflow-hidden">
                    {promotions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPromo(p.id);
                          setPromoOpen(false);
                        }}
                        className={`w-full text-left cursor-pointer px-4 py-3 text-[14px] font-semibold transition hover:bg-black/5 ${
                          promo === p.id ? "bg-[#fff3bf]" : "bg-white"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Deposit Button */}
            <div className="mt-6 max-w-[520px]">
              <button
                type="button"
                onClick={() => {
                  // ✅ keep existing behavior, but block when invalid
                  if (!canDeposit) return;
                  setDetailsOpen(true);
                }}
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
                {t("ডিপোজিট", "Deposit")}
              </button>

              <div className="mt-2 text-[12px] text-black/55">
                {selectedMethod
                  ? `${t("টার্নওভার:", "Turnover:")} ${turnoverMultiplier}x`
                  : t("ডিপোজিট মেথড লোড হচ্ছে…", "Loading methods…")}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="text-[14px] font-extrabold text-black">
              {t("Important Notice", "Important Notice")}
            </div>
            <div className="mt-3 text-[12px] leading-relaxed text-black/70">
              {t(
                "ডিপোজিট সাবমিট করলে তা এডমিন রিভিউ করবে।",
                "After submitting, admin will review your deposit request.",
              )}
            </div>
          </div>
        </div>

        {/* Details modal */}
        <DepositDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onConfirm={() => {
            setDetailsOpen(false);
            setPayOpen(true);
          }}
          details={modalDetails}
          t={t}
        />

        {/* Payment window modal */}
        <DepositModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          data={{
            amount: amountNum,
            methodId: selectedOption,
            channelId: selectedChannel,
            customerCode: "6538651",
            promoId: promo,
          }}
          details={modalDetails}
          methodDoc={selectedMethod}
          channelDoc={selectedChannelDoc}
        />
      </div>
    </>
  );
};

export default Deposit;
