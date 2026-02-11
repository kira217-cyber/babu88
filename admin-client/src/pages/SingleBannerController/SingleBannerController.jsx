// src/pages/SingleBannerController/SingleBannerController.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchSingleBanner = async () => {
  const { data } = await api.get("/api/single-banner");
  return data;
};

const updateSingleBanner = async (formData) => {
  const { data } = await api.put("/api/single-banner", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const SingleBannerController = () => {
  const qc = useQueryClient();
  const [preview, setPreview] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-single-banner"],
    queryFn: fetchSingleBanner,
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
      clickLink: "",
      openInNewTab: false,
      isActive: true,
      bannerImg: null,
    },
  });

  useEffect(() => {
    if (!data) return;

    reset({
      clickLink: data.clickLink || "",
      openInNewTab: data.openInNewTab ?? false,
      isActive: data.isActive ?? true,
      bannerImg: null,
    });

    setPreview(
      data.bannerUrl ? `${api.defaults.baseURL}${data.bannerUrl}` : "",
    );
  }, [data, reset]);

  // Live preview for newly selected file
  const imgWatch = watch("bannerImg");
  useEffect(() => {
    const file = imgWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imgWatch]);

  const mutation = useMutation({
    mutationFn: updateSingleBanner,
    onSuccess: (res) => {
      toast.success(res?.message || "Single Banner Updated!");
      qc.invalidateQueries({ queryKey: ["admin-single-banner"] });
      qc.invalidateQueries({ queryKey: ["single-banner"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Update failed"),
  });

  const onSubmit = (values) => {
    const fd = new FormData();
    fd.append("clickLink", values.clickLink || "");
    fd.append("openInNewTab", String(values.openInNewTab));
    fd.append("isActive", String(values.isActive));

    const img = values.bannerImg?.[0];
    if (img) fd.append("bannerImg", img);

    mutation.mutate(fd);
  };

  const hint = useMemo(
    () => `Example: /register  অথবা  https://example.com`,
    [],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-yellow-900/30">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Single Banner Controller
        </h2>
        <p className="text-yellow-200/80 text-sm mb-8">{hint}</p>

        {isLoading ? (
          <div className="text-yellow-300 text-center py-12 text-lg font-medium">
            Loading banner data...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Banner Image Upload + Preview */}
            <div className="space-y-4">
              <label className="block text-yellow-100 font-bold text-lg cursor-pointer">
                Upload Banner Image
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:cursor-pointer cursor-pointer bg-black/70 border border-yellow-700/50 rounded-xl p-4"
                {...register("bannerImg")}
              />

              {preview ? (
                <div className="rounded-xl overflow-hidden border-2 border-yellow-700/50 bg-black/50 shadow-inner">
                  <img
                    src={preview}
                    alt="Banner Preview"
                    className="w-full h-64 sm:h-72 lg:h-80 object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-black/60 border border-yellow-700/40 p-8 text-center text-yellow-300/70">
                  No banner image selected
                </div>
              )}
            </div>

            {/* Click Link */}
            <div>
              <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                Click Link (optional - where to go when clicked)
              </label>
              <input
                className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                placeholder="/register  অথবা  https://example.com"
                {...register("clickLink")}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <div className="flex items-center gap-3 cursor-pointer">
                <input
                  id="openInNewTab"
                  type="checkbox"
                  className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
                  {...register("openInNewTab")}
                />
                <label
                  htmlFor="openInNewTab"
                  className="text-yellow-100 font-semibold cursor-pointer"
                >
                  Open in New Tab
                </label>
              </div>

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
                  Active (Show on Client Site)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-4 px-10 mt-8 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl text-black font-bold text-lg shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all duration-300 disabled:opacity-60 cursor-pointer border border-yellow-500/30"
            >
              {mutation.isPending ? "Saving..." : "Save Single Banner"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SingleBannerController;
