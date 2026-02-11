// src/pages/FavIconAndLogoController/FavIconAndLogoController.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchBranding = async () => {
  const { data } = await api.get("/api/site-branding");
  return data;
};

const updateBranding = async (formData) => {
  const { data } = await api.put("/api/site-branding", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const FavIconAndLogoController = () => {
  const qc = useQueryClient();

  const [faviconPreview, setFaviconPreview] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-site-branding"],
    queryFn: fetchBranding,
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
      isActive: true,
      favicon: null,
      logo: null,
    },
  });

  useEffect(() => {
    if (!data) return;

    reset({
      titleBn: data.titleBn || "",
      titleEn: data.titleEn || "",
      isActive: data.isActive ?? true,
      favicon: null,
      logo: null,
    });

    setFaviconPreview(
      data.faviconUrl ? `${api.defaults.baseURL}${data.faviconUrl}` : "",
    );
    setLogoPreview(
      data.logoUrl ? `${api.defaults.baseURL}${data.logoUrl}` : "",
    );
  }, [data, reset]);

  // Live preview for newly selected files
  const faviconWatch = watch("favicon");
  const logoWatch = watch("logo");

  useEffect(() => {
    const file = faviconWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFaviconPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [faviconWatch]);

  useEffect(() => {
    const file = logoWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoWatch]);

  const mutation = useMutation({
    mutationFn: updateBranding,
    onSuccess: (res) => {
      toast.success(res?.message || "Site Branding Updated!");
      qc.invalidateQueries({ queryKey: ["admin-site-branding"] });
      qc.invalidateQueries({ queryKey: ["site-branding"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Update failed"),
  });

  const onSubmit = (values) => {
    const fd = new FormData();
    fd.append("titleBn", values.titleBn || "");
    fd.append("titleEn", values.titleEn || "");
    fd.append("isActive", String(values.isActive));

    const fav = values.favicon?.[0];
    const logo = values.logo?.[0];

    if (fav) fd.append("favicon", fav);
    if (logo) fd.append("logo", logo);

    mutation.mutate(fd);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border border-purple-800/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-purple-500/20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Favicon & Logo Controller
        </h2>
        <p className="text-cyan-200/80 text-sm mb-8">
          Update website title, favicon (16×16 or 32×32 .ico/.png) and main logo
        </p>

        {isLoading ? (
          <div className="text-cyan-300 text-center py-12 text-lg font-medium">
            Loading branding data...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Website Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Website Title (Bangla)
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="ওয়েবসাইটের নাম (বাংলা)"
                  {...register("titleBn")}
                />
              </div>

              <div>
                <label className="block text-cyan-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Website Title (English)
                </label>
                <input
                  className="w-full bg-slate-900/70 text-cyan-50 border border-purple-600/50 rounded-xl p-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder-purple-400"
                  placeholder="Website Title (English)"
                  {...register("titleEn")}
                />
              </div>
            </div>

            {/* Images - Favicon & Logo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              {/* Favicon */}
              <div className="space-y-4">
                <label className="block text-cyan-100 font-bold text-lg cursor-pointer">
                  Upload Favicon (.ico / .png recommended)
                </label>
                <input
                  type="file"
                  accept=".ico,image/png,image/x-icon"
                  className="block w-full text-sm text-cyan-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-800/70 file:text-white hover:file:bg-purple-700/90 file:cursor-pointer cursor-pointer bg-slate-900/60 border border-purple-600/50 rounded-xl p-4"
                  {...register("favicon")}
                />

                {faviconPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="bg-black/50 border border-purple-700/40 rounded-xl p-3 shadow-inner">
                      <img
                        src={faviconPreview}
                        alt="Favicon Preview"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <div className="text-cyan-300/80 text-sm">
                      Recommended size: 32×32 or 64×64 px
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-900/60 border border-purple-700/40 p-6 text-center text-cyan-300/70">
                    No favicon uploaded yet
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="space-y-4">
                <label className="block text-cyan-100 font-bold text-lg cursor-pointer">
                  Upload Main Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-cyan-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-800/70 file:text-white hover:file:bg-purple-700/90 file:cursor-pointer cursor-pointer bg-slate-900/60 border border-purple-600/50 rounded-xl p-4"
                  {...register("logo")}
                />

                {logoPreview ? (
                  <div className="rounded-xl overflow-hidden border-2 border-purple-700/50 bg-black/50 shadow-inner">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-40 sm:h-48 lg:h-56 object-contain mx-auto p-4"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-900/60 border border-purple-700/40 p-8 text-center text-cyan-300/70">
                    No logo uploaded yet
                  </div>
                )}
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3 cursor-pointer pt-2">
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
                Active (Apply on Client Site)
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-4 px-10 mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-600/40 transition-all duration-300 disabled:opacity-60 cursor-pointer border border-purple-500/30"
            >
              {mutation.isPending ? "Saving..." : "Save Favicon & Logo"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FavIconAndLogoController;
