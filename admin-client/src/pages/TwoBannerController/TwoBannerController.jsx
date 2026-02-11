// src/pages/TwoBannerController/TwoBannerController.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchTwoBanner = async () => {
  const { data } = await api.get("/api/two-banner");
  return data;
};

const updateTwoBanner = async (formData) => {
  const { data } = await api.put("/api/two-banner", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const TwoBannerController = () => {
  const qc = useQueryClient();

  const [leftPreview, setLeftPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-two-banner"],
    queryFn: fetchTwoBanner,
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
      titleBn: "",
      titleEn: "",
      descriptionBn: "",
      descriptionEn: "",
      buttonTextBn: "",
      buttonTextEn: "",
      buttonLink: "/refer",
      openInNewTab: true,
      isActive: true,
      leftBanner: null,
      rightBanner: null,
    },
  });

  useEffect(() => {
    if (!data) return;

    reset({
      titleBn: data.titleBn || "",
      titleEn: data.titleEn || "",
      descriptionBn: data.descriptionBn || "",
      descriptionEn: data.descriptionEn || "",
      buttonTextBn: data.buttonTextBn || "",
      buttonTextEn: data.buttonTextEn || "",
      buttonLink: data.buttonLink || "/refer",
      openInNewTab: data.openInNewTab ?? true,
      isActive: data.isActive ?? true,
      leftBanner: null,
      rightBanner: null,
    });

    setLeftPreview(
      data.leftBannerUrl ? `${api.defaults.baseURL}${data.leftBannerUrl}` : "",
    );
    setRightPreview(
      data.rightBannerUrl
        ? `${api.defaults.baseURL}${data.rightBannerUrl}`
        : "",
    );
  }, [data, reset]);

  // Live preview for newly selected files
  const leftWatch = watch("leftBanner");
  const rightWatch = watch("rightBanner");

  useEffect(() => {
    const file = leftWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLeftPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [leftWatch]);

  useEffect(() => {
    const file = rightWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRightPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [rightWatch]);

  const mutation = useMutation({
    mutationFn: updateTwoBanner,
    onSuccess: (res) => {
      toast.success(res?.message || "Two Banner Updated!");
      qc.invalidateQueries({ queryKey: ["admin-two-banner"] });
      qc.invalidateQueries({ queryKey: ["two-banner"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Update failed"),
  });

  const onSubmit = (values) => {
    const fd = new FormData();

    fd.append("titleBn", values.titleBn || "");
    fd.append("titleEn", values.titleEn || "");
    fd.append("descriptionBn", values.descriptionBn || "");
    fd.append("descriptionEn", values.descriptionEn || "");
    fd.append("buttonTextBn", values.buttonTextBn || "");
    fd.append("buttonTextEn", values.buttonTextEn || "");
    fd.append("buttonLink", values.buttonLink || "/refer");
    fd.append("openInNewTab", String(values.openInNewTab));
    fd.append("isActive", String(values.isActive));

    const left = values.leftBanner?.[0];
    const right = values.rightBanner?.[0];

    if (left) fd.append("leftBanner", left);
    if (right) fd.append("rightBanner", right);

    mutation.mutate(fd);
  };

  const exampleHint = useMemo(
    () => `Example: /refer  অথবা  https://google.com`,
    [],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border border-purple-800/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-purple-500/20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Two Banner Controller
        </h2>
        <p className="text-cyan-200/80 text-sm mb-8">{exampleHint}</p>

        {isLoading ? (
          <div className="text-cyan-300 text-center py-12 text-lg font-medium">
            Loading banner data...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Title (Bangla)
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="বাম/ডান ব্যানারের টাইটেল (বাংলা)"
                  {...register("titleBn")}
                />
              </div>
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Title (English)
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="Banner Title (English)"
                  {...register("titleEn")}
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Description (Bangla)
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400 resize-y"
                  placeholder="বিস্তারিত বর্ণনা (বাংলা)"
                  {...register("descriptionBn")}
                />
              </div>
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Description (English)
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400 resize-y"
                  placeholder="Detailed description (English)"
                  {...register("descriptionEn")}
                />
              </div>
            </div>

            {/* Button Texts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Text (Bangla)
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="বাটনের টেক্সট (বাংলা)"
                  {...register("buttonTextBn")}
                />
              </div>
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Text (English)
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="Button Text (English)"
                  {...register("buttonTextEn")}
                />
              </div>
            </div>

            {/* Link & Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Link
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="/refer  অথবা  https://example.com"
                  {...register("buttonLink")}
                />
              </div>

              <div className="flex flex-col justify-center gap-5 pt-2">
                <div className="flex items-center gap-3 cursor-pointer">
                  <input
                    id="openInNewTab"
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                    {...register("openInNewTab")}
                  />
                  <label
                    htmlFor="openInNewTab"
                    className="text-cyan-100 font-semibold cursor-pointer"
                  >
                    Open in New Tab
                  </label>
                </div>

                <div className="flex items-center gap-3 cursor-pointer">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                    {...register("isActive")}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-cyan-100 font-semibold cursor-pointer"
                  >
                    Active (Show on Client)
                  </label>
                </div>
              </div>
            </div>

            {/* Images - Left & Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              {/* Left Banner */}
              <div className="space-y-4">
                <label className="block text-cyan-100 font-bold text-lg cursor-pointer">
                  Left Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-cyan-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-800/70 file:text-white hover:file:bg-purple-700/90 file:cursor-pointer cursor-pointer bg-slate-900/60 border border-purple-600/50 rounded-xl p-4"
                  {...register("leftBanner")}
                />
                {leftPreview && (
                  <div className="rounded-xl overflow-hidden border-2 border-purple-700/50 bg-black/50 shadow-inner">
                    <img
                      src={leftPreview}
                      alt="Left Banner Preview"
                      className="w-full h-56 sm:h-64 lg:h-72 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Right Banner */}
              <div className="space-y-4">
                <label className="block text-cyan-100 font-bold text-lg cursor-pointer">
                  Right Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-cyan-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-800/70 file:text-white hover:file:bg-purple-700/90 file:cursor-pointer cursor-pointer bg-slate-900/60 border border-purple-600/50 rounded-xl p-4"
                  {...register("rightBanner")}
                />
                {rightPreview && (
                  <div className="rounded-xl overflow-hidden border-2 border-purple-700/50 bg-black/50 shadow-inner">
                    <img
                      src={rightPreview}
                      alt="Right Banner Preview"
                      className="w-full h-56 sm:h-64 lg:h-72 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-4 px-8 mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-600/40 transition-all duration-300 disabled:opacity-60 cursor-pointer border border-purple-500/30"
            >
              {mutation.isPending ? "Saving..." : "Save Two Banner Settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoBannerController;
