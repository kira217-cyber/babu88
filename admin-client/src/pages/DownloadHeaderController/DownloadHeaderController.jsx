// src/pages/DownloadHeaderController/DownloadHeaderController.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchDownloadHeader = async () => {
  const { data } = await api.get("/api/download-header");
  return data;
};

const updateDownloadHeader = async (formData) => {
  const { data } = await api.put("/api/download-header", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const DownloadHeaderController = () => {
  const qc = useQueryClient();

  const [iconPreview, setIconPreview] = useState("");
  const [apkName, setApkName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-download-header"],
    queryFn: fetchDownloadHeader,
    staleTime: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      isActive: true,
      appNameBn: "",
      appNameEn: "",
      titleBn: "",
      titleEn: "",
      btnTextBn: "ডাউনলোড",
      btnTextEn: "Download",
      icon: null,
      apk: null,
    },
  });

  useEffect(() => {
    if (!data) return;

    reset({
      isActive: data.isActive ?? true,
      appNameBn: data.appNameBn || "BABU88",
      appNameEn: data.appNameEn || "BABU88",
      titleBn: data.titleBn || "",
      titleEn: data.titleEn || "",
      btnTextBn: data.btnTextBn || "ডাউনলোড",
      btnTextEn: data.btnTextEn || "Download",
      icon: null,
      apk: null,
    });

    setIconPreview(
      data.iconUrl ? `${api.defaults.baseURL}${data.iconUrl}` : "",
    );
    setApkName(data.apkUrl ? "APK uploaded" : "");
  }, [data, reset]);

  const iconWatch = watch("icon");
  const apkWatch = watch("apk");

  useEffect(() => {
    const file = iconWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [iconWatch]);

  useEffect(() => {
    const file = apkWatch?.[0];
    if (file) {
      setApkName(file.name);
    }
  }, [apkWatch]);

  const mutation = useMutation({
    mutationFn: updateDownloadHeader,
    onSuccess: (res) => {
      toast.success(res?.message || "Download Header Updated!");
      qc.invalidateQueries({ queryKey: ["admin-download-header"] });
      qc.invalidateQueries({ queryKey: ["download-header"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Update failed"),
  });

  const onSubmit = (values) => {
    const fd = new FormData();

    fd.append("isActive", String(values.isActive));
    fd.append("appNameBn", values.appNameBn || "");
    fd.append("appNameEn", values.appNameEn || "");
    fd.append("titleBn", values.titleBn || "");
    fd.append("titleEn", values.titleEn || "");
    fd.append("btnTextBn", values.btnTextBn || "");
    fd.append("btnTextEn", values.btnTextEn || "");

    const icon = values.icon?.[0];
    const apk = values.apk?.[0];

    if (icon) fd.append("icon", icon);
    if (apk) fd.append("apk", apk);

    mutation.mutate(fd);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-yellow-900/30">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Download Header Controller
        </h2>
        <p className="text-yellow-200/80 text-sm mb-8">
          Customize the floating download header (app name, title, button, icon
          & APK)
        </p>

        {isLoading ? (
          <div className="text-yellow-300 text-center py-12 text-lg font-medium">
            Loading download header data...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Active Toggle */}
            <div className="flex items-center gap-3 cursor-pointer">
              <input
                id="isActive"
                type="checkbox"
                className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
                {...register("isActive")}
              />
              <label
                htmlFor="isActive"
                className="text-yellow-100 font-semibold cursor-pointer"
              >
                Active (Show Download Header on Client)
              </label>
            </div>

            {/* App Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  App Name (Bangla)
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="অ্যাপের নাম (বাংলা)"
                  {...register("appNameBn")}
                />
              </div>
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  App Name (English)
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="App Name (English)"
                  {...register("appNameEn")}
                />
              </div>
            </div>

            {/* Custom Title (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Custom Title (Bangla) — optional
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="খালি রাখলে ডিফল্ট টেমপ্লেট ব্যবহার হবে"
                  {...register("titleBn")}
                />
              </div>
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Custom Title (English) — optional
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="Leave empty for default template"
                  {...register("titleEn")}
                />
              </div>
            </div>

            {/* Button Texts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Text (Bangla)
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="ডাউনলোড"
                  {...register("btnTextBn")}
                />
              </div>
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Text (English)
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="Download"
                  {...register("btnTextEn")}
                />
              </div>
            </div>

            {/* Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              {/* Icon */}
              <div className="space-y-4">
                <label className="block text-yellow-100 font-bold text-lg cursor-pointer">
                  App Icon Image
                </label>
                <input
                  type="file"
                  accept="image/*,.ico,.gif"
                  className="block w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:cursor-pointer cursor-pointer bg-black/70 border border-yellow-700/50 rounded-xl p-4"
                  {...register("icon")}
                />

                {iconPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="bg-black/50 border border-yellow-700/40 rounded-xl p-3 shadow-inner">
                      <img
                        src={iconPreview}
                        alt="App Icon Preview"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <div className="text-yellow-300/80 text-sm">
                      Recommended: 512×512 px PNG
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-black/60 border border-yellow-700/40 p-6 text-center text-yellow-300/70">
                    No icon uploaded
                  </div>
                )}
              </div>

              {/* APK */}
              <div className="space-y-4">
                <label className="block text-yellow-100 font-bold text-lg cursor-pointer">
                  Upload APK File (.apk)
                </label>
                <input
                  type="file"
                  accept=".apk"
                  className="block w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:cursor-pointer cursor-pointer bg-black/70 border border-yellow-700/50 rounded-xl p-4"
                  {...register("apk")}
                />

                <div className="mt-3 text-yellow-200/80 text-sm">
                  {apkName ? (
                    <span className="font-medium text-yellow-300">
                      Selected: {apkName}
                    </span>
                  ) : (
                    "No APK file selected"
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-4 px-10 mt-10 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl text-black font-bold text-lg shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all duration-300 disabled:opacity-60 cursor-pointer border border-yellow-500/30"
            >
              {mutation.isPending ? "Saving..." : "Save Download Header"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DownloadHeaderController;
