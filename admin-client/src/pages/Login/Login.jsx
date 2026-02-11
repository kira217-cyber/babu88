import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import { adminLogin } from "../../features/auth/authAPI";
import { setCredentials } from "../../features/auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      if (!data?.token || !data?.admin?.email) {
        toast.error("Login response invalid");
        return;
      }

      dispatch(setCredentials({ admin: data.admin, token: data.token }));
      toast.success("✅ Admin Login Success");
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    },
  });

  const onSubmit = (formData) => {
    mutate({
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-yellow-950/20 to-black">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-gradient-to-b from-black via-yellow-950/30 to-black 
                   border border-yellow-700/40 rounded-2xl shadow-2xl shadow-yellow-900/30 p-8 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/50">
            <FaUserShield className="text-3xl text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Admin Login
          </h2>
          {/* <p className="text-sm text-yellow-200/80 mt-2">
            শুধুমাত্র Admin email + password দিয়ে লগইন করুন
          </p> */}
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
              placeholder="email@example.com"
              type="email"
              {...register("email", {
                required: "Email লাগবে",
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Password
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-5 py-3.5 
                         text-white placeholder-yellow-400/60 outline-none 
                         focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 
                         transition-all duration-300 pr-12 cursor-text"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password লাগবে",
                minLength: { value: 6, message: "কমপক্ষে 6 অক্ষর" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[2.8rem] text-yellow-300 hover:text-yellow-100 
                         transition-colors duration-200 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: isPending ? 1 : 1.04 }}
            whileTap={{ scale: isPending ? 1 : 0.96 }}
            disabled={isPending}
            type="submit"
            className="w-full flex items-center justify-center gap-3 
                       bg-gradient-to-r from-yellow-500 to-amber-500 
                       hover:from-yellow-400 hover:to-amber-400 
                       text-black font-semibold py-3.5 rounded-xl 
                       shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 
                       transition-all duration-300 cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <FaUserShield className="text-lg text-black" />
            {isPending ? "Logging in..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;