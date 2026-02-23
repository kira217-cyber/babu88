// src/pages/admin/Redeem/AddRedeem.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddRedeem = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState("100");
  const [maxAmount, setMaxAmount] = useState("0"); // 0 => no limit

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/redeem/settings");
      const d = data?.data || {};
      setEnabled(!!d.enabled);
      setMinAmount(String(d.minAmount ?? 100));
      setMaxAmount(String(d.maxAmount ?? 0));
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load redeem settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await api.put("/api/admin/redeem/settings", {
        enabled,
        minAmount: Number(minAmount || 0),
        maxAmount: Number(maxAmount || 0),
      });
      toast.success("Redeem settings updated");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-yellow-700/30 bg-gradient-to-br from-black via-yellow-950/20 to-black shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-yellow-700/30">
          <div className="text-[18px] font-extrabold text-white">
            Redeem Settings
          </div>
          <div className="mt-1 text-[12px] text-yellow-200/70">
            Control redeem: enable/disable + min/max amount.
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="text-[13px] text-yellow-200/70">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[12px] font-extrabold text-yellow-200/80">
                  Redeem Status
                </div>

                <label className="mt-3 flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  <span className="text-[13px] font-bold">Enabled</span>
                </label>

                <div className="mt-4 text-[11px] text-yellow-200/60">
                  If disabled, users cannot redeem.
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[12px] font-extrabold text-yellow-200/80">
                  Limits
                </div>

                <div className="mt-3">
                  <div className="text-[12px] text-yellow-200/70 font-bold">
                    Minimum
                  </div>
                  <input
                    value={minAmount}
                    onChange={(e) =>
                      setMinAmount(e.target.value.replace(/[^\d]/g, ""))
                    }
                    className="mt-2 w-full h-[44px] rounded-xl bg-black/50 border border-yellow-700/40 text-white px-4 outline-none"
                    inputMode="numeric"
                    placeholder="100"
                  />
                </div>

                <div className="mt-3">
                  <div className="text-[12px] text-yellow-200/70 font-bold">
                    Maximum (0 = no limit)
                  </div>
                  <input
                    value={maxAmount}
                    onChange={(e) =>
                      setMaxAmount(e.target.value.replace(/[^\d]/g, ""))
                    }
                    className="mt-2 w-full h-[44px] rounded-xl bg-black/50 border border-yellow-700/40 text-white px-4 outline-none"
                    inputMode="numeric"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={save}
              disabled={saving || loading}
              className={`px-5 py-3 rounded-xl font-extrabold border transition ${
                saving || loading
                  ? "bg-black/30 border-yellow-700/30 text-yellow-200/40 cursor-not-allowed"
                  : "bg-yellow-500/25 border-yellow-400/40 text-yellow-100 hover:bg-yellow-500/30"
              }`}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRedeem;
