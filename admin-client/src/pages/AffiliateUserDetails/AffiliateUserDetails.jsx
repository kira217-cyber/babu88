import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSyncAlt,
  FaSave,
  FaUserCheck,
  FaUserSlash,
  FaInfoCircle,
  FaPercentage,
  FaWallet,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const fetchAffiliate = async (id) => {
  const { data } = await api.get(`/api/admin/affiliates/${id}`);
  return data?.user;
};

const AffiliateUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["admin-affiliate-details", id],
    queryFn: () => fetchAffiliate(id),
    enabled: !!id,
    staleTime: 15_000,
    retry: 1,
  });

  const [saving, setSaving] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [form, setForm] = useState({
    username: "",
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
    currency: "BDT",
    balance: 0,
    isActive: false,

    gameLossCommission: 0,
    depositCommission: 0,
    referCommission: 0,
    gameWinCommission: 0,

    gameLossCommissionBalance: 0,
    depositCommissionBalance: 0,
    referCommissionBalance: 0,
    gameWinCommissionBalance: 0,

    password: "", // ← added for password change
  });

  // Sync form when user data arrives
  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      currency: user.currency ?? "BDT",
      balance: Number(user.balance ?? 0),
      isActive: Boolean(user.isActive),

      gameLossCommission: Number(user.gameLossCommission ?? 0),
      depositCommission: Number(user.depositCommission ?? 0),
      referCommission: Number(user.referCommission ?? 0),
      gameWinCommission: Number(user.gameWinCommission ?? 0),

      gameLossCommissionBalance: Number(user.gameLossCommissionBalance ?? 0),
      depositCommissionBalance: Number(user.depositCommissionBalance ?? 0),
      referCommissionBalance: Number(user.referCommissionBalance ?? 0),
      gameWinCommissionBalance: Number(user.gameWinCommissionBalance ?? 0),

      password: "", // reset password field
    });
  }, [user]);

  // Detect changed fields (excluding password if empty)
  const changed = useMemo(() => {
    if (!user) return {};
    const changes = {};
    Object.keys(form).forEach((key) => {
      let a = form[key];
      let b = user[key];

      // Skip password if empty (means no change)
      if (key === "password" && (!a || a.trim() === "")) return;

      // Normalize
      if (
        typeof a === "number" ||
        key.includes("Commission") ||
        key === "balance"
      ) {
        a = Number(a ?? 0);
        b = Number(b ?? 0);
      } else if (key === "isActive") {
        a = Boolean(a);
        b = Boolean(b);
      } else if (key === "currency") {
        a = String(a || "").toUpperCase();
        b = String(b || "").toUpperCase();
      } else {
        a = String(a ?? "").trim();
        b = String(b ?? "").trim();
      }

      if (a !== b) {
        changes[key] = form[key];
      }
    });
    return changes;
  }, [form, user]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumberChange = (key) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: val === "" ? "" : Number(val),
    }));
  };

  const handleSave = async () => {
    if (Object.keys(changed).length === 0) {
      toast.info("No changes detected");
      return;
    }

    // Extra password validation before sending
    if (changed.password) {
      if (changed.password.trim().length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    try {
      setSaving(true);
      const { data } = await api.patch(`/api/admin/affiliates/${id}`, changed);
      toast.success(data?.message || "Affiliate updated successfully");

      // Clear password field after successful save
      setForm((prev) => ({ ...prev, password: "" }));
      await refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickActivate = async () => {
    try {
      setSaving(true);
      await api.patch(`/api/admin/affiliates/${id}`, { isActive: true });
      toast.success("Affiliate activated");
      await refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Activation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    try {
      setSaving(true);
      await api.patch(`/api/admin/affiliates/${id}/deactivate`);
      toast.success("Affiliate deactivated");
      setDeactivateModalOpen(false);
      await refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deactivation failed");
    } finally {
      setSaving(false);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────
  const card =
    "bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] border border-amber-900/40 rounded-xl shadow-lg shadow-black/40 text-white overflow-hidden";
  const sectionTitle =
    "text-xl font-bold text-amber-300 mb-4 flex items-center gap-2";
  const label = "text-amber-200/80 text-sm font-medium mb-1.5 block";
  const inputBase =
    "w-full bg-black/40 border border-amber-900/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30 transition-all";
  const btnBase =
    "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-md shadow-amber-700/30`;
  const dangerBtn = `${btnBase} bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-900/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 border border-white/15 text-white`;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-amber-950/10 to-black">
        <div className={card + " p-6 text-center"}>
          Loading affiliate details...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-amber-950/10 to-black">
        <div className={card + " p-6"}>
          <p className="text-red-400 text-lg">
            Failed to load affiliate details
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className={secondaryBtn} onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back
            </button>
            <button className={secondaryBtn} onClick={refetch}>
              <FaSyncAlt /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-amber-950/10 to-black text-white">
      <div className={card + " p-5 sm:p-7"}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-900/30">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-100">
              Affiliate Details
            </h2>
            <p className="text-amber-200/70 mt-1 text-sm">
              ID: <span className="text-amber-100 font-mono">{user._id}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button className={secondaryBtn} onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back
            </button>
            <button
              className={secondaryBtn}
              onClick={refetch}
              disabled={isFetching}
            >
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>

            {user.isActive ? (
              <button
                className={dangerBtn}
                onClick={() => setDeactivateModalOpen(true)}
                disabled={saving}
              >
                <FaUserSlash /> Deactivate
              </button>
            ) : (
              <button
                className={primaryBtn}
                onClick={handleQuickActivate}
                disabled={saving}
              >
                <FaUserCheck /> Activate
              </button>
            )}

            <button
              className={`${primaryBtn} min-w-[140px]`}
              onClick={handleSave}
              disabled={saving || Object.keys(changed).length === 0}
            >
              <FaSave /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold border ${
              user.isActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
          {isFetching && (
            <span className="text-amber-300/70 text-sm animate-pulse">
              Refreshing...
            </span>
          )}
        </div>

        {/* Editable Fields */}
        <div className="mt-8">
          <h3 className={sectionTitle}>
            <FaInfoCircle /> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "Username", key: "username" },
              { label: "Phone", key: "phone" },
              { label: "Email", key: "email" },
              {
                label: "Currency",
                key: "currency",
                type: "select",
                options: ["BDT", "USDT"],
              },
              { label: "Balance", key: "balance", type: "number" },
              { label: "First Name", key: "firstName" },
              { label: "Last Name", key: "lastName" },
              {
                label: "New Password (optional)",
                key: "password",
                type: "password",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className={label}>{field.label}</label>

                {field.type === "select" ? (
                  <select
                    className={inputBase}
                    value={form[field.key] || ""}
                    onChange={handleChange(field.key)}
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "password" ? (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${inputBase} pr-10`}
                      value={form[field.key] || ""}
                      onChange={handleChange(field.key)}
                      placeholder="Leave blank to keep current"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    step={field.type === "number" ? "0.01" : undefined}
                    className={inputBase}
                    value={form[field.key] ?? ""}
                    onChange={
                      field.type === "number"
                        ? handleNumberChange(field.key)
                        : handleChange(field.key)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Password hint */}
          {form.password.trim().length > 0 && (
            <div className="mt-4 p-3 bg-amber-950/40 rounded-lg border border-amber-800/40 text-amber-200/90 text-sm">
              <strong>Note:</strong> New password will be applied on save
              (minimum 6 characters).
            </div>
          )}
        </div>

        {/* Referral & Meta */}
        <div className="mt-10">
          <h3 className={sectionTitle}>
            <FaInfoCircle /> Referral & Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={label}>Referral Code</label>
              <input
                className={inputBase}
                value={user.referralCode || "—"}
                readOnly
              />
            </div>
            <div>
              <label className={label}>Created At</label>
              <input
                className={inputBase}
                value={
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleString("en-US")
                    : "—"
                }
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Commissions */}
        <div className="mt-10">
          <h3 className={sectionTitle}>
            <FaPercentage /> Commission Rates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              "gameLossCommission",
              "depositCommission",
              "referCommission",
              "gameWinCommission",
            ].map((key) => (
              <div key={key}>
                <label className={label}>
                  {key.replace("Commission", " Commission")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputBase}
                  value={form[key] ?? 0}
                  onChange={handleNumberChange(key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Commission Balances */}
        <div className="mt-10">
          <h3 className={sectionTitle}>
            <FaWallet /> Commission Balances
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              "gameLossCommissionBalance",
              "depositCommissionBalance",
              "referCommissionBalance",
              "gameWinCommissionBalance",
            ].map((key) => (
              <div key={key}>
                <label className={label}>
                  {key.replace("CommissionBalance", " Commission Balance")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={inputBase}
                  value={form[key] ?? 0}
                  onChange={handleNumberChange(key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Changed fields summary */}
        {Object.keys(changed).length > 0 && (
          <div className="mt-8 p-4 bg-amber-950/30 rounded-lg border border-amber-800/40">
            <p className="text-amber-200/90 text-sm">
              <strong>Changed fields:</strong> {Object.keys(changed).join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Deactivate Confirmation Modal */}
      {deactivateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeactivateModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#111] to-[#1a1200] border border-red-800/50 rounded-2xl p-6 shadow-2xl shadow-red-900/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-red-300">
              Deactivate Affiliate?
            </h3>
            <p className="mt-3 text-red-200/80">
              {user?.username} will stop earning commissions and appear
              inactive.
            </p>

            <div className="mt-8 flex justify-end gap-4">
              <button
                className={secondaryBtn}
                onClick={() => setDeactivateModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className={dangerBtn}
                onClick={handleDeactivateConfirm}
                disabled={saving}
              >
                {saving ? "Processing..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateUserDetails;
