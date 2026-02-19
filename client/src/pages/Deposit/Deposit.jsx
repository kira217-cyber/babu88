import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { FaExclamationCircle, FaQuestionCircle, FaTimes } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import DepositModal from "./DepositModal";

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

const calcBonus = (amountNum, promoId, channelTagText) => {
  const promoBonus =
    promoId === "welcome" ? 200 : promoId === "reload" ? 100 : 0;

  const percent = parsePercentFromTag(channelTagText);
  const percentBonus = (amountNum * percent) / 100;

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
              k={t("Bonus Amount", "Bonus Amount")}
              v={money(details.promoBonus)}
            />
            <Row
              k={`+${details.percent}% ${t("Bonus Amount", "Bonus Amount")}`}
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
              className="
                w-full max-w-[260px] h-[44px] rounded-lg
                bg-black text-[#f5c400] font-extrabold text-[14px]
                shadow-[0_10px_22px_rgba(0,0,0,0.25)]
                hover:brightness-95 active:scale-[0.99] transition
              "
            >
              {t("Confirm", "Confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ k, v }) => (
  <div className="flex items-center justify-between">
    <div className="text-[14px] font-semibold text-black/35">{k}</div>
    <div className="text-[14px] font-extrabold text-black/80">{v}</div>
  </div>
);

const Deposit = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["deposit-methods-public"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      // client side: show only active methods/channels
      return (res.data || []).filter((m) => m?.isActive !== false);
    },
    staleTime: 30_000,
    retry: 1,
  });

  // quick amounts (still local UI)
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

  // promotions (still local UI; you can also make it API later)
  const promotions = useMemo(
    () => [
      { id: "none", name: t("No Bonus Selected", "No Bonus Selected") },
      { id: "welcome", name: t("Welcome Bonus", "Welcome Bonus") },
      { id: "reload", name: t("Reload Bonus", "Reload Bonus") },
    ],
    [isBangla],
  );

  const notices = useMemo(
    () => [
      {
        title: t(
          "Use Official Deposit & Withdrawal Channels Only:",
          "Use Official Deposit & Withdrawal Channels Only:",
        ),
        body: t(
          "দয়া করে শুধু অফিসিয়াল ডিপোজিট/উইথড্র চ্যানেল ব্যবহার করুন। কোনো থার্ড-পার্টি/অনঅফিসিয়াল মাধ্যম ব্যবহার করবেন না।",
          "Kindly, deposit or withdraw funds through the designated official channels available on our website. Avoid any unofficial or third-party platforms.",
        ),
      },
      {
        title: t(
          "Live Chat Support for Pending Transactions:",
          "Live Chat Support for Pending Transactions:",
        ),
        body: t(
          "আপনার ট্রান্সাকশন ১৫ মিনিটের বেশি পেন্ডিং থাকলে ২৪/৭ লাইভ চ্যাটে যোগাযোগ করুন।",
          "If your transaction remains pending for more than 15 minutes, please contact our 24/7 live chat support for real-time updates.",
        ),
      },
      {
        title: t(
          "Caution Regarding Cash-Outs:",
          "Caution Regarding Cash-Outs:",
        ),
        body: t(
          "যে নাম্বার আগে ট্রান্সফারের জন্য ব্যবহার করেছেন সেখানে সরাসরি ক্যাশ-আউট করবেন না।",
          "Do not cash-out directly to any previously used e-wallet. Always follow our procedures to ensure security and accuracy.",
        ),
      },
      {
        title: t(
          "Use Provided E-Wallet Numbers:",
          "Use Provided E-Wallet Numbers:",
        ),
        body: t(
          "শুধু প্ল্যাটফর্ম থেকে দেওয়া ই-ওয়ালেট নাম্বার ব্যবহার করুন। এতে ভুল কমবে এবং প্রসেস দ্রুত হবে।",
          "Use only the e-wallet number provided by our platform. This helps process efficiently and minimizes errors.",
        ),
      },
    ],
    [isBangla],
  );

  // selections
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [amount, setAmount] = useState("1000");
  const [promo, setPromo] = useState("none");
  const [promoOpen, setPromoOpen] = useState(false);

  // ✅ Modals state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  // set defaults when methods loaded
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

  // keep selectedChannel valid when method changes
  useEffect(() => {
    if (!selectedMethod) return;
    const exists = channels.some((c) => c.id === selectedChannel);
    if (!exists) setSelectedChannel(channels?.[0]?.id || "");
  }, [selectedMethod, channels, selectedChannel]);

  const onPickAmount = (v) => setAmount(String(v));

  const channelTagText =
    channels.find((c) => c.id === selectedChannel)?.tagText || "+0%";

  const amountNum = Number(amount || 0) || 0;
  const { promoBonus, percentBonus, percent } = calcBonus(
    amountNum,
    promo,
    channelTagText,
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

  const handleDepositClick = () => {
    if (!amountNum || amountNum <= 0) return;
    setDetailsOpen(true);
  };

  const handleConfirm = () => {
    setDetailsOpen(false);
    setPayOpen(true);
  };

  const apiBase = import.meta.env.VITE_API_URL || ""; // for image url

  return (
    <div className="w-full ">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* LEFT */}
        <div className="bg-white rounded-xl border border-black/10 p-5 sm:p-6 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <div className="text-[18px] font-extrabold text-black">
            {t("ডিপোজিট", "Deposit")}
          </div>

          {/* Deposit Options */}
          <div className="mt-4">
            <label className="text-[14px] font-semibold text-black">
              {t("Deposit Options", "Deposit Options")}{" "}
              <span className="text-red-500">*</span>
            </label>

            {isLoading ? (
              <div className="mt-3 text-[13px] text-black/60">Loading...</div>
            ) : methods.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {methods.map((m) => {
                  const active = selectedOption === m.methodId;
                  const name = isBangla ? m?.methodName?.bn : m?.methodName?.en;

                  return (
                    <button
                      key={m._id || m.methodId}
                      onClick={() => setSelectedOption(m.methodId)}
                      type="button"
                      className={`
                        h-[58px] min-w-[96px] px-3 rounded-xl flex items-center justify-center gap-2
                        border-2 transition bg-white
                        ${
                          active
                            ? "border-[#f5c400] shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                            : "border-black/25 hover:border-black/40"
                        }
                      `}
                    >
                      {/* Logo */}
                      {m.logoUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 bg-white">
                          <img
                            src={`${apiBase}${m.logoUrl}`}
                            alt={m.methodId}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <OptionLogo type={m.methodId} />
                      )}

                      <div className="text-left leading-none">
                        <div className="text-[13px] font-extrabold text-black">
                          {name || m.methodId}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 text-[13px] text-black/60">
                No deposit methods found.
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
                      relative px-5 py-2 rounded-lg text-[14px] font-extrabold transition bg-white border
                      ${
                        active
                          ? "border-[#f5c400] shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
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
                className="
                  w-full max-w-[520px]
                  bg-white border border-black/20 rounded-xl
                  px-4 py-3 text-[14px] outline-none
                  focus:ring-2 focus:ring-black/10
                "
              />
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[720px]">
              {quickAmounts.map((a) => {
                const active = String(a.v) === String(amount);
                return (
                  <button
                    key={a.v}
                    type="button"
                    onClick={() => onPickAmount(a.v)}
                    className={`
                      relative h-[44px] rounded-lg font-extrabold text-[15px] transition
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

          {/* Promotion (local) */}
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
                className="
                  w-full flex items-center justify-between
                  bg-white border border-black/20 rounded-xl
                  px-4 py-3 text-[14px]
                  hover:border-black/35 transition
                "
              >
                <span className="text-black/80 font-semibold">
                  {promotions.find((x) => x.id === promo)?.name}
                </span>

                <div className="flex items-center gap-3">
                  {promo !== "none" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromo("none");
                      }}
                      className="p-1 rounded-md hover:bg-black/5"
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
                      className={`
                        w-full text-left px-4 py-3 text-[14px] font-semibold transition
                        hover:bg-black/5
                        ${promo === p.id ? "bg-[#fff3bf]" : "bg-white"}
                      `}
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
              onClick={handleDepositClick}
              disabled={!selectedMethod || !selectedChannel}
              className={`
                w-full h-[46px] rounded-full
                font-extrabold text-[14px]
                shadow-[0_10px_22px_rgba(0,136,255,0.25)]
                transition
                ${
                  selectedMethod && selectedChannel
                    ? "bg-[#0088ff] text-white hover:brightness-95 active:scale-[0.99]"
                    : "bg-[#bcdcff] text-white/90 cursor-not-allowed"
                }
              `}
            >
              {t("ডিপোজিট", "Deposit")}
            </button>

            {/* tiny note */}
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

      {/* ✅ Details modal */}
      <DepositDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onConfirm={handleConfirm}
        details={modalDetails}
        t={t}
      />

      {/* ✅ Payment window modal (API-driven) */}
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
        methodDoc={selectedMethod}
      />
    </div>
  );
};

export default Deposit;
