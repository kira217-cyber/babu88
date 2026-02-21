import React, { useEffect, useMemo, useState } from "react";
import { FaRegCopy, FaChevronRight, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import { useLanguage } from "../../Context/LanguageProvider";

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(r).padStart(2, "0");
  return `${mm}:${ss}`;
};

const safeCopy = async (text) => {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    return true;
  } catch {
    return false;
  }
};

const FallbackLogo = ({ methodId }) => {
  return (
    <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center border border-[#0a8f62]">
      <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center border border-[#0a8f62]">
        <div className="text-center leading-none">
          <div className="text-[12px] font-extrabold text-[#e11d48]">
            {(methodId || "PAY").toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const InputRow = ({
  label,
  value,
  onChange,
  placeholder,
  copyable,
  onCopy,
  disabled,
  type = "text",
}) => {
  return (
    <div className="mt-3">
      <div className="text-[13px] font-semibold text-black">{label}</div>
      <div className="mt-1 relative">
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          type={type}
          placeholder={placeholder}
          className={`
            w-full h-[40px] rounded-md border border-black/15 bg-white
            px-3 pr-10 text-[14px] outline-none
            focus:ring-2 focus:ring-black/10
            ${disabled ? "text-black/70 bg-black/[0.03]" : "text-black"}
          `}
        />
        {copyable ? (
          <button
            type="button"
            onClick={onCopy}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              w-[28px] h-[28px] rounded-md
              bg-[#ffb000] text-white flex items-center justify-center
              shadow-[0_6px_14px_rgba(0,0,0,0.14)]
              hover:brightness-95 active:scale-[0.98] transition
            "
            title="Copy"
          >
            <FaRegCopy className="text-[14px]" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Props:
 * open: boolean
 * onClose: fn
 * data: { amount, methodId, channelId, customerCode, promoId }
 * methodDoc: selected method document from API
 */
const DepositModal = ({ open, onClose, data, methodDoc }) => {
  // ✅ ALL HOOKS FIRST (fix for "Rendered more hooks...")
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const apiBase = import.meta.env.VITE_API_URL || "";

  const methodId = data?.methodId || methodDoc?.methodId || "nagad";

  const logoUrl = useMemo(() => {
    const u = methodDoc?.logoUrl;
    return u ? `${apiBase}${u}` : "";
  }, [apiBase, methodDoc?.logoUrl]);

  const inputDefs = useMemo(() => {
    const arr = methodDoc?.details?.inputs;
    return Array.isArray(arr) ? arr : [];
  }, [methodDoc]);

  const agentNumber = methodDoc?.details?.agentNumber || "";
  const personalNumber = methodDoc?.details?.personalNumber || "";

  const instructions = useMemo(() => {
    const bn = methodDoc?.details?.instructions?.bn;
    const en = methodDoc?.details?.instructions?.en;
    return (
      (isBangla ? bn : en) ||
      t(
        "নিচে দেখানো নম্বরে আপনার ট্রান্সফার করুন এবং সঠিক ট্রান্সাকশন আইডি দিন।",
        "Transfer to the number shown below and provide the correct transaction ID.",
      )
    );
  }, [isBangla, methodDoc, t]);

  const [values, setValues] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [howOpen, setHowOpen] = useState(false);

  // ✅ reset + timer on open
  useEffect(() => {
    if (!open) return;

    setSeconds(15 * 60);
    setHowOpen(false);

    const initial = {};

    if (inputDefs.length) {
      for (const f of inputDefs) {
        if (f.key === "amount") initial[f.key] = String(data?.amount ?? "");
        else initial[f.key] = "";
      }
    } else {
      // fallback legacy fields
      initial.amount = String(data?.amount ?? "");
      initial.senderNumber = "";
      initial.trxName = "";
      initial.trxId = "";
    }

    setValues(initial);

    const id = setInterval(() => {
      setSeconds((p) => (p > 0 ? p - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [open, data?.amount, inputDefs]);

  const setField = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const validateField = (def, val) => {
    const v = String(val ?? "").trim();
    if (def?.required && !v) return false;
    if (def?.minLength && v.length < def.minLength) return false;
    if (def?.maxLength && v.length > def.maxLength) return false;
    return true;
  };

  const canSubmit = useMemo(() => {
    if (seconds <= 0) return false;

    if (inputDefs.length) {
      for (const def of inputDefs) {
        if (!validateField(def, values[def.key])) return false;
      }
      // amount > 0 if exists
      if ("amount" in values) {
        const amt = Number(values.amount || 0);
        if (!Number.isFinite(amt) || amt <= 0) return false;
      }
      return true;
    }

    // fallback validation
    const amt = Number(values.amount || 0);
    return (
      amt > 0 &&
      String(values.senderNumber || "").trim().length >= 8 &&
      String(values.trxId || "").trim().length >= 6 &&
      String(values.trxName || "").trim().length >= 2
    );
  }, [seconds, inputDefs, values]);

  const handleCopy = async (txt) => {
    const ok = await safeCopy(txt);
    if (ok) toast.success(t("কপি হয়েছে", "Copied"));
    else toast.error(t("কপি হয়নি", "Copy failed"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // ✅ TODO: এখানে চাইলে backend API hit করতে পারো
    toast.success(t("ডিপোজিট সাবমিট হয়েছে!", "Deposit submitted!"));
    onClose?.();
  };

  // ✅ AFTER hooks, we can early-return safely
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Green stage */}
      <div className="absolute inset-0 bg-[#1f6b57]">
        <div className="h-full w-full flex items-center justify-center px-4 py-8">
          {/* Card */}
          <div className="h-[600px] overflow-y-auto [scrollbar-width:none] md:h-[720px] w-full max-w-[640px] bg-white rounded-lg shadow-[0_24px_70px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="w-[120px] h-[60px] overflow-hidden border border-[#0a8f62] bg-white">
                      <img
                        src={logoUrl}
                        alt={methodId}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <FallbackLogo methodId={methodId} />
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[14px] font-extrabold text-black">
                    {t("বাকি সময়", "Time left")}{" "}
                    <span className="text-[#ff2d2d]">
                      {formatTime(seconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instruction */}
              <div className="mt-3 text-center text-[12px] leading-relaxed text-black/70">
                {instructions}
              </div>

              <div className="mt-4 h-[1px] bg-black/10" />

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-3">
                {/* Dynamic inputs from admin */}
                {inputDefs.length ? (
                  inputDefs.map((def) => {
                    const label = isBangla ? def?.label?.bn : def?.label?.en;
                    const placeholder = isBangla
                      ? def?.placeholder?.bn
                      : def?.placeholder?.en;

                    const isAmount = def.key === "amount";
                    return (
                      <InputRow
                        key={def.key}
                        label={`${label || def.key}${def.required ? " *" : ""}`}
                        value={values[def.key] ?? ""}
                        onChange={(e) => setField(def.key, e.target.value)}
                        placeholder={placeholder || ""}
                        type={def.type || "text"}
                        copyable={isAmount}
                        onCopy={() => handleCopy(values[def.key] ?? "")}
                      />
                    );
                  })
                ) : (
                  <>
                    <InputRow
                      label={t("পরিমাণ (৳):", "Amount (৳):")}
                      value={values.amount || ""}
                      onChange={(e) => setField("amount", e.target.value)}
                      placeholder="1000"
                      copyable
                      onCopy={() => handleCopy(values.amount || "")}
                      type="number"
                    />

                    <InputRow
                      label={`${(methodId || "").toUpperCase()} ${t("এজেন্ট", "Agent")}:`}
                      value={agentNumber || t("সেট করা হয়নি", "Not set")}
                      onChange={() => {}}
                      disabled
                      copyable
                      onCopy={() => handleCopy(agentNumber || "")}
                    />

                    <InputRow
                      label={t("প্রেরকের নম্বর:", "Sender number:")}
                      value={values.senderNumber || ""}
                      onChange={(e) => setField("senderNumber", e.target.value)}
                      placeholder="01XXXXXXXXX"
                      type="tel"
                    />

                    <InputRow
                      label={t("ট্রান্সাকশন নাম্বার:", "Transaction type:")}
                      value={values.trxName || ""}
                      onChange={(e) => setField("trxName", e.target.value)}
                      placeholder="Agent / Merchant / Personal"
                    />

                    <InputRow
                      label={t("ট্রান্সাকশন আইডি:", "Transaction ID:")}
                      value={values.trxId || ""}
                      onChange={(e) => setField("trxId", e.target.value)}
                      placeholder="e.g. 9A7B6C5D"
                    />
                  </>
                )}

                {/* Always show agent/personal numbers if exist */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputRow
                    label={t("এজেন্ট নাম্বার:", "Agent number:")}
                    value={agentNumber || t("সেট করা হয়নি", "Not set")}
                    onChange={() => {}}
                    disabled
                    copyable
                    onCopy={() => handleCopy(agentNumber || "")}
                  />
                  <InputRow
                    label={t("পার্সোনাল/মার্চেন্ট:", "Personal/Merchant:")}
                    value={personalNumber || t("সেট করা হয়নি", "Not set")}
                    onChange={() => {}}
                    disabled
                    copyable
                    onCopy={() => handleCopy(personalNumber || "")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`
                    mt-4 w-full cursor-pointer h-[46px] rounded-md
                    text-[15px] font-extrabold
                    transition
                    ${
                      canSubmit
                        ? "bg-[#8a8a8a] text-white hover:brightness-95"
                        : "bg-[#bdbdbd] text-white/90 cursor-not-allowed"
                    }
                  `}
                >
                  {t("জমা দিন", "Submit")}
                </button>

                {/* How to deposit accordion */}
                <button
                  type="button"
                  onClick={() => setHowOpen((p) => !p)}
                  className="
                    mt-4 w-full h-[44px] rounded-md border border-black/15
                    bg-black/[0.03] text-left px-3
                    flex items-center justify-between
                  "
                >
                  <div className="flex items-center gap-2 font-extrabold text-[14px] text-black">
                    <span
                      className="
                        inline-flex items-center justify-center
                        w-[18px] h-[18px] rounded
                        border border-black/25
                      "
                    >
                      <FaChevronRight
                        className={`text-[12px] transition ${
                          howOpen ? "rotate-90" : ""
                        }`}
                      />
                    </span>
                    {t("কিভাবে ডিপোজিট করবেন?", "How to deposit?")}
                  </div>
                </button>

                {howOpen && (
                  <div className="mt-2 rounded-md border border-black/10 bg-white p-3 text-[12px] text-black/70 leading-relaxed">
                    <div className="font-extrabold text-black/90 mb-1">
                      {t("ধাপসমূহ:", "Steps:")}
                    </div>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>
                        {t("আপনার ওয়ালেট অ্যাপে যান", "Open your wallet app")}
                      </li>
                      <li>
                        {t(
                          "Send Money / Cash Out নির্বাচন করুন",
                          "Choose Send Money / Cash Out",
                        )}
                      </li>
                      <li>
                        {t(
                          "উপরের নম্বরে টাকা পাঠান",
                          "Send to the number above",
                        )}
                      </li>
                      <li>
                        {t(
                          "ট্রান্সাকশন আইডি এখানে দিন",
                          "Paste the transaction ID here",
                        )}
                      </li>
                      <li>
                        {t("সব ঠিক থাকলে সাবমিট করুন", "Submit when done")}
                      </li>
                    </ol>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-black/60">
                  <FaLock className="text-[12px]" />
                  <span>
                    {t(
                      "তুমি একটা নিরাপদ জায়গায় আছো।",
                      "You’re in a secure place.",
                    )}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute cursor-pointer top-4 right-4 w-[36px] h-[36px] rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow"
        aria-label="Close"
      >
        <span className="text-[20px] leading-none text-black/70">
          <IoMdClose />
        </span>
      </button>
    </div>
  );
};

export default DepositModal;
