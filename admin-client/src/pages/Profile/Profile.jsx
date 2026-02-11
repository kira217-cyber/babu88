import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "../../api/axios";
import { logout } from "../../features/auth/authSlice";

const fetchProfile = async () => {
  const { data } = await api.get("/api/admin/profile");
  return data; // {success, admin:{id,email}}
};

const updateProfile = async (payload) => {
  const { data } = await api.put("/api/admin/profile", payload);
  return data;
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  // Load email from DB
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchProfile,
    retry: 1,
  });

  useEffect(() => {
    if (data?.admin?.email) {
      reset({
        email: data.admin.email,
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [data, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success(data?.message || "Profile updated");
      dispatch(logout());
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Update failed";
      toast.error(msg);
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      email: formData.email?.trim(),
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword || "",
    };
    mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    const msg = error?.response?.data?.message || "Failed to load profile";
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-b from-black via-yellow-950/30 to-black 
                     border border-yellow-700/40 rounded-2xl p-8 text-center shadow-xl shadow-yellow-900/30 backdrop-blur-sm"
        >
          <p className="text-red-400 text-lg font-medium">{msg}</p>
          <p className="text-yellow-200/80 mt-3 text-sm">
            Please try again later or contact support
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-br from-black via-yellow-950/20 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-gradient-to-b from-black via-yellow-950/30 to-black 
                   border border-yellow-700/40 rounded-2xl shadow-2xl shadow-yellow-900/40 p-8 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Admin Profile
          </h2>
          <p className="text-sm text-yellow-200/80 mt-2 text-center">
            Changing email or password will require you to log in again
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Email
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-5 py-3.5 
                         text-white placeholder-yellow-400/60 outline-none 
                         focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 
                         transition-all duration-300 cursor-text"
              type="email"
              placeholder="admin@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Current Password */}
          <div className="relative">
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Current Password
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-5 py-3.5 
                         text-white placeholder-yellow-400/60 outline-none 
                         focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 
                         transition-all duration-300 pr-12 cursor-text"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current password"
              {...register("currentPassword", {
                required: "Current password is required to make changes",
              })}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-[2.8rem] text-yellow-300 hover:text-yellow-100 
                         transition-colors duration-200 cursor-pointer"
            >
              {showCurrentPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}
            </button>
            {errors.currentPassword && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password (Optional) */}
          <div className="relative">
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              New Password (Optional)
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-5 py-3.5 
                         text-white placeholder-yellow-400/60 outline-none 
                         focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 
                         transition-all duration-300 pr-12 cursor-text"
              type={showNewPassword ? "text" : "password"}
              placeholder="New password (leave blank to keep current)"
              {...register("newPassword", {
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-[2.8rem] text-yellow-300 hover:text-yellow-100 
                         transition-colors duration-200 cursor-pointer"
            >
              {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.newPassword && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isPending ? 1 : 1.04 }}
            whileTap={{ scale: isPending ? 1 : 0.96 }}
            disabled={isPending}
            type="submit"
            className="w-full flex items-center justify-center gap-2 
                       bg-gradient-to-r from-yellow-500 to-amber-500 
                       hover:from-yellow-400 hover:to-amber-400 
                       text-black font-semibold py-3.5 rounded-xl 
                       shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 
                       transition-all duration-300 cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isPending ? "Updating..." : "Update Profile"}
          </motion.button>

          <div className="text-xs text-yellow-200/70 text-center mt-2">
            ✅ After successful update you will be automatically logged out
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;