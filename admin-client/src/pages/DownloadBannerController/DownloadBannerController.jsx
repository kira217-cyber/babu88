// src/pages/DownloadBannerController/DownloadBannerController.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchDownloadBanner = async () => {
  const { data } = await api.get("/api/download-banner");
  return data;
};

const updateDownloadBanner = async (formData) => {
  const { data } = await api.put("/api/download-banner", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const DownloadBannerController = () => {
  const qc = useQueryClient();
  const [apkName, setApkName] = useState("");
  const [imgPreview, setImgPreview] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["download-banner"],
    queryFn: fetchDownloadBanner,
    staleTime: 1000 * 60 * 5,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      titleBn: "",
      titleEn: "",
      subBn: "",
      subEn: "",
      btnDownloadBn: "",
      btnDownloadEn: "",
      btnAndroidBn: "",
      btnAndroidEn: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        titleBn: data.titleBn || "",
        titleEn: data.titleEn || "",
        subBn: data.subBn || "",
        subEn: data.subEn || "",
        btnDownloadBn: data.btnDownloadBn || "",
        btnDownloadEn: data.btnDownloadEn || "",
        btnAndroidBn: data.btnAndroidBn || "",
        btnAndroidEn: data.btnAndroidEn || "",
        isActive: data.isActive ?? true,
      });

      setImgPreview(
        data.rightImageUrl
          ? `${api.defaults.baseURL}${data.rightImageUrl}`
          : "",
      );
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: updateDownloadBanner,
    onSuccess: (res) => {
      toast.success(res?.message || "Download Banner Updated!");
      qc.invalidateQueries({ queryKey: ["download-banner"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Update failed");
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();

    // Append text fields
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "apkFile" && key !== "rightImage") {
        formData.append(key, String(value));
      }
    });

    // Append files if selected
    const apkFile = values.apkFile?.[0];
    const rightImage = values.rightImage?.[0];

    if (apkFile) formData.append("apkFile", apkFile);
    if (rightImage) formData.append("rightImage", rightImage);

    mutation.mutate(formData);
  };

  // Watch for file previews
  const rightImageWatch = watch("rightImage");
  useEffect(() => {
    const file = rightImageWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImgPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [rightImageWatch]);

  const apkWatch = watch("apkFile");
  useEffect(() => {
    const file = apkWatch?.[0];
    setApkName(file ? file.name : "");
  }, [apkWatch]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-cyan-100 font-bold">
          Loading download banner...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-pink-500 font-bold">
          Failed to load download banner
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border border-purple-800/40 rounded-xl p-5 sm:p-7 lg:p-9 shadow-lg shadow-purple-500/20">
        <h2 className="text-white font-extrabold text-xl sm:text-2xl lg:text-3xl mb-6 sm:mb-8 tracking-tight">
          Download Banner Controller
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8"
        >
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                Title (Bangla)
              </label>
              <textarea
                rows={3}
                className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300 resize-y min-h-[90px]"
                placeholder="ডাউনলোড ব্যানারের টাইটেল (বাংলা)"
                {...register("titleBn")}
              />
            </div>
            <div>
              <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                Title (English)
              </label>
              <textarea
                rows={3}
                className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300 resize-y min-h-[90px]"
                placeholder="Download Banner Title (English)"
                {...register("titleEn")}
              />
            </div>
          </div>

          {/* Subtitles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                Subtitle (Bangla)
              </label>
              <input
                className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300"
                placeholder="সাবটাইটেল (বাংলা)"
                {...register("subBn")}
              />
            </div>
            <div>
              <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                Subtitle (English)
              </label>
              <input
                className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300"
                placeholder="Subtitle (English)"
                {...register("subEn")}
              />
            </div>
          </div>

          {/* Button Texts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                  Download Button (Bangla)
                </label>
                <input
                  className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300"
                  placeholder="ডাউনলোড বাটন টেক্সট"
                  {...register("btnDownloadBn")}
                />
              </div>
              <div>
                <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                  Android Button (Bangla)
                </label>
                <input
                  className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300"
                  placeholder="অ্যান্ড্রয়েড বাটন টেক্সট"
                  {...register("btnAndroidBn")}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                  Download Button (English)
                </label>
                <input
                  className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300"
                  placeholder="Download Button Text"
                  {...register("btnDownloadEn")}
                />
              </div>
              <div>
                <label className="block text-cyan-100/80 text-sm font-bold mb-2 cursor-pointer">
                  Android Button (English)
                </label>
                <input
                  className="w-full bg-slate-900/60 text-cyan-100 border border-purple-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-purple-300"
                  placeholder="Android Button Text"
                  {...register("btnAndroidEn")}
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* APK Upload */}
            <div className="bg-slate-900/40 border border-purple-700/40 rounded-xl p-5 sm:p-6">
              <label className="block text-cyan-100 font-bold mb-3 cursor-pointer">
                Upload APK File (.apk)
              </label>
              <input
                type="file"
                accept=".apk"
                className="w-full text-cyan-100/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-700/60 file:text-cyan-100 hover:file:bg-purple-600/70 file:cursor-pointer cursor-pointer"
                {...register("apkFile")}
              />
              <div className="mt-3 text-sm text-cyan-200/70">
                {apkName
                  ? `Selected: ${apkName}`
                  : data?.apkUrl
                    ? `Current APK: ${data.apkUrl.split("/").pop()}`
                    : "No APK file selected"}
              </div>
            </div>

            {/* Right Image Upload */}
            <div className="bg-slate-900/40 border border-purple-700/40 rounded-xl p-5 sm:p-6">
              <label className="block text-cyan-100 font-bold mb-3 cursor-pointer">
                Upload Right Side Image
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-cyan-100/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-700/60 file:text-cyan-100 hover:file:bg-purple-600/70 file:cursor-pointer cursor-pointer"
                {...register("rightImage")}
              />

              {imgPreview ? (
                <div className="mt-4 rounded-lg overflow-hidden bg-black/30 border border-purple-700/30">
                  <img
                    src={imgPreview}
                    alt="Right banner preview"
                    className="w-full max-h-[260px] object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="mt-4 text-center text-cyan-200/60 text-sm py-6">
                  No preview available
                </div>
              )}
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              className="w-5 h-5 accent-cyan-500 rounded focus:ring-cyan-500/30 cursor-pointer"
              {...register("isActive")}
            />
            <label
              htmlFor="isActive"
              className="text-cyan-100 font-bold cursor-pointer"
            >
              Active (Show on Client Site)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-medium text-lg transition-all duration-300 shadow-lg shadow-purple-500/40 border border-purple-500/30 disabled:opacity-60 cursor-pointer"
          >
            {mutation.isPending ? "Saving..." : "Save Download Banner"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DownloadBannerController;
