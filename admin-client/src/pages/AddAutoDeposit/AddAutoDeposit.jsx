import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaCog,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaArrowDown,
  FaArrowUp,
  FaSave,
  FaSyncAlt,
  FaInfoCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const AddAutoDeposit = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ NEW: token visibility (default hidden)
  const [showToken, setShowToken] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      businessToken: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
    },
  });

  const active = watch("active");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/auto-deposit/admin");
        if (data?.success) {
          reset({
            businessToken: data.data.businessToken || "",
            active: !!data.data.active,
            minAmount: Number(data.data.minAmount || 5),
            maxAmount: Number(data.data.maxAmount || 0),
          });
        }
      } catch (e) {
        toast.error("Failed to load AutoDeposit settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      setSaving(true);

      const min = Math.floor(Number(values.minAmount || 0));
      const max = Math.floor(Number(values.maxAmount || 0));

      if (!min || min < 1) return toast.error("Min amount invalid");
      if (max > 0 && min > max)
        return toast.error("Min cannot be greater than Max");

      const { data } = await api.put("/api/auto-deposit/admin", {
        businessToken: String(values.businessToken || ""),
        active: !!values.active,
        minAmount: min,
        maxAmount: max,
      });

      if (data?.success) {
        toast.success("AutoDeposit settings updated");
      } else {
        toast.error(data?.message || "Update failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/auto-deposit/admin");
      if (data?.success) {
        reset({
          businessToken: data.data.businessToken || "",
          active: !!data.data.active,
          minAmount: Number(data.data.minAmount || 5),
          maxAmount: Number(data.data.maxAmount || 0),
        });
        toast.info("Refreshed");
      }
    } catch {
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/20 to-black text-white shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-yellow-700/40 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/35 flex items-center justify-center">
                <FaCog className="text-white text-xl" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-tight">
                  Auto Deposit
                </div>
                <div className="text-xs text-white/85">Settings loading...</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="h-10 w-full rounded-xl bg-white/10 animate-pulse" />
            <div className="mt-4 h-10 w-full rounded-xl bg-white/10 animate-pulse" />
            <div className="mt-4 h-10 w-48 rounded-xl bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/20 to-black text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-yellow-700/40 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black/35 flex items-center justify-center shadow-lg shadow-yellow-900/20">
                <FaCog className="text-white text-xl" />
              </div>

              <div>
                <div className="text-xl font-extrabold tracking-tight">
                  Auto Deposit Settings
                </div>
                <div className="text-xs text-white/85">
                  OraclePay token + min/max deposit control
                </div>
              </div>
            </div>

            {/* Status pill */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold border shadow-sm ${
                active
                  ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/30"
                  : "bg-red-400/15 text-red-200 border-red-400/30"
              }`}
            >
              {active ? <FaToggleOn /> : <FaToggleOff />}
              {active ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6">
          {/* Info banner */}
          <div className="rounded-xl border border-yellow-700/40 bg-black/40 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-yellow-300">
                <FaInfoCircle />
              </div>
              <div className="text-sm text-yellow-100/90">
                <div className="font-bold text-white flex items-center gap-2">
                  <FaShieldAlt className="text-yellow-300" />
                  Security Note
                </div>
                <div className="mt-1 text-yellow-100/80">
                  Token server-side থাকবে—client এ যাবে না। Defaultভাবে token
                  hidden থাকবে।
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {/* Token */}
            <div className="rounded-2xl border border-yellow-700/40 bg-black/45 p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
                  <FaKey className="text-yellow-300" />
                </div>
                <div>
                  <div className="font-extrabold text-white">
                    Business Token
                  </div>
                  <div className="text-xs text-yellow-100/70">
                    Header:{" "}
                    <span className="font-mono">X-Opay-Business-Token</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-yellow-100/80">
                  Token
                </label>

                {/* ✅ token input + show/hide */}
                <div className="mt-2 relative">
                  <input
                    {...register("businessToken")}
                    type={showToken ? "text" : "password"}
                    placeholder="Paste OraclePay Business Token"
                    className="w-full rounded-xl border border-yellow-700/50 bg-black/50 px-4 py-3 pr-12 font-mono text-sm text-white placeholder-yellow-100/30 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  />

                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-yellow-700/40 bg-black/40 hover:bg-yellow-900/30 transition-all"
                    aria-label={showToken ? "Hide token" : "Show token"}
                    title={showToken ? "Hide token" : "Show token"}
                  >
                    {showToken ? (
                      <FaEyeSlash className="text-yellow-200" />
                    ) : (
                      <FaEye className="text-yellow-200" />
                    )}
                  </button>
                </div>

                <div className="mt-2 text-[12px] text-yellow-100/60">
                  {showToken
                    ? "Visible mode: token showing"
                    : "Hidden mode: token masked"}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <label className="inline-flex items-center gap-3 select-none">
                  <input
                    id="active"
                    type="checkbox"
                    {...register("active")}
                    className="h-5 w-5 accent-yellow-400"
                  />
                  <span className="font-extrabold text-white">Active</span>
                </label>

                <div className="text-xs text-yellow-100/70">
                  {active ? "Client site: Enabled" : "Client site: Disabled"}
                </div>
              </div>
            </div>

            {/* Min/Max */}
            <div className="rounded-2xl border border-yellow-700/40 bg-black/45 p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                  <FaCog className="text-amber-300" />
                </div>
                <div>
                  <div className="font-extrabold text-white">
                    Deposit Limits
                  </div>
                  <div className="text-xs text-yellow-100/70">
                    min/max apply হবে payment create করার সময়
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-yellow-100/80 inline-flex items-center gap-2">
                    <FaArrowDown className="text-emerald-300" />
                    Minimum Deposit Amount
                  </label>
                  <input
                    inputMode="numeric"
                    {...register("minAmount")}
                    placeholder="5"
                    className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/50 px-4 py-3 font-bold text-white placeholder-yellow-100/30 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  />
                  <div className="mt-1 text-[12px] text-yellow-100/60">
                    Minimum 1 (recommended 5)
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-yellow-100/80 inline-flex items-center gap-2">
                    <FaArrowUp className="text-rose-300" />
                    Maximum Deposit Amount
                  </label>
                  <input
                    inputMode="numeric"
                    {...register("maxAmount")}
                    placeholder="500000"
                    className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/50 px-4 py-3 font-bold text-white placeholder-yellow-100/30 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  />
                  <div className="mt-1 text-[12px] text-yellow-100/60">
                    0 দিলে unlimited হবে
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold border border-yellow-700/50 bg-black/60 hover:bg-yellow-900/30 text-yellow-100 transition-all"
              >
                <FaSyncAlt />
                Refresh
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-black bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-yellow-600/30 border border-yellow-400/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {/* Footer hint */}
            <div className="text-xs text-yellow-100/60 text-center">
              Save করার পরে client site এ{" "}
              <span className="font-bold text-yellow-100">Auto Deposit</span>{" "}
              page automatically enable/disable হবে।
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAutoDeposit;
