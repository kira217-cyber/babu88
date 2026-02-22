// src/pages/Profile/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { selectToken, selectUser } from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";
import Loading from "../Loading/Loading";



const Profile = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const token = useSelector(selectToken);
  const authUser = useSelector(selectUser);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
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

  const authHeader = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // ✅ Load profile
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
      toast.error(
        e?.response?.data?.message ||
          t("প্রোফাইল লোড হয়নি", "Failed to load profile"),
      );
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
      if (!token) return toast.error(t("অননুমোদিত", "Unauthorized"));

      setSaving(true);

      const payload = {
        username: values.username?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        currency: values.currency,
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
      };

      if (values.password && values.password.trim().length > 0) {
        payload.password = values.password.trim();
      }

      const res = await api.put("/api/me", payload, { headers: authHeader });

      toast.success(
        res?.data?.message || t("প্রোফাইল আপডেট হয়েছে", "Profile updated"),
      );

      // keep password empty after save
      reset({ ...values, password: "" });
    } catch (e) {
      toast.error(
        e?.response?.data?.message || t("আপডেট ব্যর্থ হয়েছে", "Update failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const showOverlayLoading = loading || saving;

  return (
    <div className="w-full relative">
      {/* ✅ FULL SCREEN LOADING OVERLAY */}
      <Loading
        open={showOverlayLoading}
        text={
          loading
            ? t("প্রোফাইল লোড হচ্ছে…", "Loading profile…")
            : t("সেভ হচ্ছে…", "Saving…")
        }
      />

      <div className="bg-white rounded-xl border border-black/10 p-5 sm:p-6 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-black">
              {t("প্রোফাইল", "Profile")}
            </div>
            <div className="text-[12px] text-black/55 mt-1">
              {t(
                "আপনার অ্যাকাউন্ট তথ্য আপডেট করুন",
                "Update your account information",
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={loadMe}
            disabled={loading || saving}
            className="h-[40px] px-4 rounded-lg border border-black/20 text-[13px] font-bold text-black/70 hover:bg-black/5 transition disabled:opacity-50"
          >
            {loading
              ? t("লোড হচ্ছে...", "Loading...")
              : t("রিফ্রেশ", "Refresh")}
          </button>
        </div>

        <div className="mt-5 h-[1px] bg-black/10" />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="text-[13px] font-semibold text-black">
                {t("ইউজারনেম", "Username")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                placeholder={t("ইউজারনেম লিখুন", "Enter username")}
                disabled={loading || saving}
                {...register("username", {
                  required: t("ইউজারনেম আবশ্যক", "Username is required"),
                })}
              />
              {errors.username && (
                <div className="mt-1 text-[12px] text-red-600">
                  {errors.username.message}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-[13px] font-semibold text-black">
                {t("ফোন", "Phone")} <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                placeholder={t("01XXXXXXXXX", "01XXXXXXXXX")}
                disabled={loading || saving}
                {...register("phone", {
                  required: t("ফোন নম্বর আবশ্যক", "Phone is required"),
                  pattern: {
                    value: /^01[3-9]\d{8}$/,
                    message: t(
                      "সঠিক বাংলাদেশি ফোন নম্বর দিন",
                      "Invalid BD phone number",
                    ),
                  },
                })}
              />
              {errors.phone && (
                <div className="mt-1 text-[12px] text-red-600">
                  {errors.phone.message}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-[13px] font-semibold text-black">
                {t("ইমেইল", "Email")}
              </label>
              <input
                type="email"
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                placeholder={t("example@mail.com", "example@mail.com")}
                disabled={loading || saving}
                {...register("email")}
              />
            </div>

            {/* Currency */}
            <div>
              <label className="text-[13px] font-semibold text-black">
                {t("কারেন্সি", "Currency")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10 bg-white"
                disabled={loading || saving}
                {...register("currency", { required: true })}
              >
                <option value="BDT">{t("BDT", "BDT")}</option>
                <option value="USDT">{t("USDT", "USDT")}</option>
              </select>

              <div className="mt-1 text-[12px] text-black/55">
                {t("বর্তমান:", "Current:")}{" "}
                <span className="font-bold">{currency}</span>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="text-[13px] font-semibold text-black">
                {t("নামের প্রথম অংশ", "First Name")}
              </label>
              <input
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                placeholder={t("First name", "First name")}
                disabled={loading || saving}
                {...register("firstName")}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-[13px] font-semibold text-black">
                {t("নামের শেষ অংশ", "Last Name")}
              </label>
              <input
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                placeholder={t("Last name", "Last name")}
                disabled={loading || saving}
                {...register("lastName")}
              />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="text-[13px] font-semibold text-black">
                {t("পাসওয়ার্ড (ঐচ্ছিক)", "Password (optional)")}
              </label>
              <input
                type="password"
                className="mt-2 w-full h-[44px] rounded-lg border border-black/20 px-4 text-[14px] outline-none focus:ring-2 focus:ring-black/10"
                placeholder={t(
                  "পাসওয়ার্ড পরিবর্তন না করলে খালি রাখুন",
                  "Leave blank to keep current password",
                )}
                disabled={loading || saving}
                {...register("password", {
                  minLength: {
                    value: 6,
                    message: t(
                      "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
                      "Password must be at least 6 characters",
                    ),
                  },
                })}
              />
              {errors.password && (
                <div className="mt-1 text-[12px] text-red-600">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={saving || loading}
              className={`
                h-[46px] px-6 rounded-full font-extrabold text-[14px]
                transition shadow-[0_10px_22px_rgba(0,136,255,0.25)]
                ${
                  saving || loading
                    ? "bg-[#bcdcff] text-white/90 cursor-not-allowed"
                    : "bg-[#0088ff] text-white hover:brightness-95 active:scale-[0.99]"
                }
              `}
            >
              {saving
                ? t("সেভ হচ্ছে...", "Saving...")
                : t("প্রোফাইল আপডেট", "Update Profile")}
            </button>

            <div className="text-[12px] text-black/55">
              {t("লগইন:", "Logged in as:")}{" "}
              <span className="font-bold">
                {authUser?.username || t("ইউজার", "User")}
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
