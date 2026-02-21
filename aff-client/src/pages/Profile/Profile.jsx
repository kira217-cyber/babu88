// src/pages/dashboard/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { selectToken, selectUser } from "../../features/auth/authSelectors";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaKey,
  FaCoins,
  FaSyncAlt,
  FaSave,
} from "react-icons/fa";

// যদি তোমার authSlice এ update user action থাকে, চাইলে ব্যবহার করতে পারো
// import { setAuth } from "../../features/auth/authSlice";

const fieldBase =
  "w-full h-11 bg-gray-900/70 border border-cyan-700/50 rounded-xl px-4 text-white placeholder-cyan-300/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/35 transition-all";
const labelBase = "text-sm font-semibold text-cyan-100/90";
const cardBase =
  "bg-gradient-to-br from-gray-950 via-cyan-950/25 to-gray-950 border border-cyan-800/50 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden";

const StatPill = ({ k, v }) => (
  <div className="px-4 py-3 rounded-xl bg-gray-900/60 border border-cyan-800/40">
    <div className="text-[11px] text-cyan-300/70 font-semibold">{k}</div>
    <div className="mt-1 text-[14px] text-white font-extrabold truncate">{v}</div>
  </div>
);

const Profile = () => {
  const token = useSelector(selectToken);
  const authUser = useSelector(selectUser);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const authHeader = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      currency: "BDT",
      firstName: "",
      lastName: "",
    },
  });

  const currency = watch("currency");

  const loadMe = async () => {
    try {
      if (!token) return;
      setLoading(true);

      const res = await api.get("/api/me", { headers: authHeader });
      const u = res?.data?.data;

      reset({
        username: u?.username || "",
        email: u?.email || "",
        phone: u?.phone || "",
        password: "",
        currency: u?.currency || "BDT",
        firstName: u?.firstName || "",
        lastName: u?.lastName || "",
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmit = async (values) => {
    try {
      if (!token) return toast.error("Unauthorized");

      setSaving(true);

      const payload = {
        username: values.username?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        currency: String(values.currency || "BDT").toUpperCase(),
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
      };

      // password optional
      if (values.password && values.password.trim().length > 0) {
        payload.password = values.password.trim();
      }

      const res = await api.put("/api/me", payload, { headers: authHeader });

      toast.success(res?.data?.message || "Profile updated");

      // ✅ optional redux update (তোমার slice যদি support করে)
      // dispatch(setAuth({ user: res.data.data, token }));

      reset({
        ...values,
        password: "",
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-700/40">
              <FaUserCircle className="text-black text-2xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Profile
              </h1>
              <p className="text-sm text-cyan-200/70">
                Update your affiliate account details
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadMe}
            disabled={loading || saving}
            className="h-11 px-4 rounded-xl bg-gray-900/60 border border-cyan-700/50 text-cyan-100 font-semibold hover:bg-cyan-900/30 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={saving || loading || !isDirty}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold border border-cyan-500/50 shadow-lg shadow-cyan-700/30 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Card */}
      <div className={cardBase}>
        {/* Top strip */}
        <div className="px-5 sm:px-7 py-5 border-b border-cyan-800/50 bg-gradient-to-r from-gray-950/80 via-cyan-950/20 to-gray-950/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StatPill k="Role" v={authUser?.role || "aff-user"} />
            <StatPill k="Status" v={authUser?.isActive ? "Active" : "Inactive"} />
            {/* <StatPill k="User ID" v={authUser?._id || "—"} /> */}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Username */}
            <div>
              <label className={labelBase}>
                Username <span className="text-red-400">*</span>
              </label>
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <FaUserCircle />
                </span>
                <input
                  className={`${fieldBase} pl-11`}
                  placeholder="username"
                  {...register("username", { required: "Username is required" })}
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={labelBase}>
                Phone <span className="text-red-400">*</span>
              </label>
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <FaPhoneAlt />
                </span>
                <input
                  className={`${fieldBase} pl-11`}
                  placeholder="01XXXXXXXXX"
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^01[3-9]\d{8}$/,
                      message: "Invalid BD phone number",
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelBase}>Email</label>
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className={`${fieldBase} pl-11`}
                  placeholder="example@mail.com"
                  {...register("email")}
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className={labelBase}>
                Currency <span className="text-red-400">*</span>
              </label>
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <FaCoins />
                </span>
                <select
                  className={`${fieldBase} pl-11 bg-gray-900/70`}
                  {...register("currency", { required: true })}
                >
                  <option value="BDT">BDT</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-cyan-200/60">
                Current: <span className="font-bold text-cyan-100">{currency}</span>
              </p>
            </div>

            {/* First name */}
            <div>
              <label className={labelBase}>First Name</label>
              <input
                className={`mt-2 ${fieldBase}`}
                placeholder="First name"
                {...register("firstName")}
              />
            </div>

            {/* Last name */}
            <div>
              <label className={labelBase}>Last Name</label>
              <input
                className={`mt-2 ${fieldBase}`}
                placeholder="Last name"
                {...register("lastName")}
              />
            </div>

            {/* Password */}
            <div className="lg:col-span-2">
              <label className={labelBase}>Password (optional)</label>
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <FaKey />
                </span>
                <input
                  type="password"
                  className={`${fieldBase} pl-11`}
                  placeholder="Leave blank to keep current password"
                  {...register("password", {
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
              )}
              <p className="mt-2 text-xs text-cyan-200/60">
                If you don’t want to change password, keep it empty.
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-cyan-200/60">
              Tip: username & phone must be unique. Duplicate হলে update fail করবে।
            </div>

            <button
              type="submit"
              disabled={saving || loading || !isDirty}
              className="h-11 w-full sm:w-auto px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold border border-cyan-500/50 shadow-lg shadow-cyan-700/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaSave />
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;