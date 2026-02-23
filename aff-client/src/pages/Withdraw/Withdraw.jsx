// src/pages/dashboard/Withdraw/Withdraw.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import { api } from "../../api/axios";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const card =
  "bg-gradient-to-b from-gray-950 via-cyan-950/25 to-gray-950 border border-cyan-800/50 rounded-2xl shadow-2xl shadow-cyan-900/30";

const labelCls = "text-[13px] font-semibold text-cyan-100";
const inputCls =
  "mt-2 w-full h-[44px] rounded-xl border border-cyan-700/50 bg-gray-900/70 px-4 text-[14px] text-white outline-none placeholder-cyan-300/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all";

const Withdraw = () => {
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const token = auth?.token;

  const isAuthed = useSelector(selectIsAuthenticated);
  const me = useSelector(selectUser);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  // notices (same style)
  const notices = useMemo(
    () => [
      {
        title: "Use Official Withdrawal Channels Only:",
        body: "Withdraw funds through the official methods in this panel. Avoid third-party channels.",
      },
      {
        title: "Pending Transaction Support:",
        body: "If your withdraw stays pending for a long time, contact support.",
      },
      {
        title: "Use Correct Wallet/Number:",
        body: "Wrong number may cause delays or issues.",
      },
    ],
    [],
  );

  // ───────────────────────────────
  // load affiliate withdraw methods
  // ───────────────────────────────
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methods, setMethods] = useState([]);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.get("/api/affiliate-withdraw-methods");
      const rows = res?.data?.data || res?.data || [];
      setMethods(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setMethods([]);
      console.error(e);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  // ───────────────────────────────
  // eligibility
  // ───────────────────────────────
  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: true,
    remaining: 0,
    message: "",
  });

  const loadEligibility = async () => {
    if (!token) {
      setElig({
        eligible: false,
        remaining: 0,
        message: "Please login to withdraw.",
      });
      return;
    }

    try {
      setEligLoading(true);
      const { data } = await api.get(
        "/api/affiliate-withdraw-requests/eligibility",
        {
          headers,
        },
      );
      const payload = data?.data || data || {};
      setElig({
        eligible: !!payload.eligible,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
      });
    } catch (e) {
      // fail open (same pattern)
      setElig((p) => ({ ...p, eligible: true }));
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // selected method
  const [selectedId, setSelectedId] = useState("");
  const selectedMethod = useMemo(() => {
    if (!methods.length) return null;
    return (
      methods.find((m) => String(m.methodId) === String(selectedId)) || null
    );
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedId && methods.length)
      setSelectedId(methods[0]?.methodId || "");
  }, [methods, selectedId]);

  // dynamic fields
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    if (!selectedMethod) return;
    const next = {};
    (selectedMethod.fields || []).forEach((f) => (next[f.key] = ""));
    setFormValues(next);
  }, [selectedMethod?._id]);

  const setVal = (key, value) => setFormValues((p) => ({ ...p, [key]: value }));

  // amount
  const [amount, setAmount] = useState("");
  const amountNum = Number(amount || 0);

  const min = useMemo(() => {
    const v = Number(selectedMethod?.minimumWithdrawAmount ?? 0);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [selectedMethod]);

  const max = useMemo(() => {
    const v = Number(selectedMethod?.maximumWithdrawAmount ?? 0);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [selectedMethod]);

  const hasMax = Number(max) > 0;

  const validAmount = useMemo(() => {
    if (!Number.isFinite(amountNum) || amountNum <= 0) return false;
    if (amountNum < Number(min)) return false;
    if (hasMax && amountNum > Number(max)) return false;
    return true;
  }, [amountNum, min, max, hasMax]);

  const amountErrorText = useMemo(() => {
    if (!amount) return "";
    if (!Number.isFinite(amountNum) || amountNum <= 0)
      return "Enter a valid amount.";
    if (amountNum < Number(min))
      return `Minimum withdraw amount is ৳ ${Number(min).toLocaleString()}.`;
    if (hasMax && amountNum > Number(max))
      return `Maximum withdraw amount is ৳ ${Number(max).toLocaleString()}.`;
    return "";
  }, [amount, amountNum, min, max, hasMax]);

  // field validation
  const fieldErrors = useMemo(() => {
    const errs = {};
    const fields = selectedMethod?.fields || [];
    fields.forEach((f) => {
      const v = String(formValues?.[f.key] ?? "").trim();
      if (f.required !== false && !v) {
        errs[f.key] = "This field is required";
        return;
      }
      if (v) {
        if (f.type === "email") {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          if (!ok) errs[f.key] = "Enter a valid email";
        }
        if (f.type === "number") {
          const n = Number(v);
          if (!Number.isFinite(n)) errs[f.key] = "Numbers only";
        }
        if (f.type === "tel") {
          const bdOk = /^01[3-9]\d{8}$/.test(v);
          if (v.startsWith("01") && v.length >= 11 && !bdOk)
            errs[f.key] =
              "Enter a valid Bangladeshi phone number (01XXXXXXXXX)";
        }
      }
    });
    return errs;
  }, [selectedMethod, formValues]);

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

  const accountOk = !!token && !!me?._id;

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
      await api.post("/api/affiliate-withdraw-requests", payload, { headers });

      toast.success("Withdraw request submitted!");
      navigate("/dashboard/withdraw-history");

      // reset
      setAmount("");
      const next = {};
      (selectedMethod?.fields || []).forEach((f) => (next[f.key] = ""));
      setFormValues(next);

      loadEligibility();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Withdraw request failed");
      loadEligibility();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT */}
        <div className={`${card} p-5 sm:p-7`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[22px] font-extrabold text-white tracking-tight">
                Withdraw
              </div>
              <div className="mt-1 text-[12px] text-cyan-200/70">
                Submit your affiliate withdraw request
              </div>
            </div>

            <button
              type="button"
              onClick={loadMethods}
              className="h-10 px-4 rounded-xl border border-cyan-700/60 bg-cyan-900/20 hover:bg-cyan-900/35 text-cyan-100 text-[13px] font-semibold transition"
            >
              Refresh
            </button>
          </div>

          {/* Auth warning */}
          {!accountOk && (
            <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
              <div className="text-[14px] font-extrabold text-yellow-200">
                Login Required
              </div>
              <div className="mt-1 text-[13px] text-yellow-200/85">
                Please login to submit a withdraw request.
              </div>
            </div>
          )}

          {/* eligibility warning */}
          {accountOk && !eligLoading && !elig.eligible && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="text-[14px] font-extrabold text-red-200">
                Withdrawal Not Allowed
              </div>
              <div className="mt-1 text-[13px] text-red-200/85">
                {elig.message || "You are not eligible right now."}
              </div>
            </div>
          )}

          {accountOk && eligLoading && (
            <div className="mt-4 text-[12px] text-cyan-200/70">
              Checking eligibility…
            </div>
          )}

          {/* Methods */}
          <div className="mt-6">
            <label className={labelCls}>
              Withdrawal Options <span className="text-red-400">*</span>
            </label>

            <div className="mt-3 flex flex-wrap gap-3">
              {loadingMethods ? (
                <div className="text-[13px] text-cyan-200/70">Loading…</div>
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
                        h-[80px] w-[184px]
                        rounded-xl border bg-gray-950/40
                        flex items-center justify-center
                        transition
                        ${
                          active
                            ? "border-cyan-300 shadow-[0_10px_30px_rgba(34,211,238,0.18)]"
                            : "border-cyan-800/50 hover:border-cyan-600/70"
                        }
                        ${!accountOk ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                      `}
                      title={m?.name?.en || m?.methodId}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={m?.name?.en || m?.methodId}
                          className="max-h-[76px] max-w-[180px] object-contain"
                        />
                      ) : (
                        <div className="text-[11px] font-extrabold text-cyan-200/80">
                          {m?.name?.en || m?.methodId}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-[13px] text-cyan-200/70">
                  No withdraw methods found.
                </div>
              )}
            </div>

            {!!selectedMethod && (
              <div className="mt-3 text-[12px] text-cyan-200/70">
                Selected:{" "}
                <span className="font-bold text-white">
                  {selectedMethod?.name?.en || selectedMethod?.methodId}
                </span>
              </div>
            )}
          </div>

          {/* Dynamic Fields */}
          {!!selectedMethod?.fields?.length && (
            <div className="mt-7">
              <div className="text-[14px] font-semibold text-white">
                Account Information <span className="text-red-400">*</span>
              </div>

              <div className="mt-3 max-w-[560px] space-y-4">
                {selectedMethod.fields.map((f) => {
                  const label = f?.label?.en || f.key;
                  const placeholder = f?.placeholder?.en || "";
                  const err = fieldErrors?.[f.key];

                  return (
                    <div key={f.key}>
                      <label className="text-[13px] font-semibold text-cyan-100">
                        {label}{" "}
                        {f.required !== false && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>

                      <input
                        disabled={!accountOk}
                        type={f.type === "number" ? "text" : f.type}
                        value={formValues?.[f.key] ?? ""}
                        onChange={(e) => setVal(f.key, e.target.value)}
                        placeholder={placeholder}
                        className={`${inputCls} ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}`}
                        inputMode={f.type === "number" ? "numeric" : undefined}
                      />

                      {!!err && (
                        <div className="mt-2 text-[12px] text-red-300">
                          {err}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="mt-7 max-w-[560px]">
            <div className="flex items-center justify-between gap-3">
              <label className={labelCls}>
                Withdrawable Amount <span className="text-red-400">*</span>
              </label>
              <FaQuestionCircle className="text-cyan-200/70" />
            </div>

            <input
              disabled={!accountOk}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={
                hasMax
                  ? `Min ৳ ${Number(min).toLocaleString()} - Max ৳ ${Number(max).toLocaleString()}`
                  : `Min ৳ ${Number(min).toLocaleString()}`
              }
              className={`${inputCls} ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}`}
              inputMode="numeric"
            />

            {!!amountErrorText && (
              <div className="mt-2 text-[12px] text-red-300">
                {amountErrorText}
              </div>
            )}
          </div>

          {/* Button */}
          <div className="mt-7 max-w-[560px]">
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={onSubmit}
              className={`
                w-full h-[50px] rounded-2xl font-extrabold text-[14px] transition
                ${
                  canSubmit && !submitting
                    ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-700/40 border border-cyan-500/40 cursor-pointer"
                    : "bg-gray-800/60 text-white/30 border border-cyan-900/40 cursor-not-allowed"
                }
              `}
            >
              {submitting ? "Submitting…" : "WITHDRAW"}
            </button>

            {!canSubmit && !submitting && (
              <div className="mt-2 text-[12px] text-cyan-200/60">
                {!accountOk
                  ? "Please login."
                  : !elig.eligible
                    ? "Not eligible right now."
                    : !selectedMethod
                      ? "Select a method."
                      : !allRequiredOk
                        ? "Fill all required fields."
                        : !noTypeErrors
                          ? "Some inputs are invalid."
                          : !validAmount
                            ? "Amount is invalid."
                            : null}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className={`${card} p-5`}>
          <div className="text-[14px] font-extrabold text-white">
            Important Notice
          </div>
          <div className="mt-4 space-y-4 text-[12px] leading-relaxed text-cyan-100/80">
            {notices.map((n, idx) => (
              <div key={idx}>
                <div className="font-extrabold text-cyan-100">
                  {idx + 1}. {n.title}
                </div>
                <p className="mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
