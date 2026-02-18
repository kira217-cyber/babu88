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
  FaWallet,
  FaUserTag,
  FaCalendarAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const fetchUser = async (id) => {
  const { data } = await api.get(`/api/admin/users/${id}`);
  return data?.user;
};

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: user,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-user-details", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
    staleTime: 12_000,
    retry: 1,
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    balance: 0,
    currency: "BDT",
    isActive: true,
    firstName: "",
    lastName: "",
    password: "", // new field for password change
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sync form when user data loads
  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      balance: Number(user.balance || 0),
      currency: user.currency || "BDT",
      isActive: !!user.isActive,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      password: "", // reset password field on load
    });
  }, [user]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openStatusConfirm = (next) => {
    setPendingStatus(next);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (saving) return;
    setConfirmOpen(false);
  };

  const handleSaveStatusOnly = async () => {
    try {
      setSaving(true);
      const { data } = await api.patch(`/api/admin/users/${id}`, {
        isActive: pendingStatus,
      });
      toast.success(data?.message || "User status updated");
      closeConfirm();
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        balance: Number(form.balance) || 0,
        currency: form.currency,
        isActive: !!form.isActive,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };

      // Only include password if user entered something
      if (form.password.trim().length > 0) {
        if (form.password.trim().length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        payload.password = form.password.trim();
      }

      const { data } = await api.patch(`/api/admin/users/${id}`, payload);
      toast.success(data?.message || "User updated successfully");

      // Clear password field after successful save
      setForm((prev) => ({ ...prev, password: "" }));
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const referredByText = useMemo(() => {
    const rb = user?.referredBy;
    if (!rb) return "—";
    return `${rb.username || "—"} (${rb.phone || "—"})`;
  }, [user?.referredBy]);

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
        <div className={card + " p-6 text-center"}>Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-amber-950/10 to-black">
        <div className={card + " p-6"}>
          <p className="text-amber-300 text-lg">User not found</p>
          <button
            className={`${secondaryBtn} mt-6`}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Go Back
          </button>
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
              User Details
            </h2>
            <p className="text-amber-200/70 mt-1 text-sm font-mono">
              ID: {user._id}
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
            <button
              className={`${primaryBtn} min-w-[140px]`}
              onClick={handleSaveAll}
              disabled={saving}
            >
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-5 flex items-center gap-4 flex-wrap">
          <span
            className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold border ${
              user.isActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>

          <button
            className={user.isActive ? dangerBtn : primaryBtn}
            onClick={() => openStatusConfirm(!user.isActive)}
            disabled={saving}
          >
            {user.isActive ? (
              <>
                <FaUserSlash /> Deactivate
              </>
            ) : (
              <>
                <FaUserCheck /> Activate
              </>
            )}
          </button>

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
              { label: "Email (optional)", key: "email" },
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
                      className={inputBase + " pr-10"}
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
                    onChange={handleChange(field.key)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Read-only Info */}
        <div className="mt-10">
          <h3 className={sectionTitle}>
            <FaUserTag /> Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "Role", value: user.role || "user" },
              { label: "Referral Code", value: user.referralCode || "—" },
              { label: "Referred By", value: referredByText },
              {
                label: "Created Users Count",
                value: String(user.createdUsers?.length || 0),
              },
              {
                label: "Created At",
                value: user.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-US")
                  : "—",
              },
              {
                label: "Last Updated",
                value: user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString("en-US")
                  : "—",
              },
            ].map((item) => (
              <div key={item.label}>
                <label className={label}>{item.label}</label>
                <input className={inputBase} value={item.value} readOnly />
              </div>
            ))}
          </div>
        </div>

        {/* Save hint when password is set */}
        {form.password.trim().length > 0 && (
          <div className="mt-6 p-4 bg-amber-950/30 rounded-lg border border-amber-800/40 text-amber-200/90 text-sm">
            <strong>Note:</strong> New password will be set on save (min 6
            characters).
          </div>
        )}
      </div>

      {/* Status Confirmation Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#111] to-[#1a1200] border border-amber-800/50 rounded-2xl p-6 shadow-2xl shadow-amber-900/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-amber-300">
              {pendingStatus ? "Activate" : "Deactivate"} User?
            </h3>
            <p className="mt-3 text-amber-200/80">
              Are you sure you want to{" "}
              <strong>{pendingStatus ? "ACTIVATE" : "DEACTIVATE"}</strong> this
              account?
            </p>

            <div className="mt-4 text-amber-200/90 text-sm space-y-1.5">
              <div>
                Username: <span className="font-semibold">{user.username}</span>
              </div>
              <div>
                Phone:{" "}
                <span className="font-semibold">{user.phone || "—"}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={closeConfirm}
                className={secondaryBtn}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatusOnly}
                disabled={saving}
                className={pendingStatus ? primaryBtn : dangerBtn}
              >
                {saving
                  ? "Processing..."
                  : pendingStatus
                    ? "Activate"
                    : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
