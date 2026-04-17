import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaCog,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaGift,
  FaPercentage,
  FaInfoCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const emptyBonus = () => ({
  _id: `${Date.now()}-${Math.random()}`,
  title: { bn: "", en: "" },
  bonusType: "fixed",
  bonusValue: 0,
  turnoverMultiplier: 1,
  isActive: true,
  order: 0,
});

const AddAutoDeposit = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [bonuses, setBonuses] = useState([]);
  const [deleteId, setDeleteId] = useState("");

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      businessToken: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
    },
  });

  const active = watch("active");

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/auto-deposit/admin");

      if (!data?.success) throw new Error(data?.message || "Load failed");

      reset({
        businessToken: data?.data?.businessToken || "",
        active: !!data?.data?.active,
        minAmount: Number(data?.data?.minAmount || 5),
        maxAmount: Number(data?.data?.maxAmount || 0),
      });

      setBonuses(
        Array.isArray(data?.data?.bonuses)
          ? data.data.bonuses.map((item, idx) => ({
              _id: item?._id || `${Date.now()}-${idx}`,
              title: {
                bn: item?.title?.bn || "",
                en: item?.title?.en || "",
              },
              bonusType: item?.bonusType || "fixed",
              bonusValue: Number(item?.bonusValue || 0),
              turnoverMultiplier: Number(item?.turnoverMultiplier || 1),
              isActive: item?.isActive !== false,
              order: Number(item?.order || idx),
            }))
          : [],
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Load failed",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const addBonus = () => {
    setBonuses((prev) => [...prev, { ...emptyBonus(), order: prev.length }]);
  };

  const updateBonus = (id, key, value) => {
    setBonuses((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;
        if (key === "title.bn")
          return { ...item, title: { ...item.title, bn: value } };
        if (key === "title.en")
          return { ...item, title: { ...item.title, en: value } };
        return { ...item, [key]: value };
      }),
    );
  };

  const confirmDeleteBonus = () => {
    setBonuses((prev) =>
      prev
        .filter((item) => item._id !== deleteId)
        .map((item, idx) => ({ ...item, order: idx })),
    );
    setDeleteId("");
    toast.info("Bonus removed");
  };

  const onSubmit = async (values) => {
    try {
      setSaving(true);

      const min = Math.floor(Number(values.minAmount || 0));
      const max = Math.floor(Number(values.maxAmount || 0));

      if (!min || min < 1) return toast.error("Minimum amount invalid");
      if (max > 0 && min > max)
        return toast.error("Minimum cannot be greater than maximum");

      const sanitizedBonuses = bonuses.map((item, idx) => ({
        _id: item._id,
        title: {
          bn: String(item?.title?.bn || "").trim(),
          en: String(item?.title?.en || "").trim(),
        },
        bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
        bonusValue: Math.max(0, Number(item?.bonusValue || 0)),
        turnoverMultiplier: Math.max(0, Number(item?.turnoverMultiplier || 0)),
        isActive: item?.isActive !== false,
        order: idx,
      }));

      for (const item of sanitizedBonuses) {
        if (!item.title.bn || !item.title.en) {
          toast.error("Every bonus needs Bangla and English title");
          return;
        }
      }

      const { data } = await api.put("/api/auto-deposit/admin", {
        businessToken: String(values.businessToken || "").trim(),
        active: !!values.active,
        minAmount: min,
        maxAmount: max,
        bonuses: sanitizedBonuses,
      });

      if (!data?.success) throw new Error(data?.message || "Save failed");

      toast.success("Auto deposit settings updated");
      await loadSettings();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const activeCount = useMemo(
    () => bonuses.filter((item) => item.isActive).length,
    [bonuses],
  );

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/20 to-black p-6 text-white">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/20 to-black text-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-yellow-700/40 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black/30 flex items-center justify-center">
                <FaCog className="text-xl text-white" />
              </div>
              <div>
                <div className="text-xl font-extrabold">
                  Auto Deposit Setting
                </div>
                <div className="text-xs text-white/80">
                  Token, limits, fixed & percentage bonus, turnover
                </div>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold border ${
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 md:p-6 space-y-6"
        >
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
                  Token server-side থাকবে। এখান থেকে bonus add করলে client site
                  auto deposit page এ active bonus list পাওয়া যাবে।
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
            <div className="rounded-2xl border border-yellow-700/40 bg-black/45 p-5">
              <div className="flex items-center gap-3">
                <FaKey className="text-yellow-300 text-lg" />
                <div className="font-extrabold">Business Token</div>
              </div>

              <div className="mt-4 relative">
                <input
                  {...register("businessToken")}
                  type={showToken ? "text" : "password"}
                  placeholder="Paste business token"
                  className="w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 pr-12 font-mono text-sm text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg border border-yellow-700/40 bg-black/40 hover:bg-yellow-900/30 transition cursor-pointer"
                >
                  {showToken ? (
                    <FaEyeSlash className="mx-auto text-yellow-200" />
                  ) : (
                    <FaEye className="mx-auto text-yellow-200" />
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <label className="inline-flex items-center gap-3 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("active")}
                    className="h-5 w-5 accent-yellow-500 cursor-pointer"
                  />
                  <span>Enable Auto Deposit</span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-700/40 bg-black/45 p-5">
              <div className="font-extrabold">Deposit Limits</div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/75">
                    Minimum Amount
                  </label>
                  <input
                    {...register("minAmount")}
                    className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/75">
                    Maximum Amount
                  </label>
                  <input
                    {...register("maxAmount")}
                    className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-700/40 bg-black/45 overflow-hidden">
            <div className="px-5 py-4 border-b border-yellow-700/40 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-lg font-extrabold">Bonus List</div>
                <div className="text-xs text-white/70">
                  Active: {activeCount} / Total: {bonuses.length}
                </div>
              </div>

              <button
                type="button"
                onClick={addBonus}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold hover:from-yellow-400 hover:to-amber-400 transition cursor-pointer"
              >
                <FaPlus />
                Add Bonus
              </button>
            </div>

            <div className="p-5 space-y-4">
              {bonuses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-yellow-700/40 bg-black/30 p-8 text-center text-white/70">
                  No bonus added yet
                </div>
              ) : (
                bonuses.map((item, idx) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-yellow-700/40 bg-black/35 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="font-extrabold">Bonus #{idx + 1}</div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) =>
                              updateBonus(
                                item._id,
                                "isActive",
                                e.target.checked,
                              )
                            }
                            className="h-5 w-5 accent-yellow-500 cursor-pointer"
                          />
                          <span>{item.isActive ? "Active" : "Inactive"}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setDeleteId(item._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition cursor-pointer"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                      <div>
                        <label className="text-xs font-bold text-white/75">
                          Bangla Title
                        </label>
                        <input
                          value={item.title.bn}
                          onChange={(e) =>
                            updateBonus(item._id, "title.bn", e.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white/75">
                          English Title
                        </label>
                        <input
                          value={item.title.en}
                          onChange={(e) =>
                            updateBonus(item._id, "title.en", e.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white/75">
                          Bonus Type
                        </label>
                        <select
                          value={item.bonusType}
                          onChange={(e) =>
                            updateBonus(item._id, "bonusType", e.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none cursor-pointer"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="percent">Percent</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white/75">
                          {item.bonusType === "percent"
                            ? "Bonus Percentage"
                            : "Fixed Amount"}
                        </label>
                        <input
                          value={item.bonusValue}
                          onChange={(e) =>
                            updateBonus(
                              item._id,
                              "bonusValue",
                              Number(e.target.value || 0),
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white/75">
                          Turnover Multiplier
                        </label>
                        <input
                          value={item.turnoverMultiplier}
                          onChange={(e) =>
                            updateBonus(
                              item._id,
                              "turnoverMultiplier",
                              Number(e.target.value || 0),
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-3 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-yellow-700/30 bg-yellow-500/5 p-3 text-sm text-white/80">
                      <div className="font-bold">
                        {item.bonusType === "percent" ? (
                          <span className="inline-flex items-center gap-2">
                            <FaPercentage className="text-yellow-300" />
                            Percent Bonus
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <FaGift className="text-yellow-300" />
                            Fixed Bonus
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        {item.title.bn || "—"} / {item.title.en || "—"} |{" "}
                        {item.bonusType === "percent"
                          ? `${item.bonusValue}%`
                          : `৳${Number(item.bonusValue || 0).toLocaleString()}`}{" "}
                        | x{Number(item.turnoverMultiplier || 0)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={loadSettings}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold border border-yellow-700/50 bg-black/60 hover:bg-yellow-900/30 text-yellow-100 transition cursor-pointer"
            >
              <FaSyncAlt />
              Refresh
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-black bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>

      {deleteId ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId("")}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-gradient-to-br from-black via-red-950/20 to-black text-white shadow-2xl p-6">
            <div className="text-xl font-extrabold">Delete Bonus?</div>
            <div className="mt-2 text-sm text-white/75">
              এই bonus delete করলে permanently remove হয়ে যাবে।
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId("")}
                className="px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteBonus}
                className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddAutoDeposit;
