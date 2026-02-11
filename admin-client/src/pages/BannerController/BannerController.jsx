// src/pages/BannerController/BannerController.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchAllBanners = async () => {
  const { data } = await api.get("/api/banner-videos");
  return data;
};

const createBanner = async (formData) => {
  const { data } = await api.post("/api/banner-videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updateBanner = async ({ id, formData }) => {
  const { data } = await api.put(`/api/banner-videos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const deleteBanner = async (id) => {
  const { data } = await api.delete(`/api/banner-videos/${id}`);
  return data;
};

const BannerController = () => {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banner-videos"],
    queryFn: fetchAllBanners,
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
      youtube: "",
      isActive: true,
      order: 0,
      bannerImg: null,
    },
  });

  const bannerImgWatch = watch("bannerImg");
  useEffect(() => {
    const file = bannerImgWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [bannerImgWatch]);

  const createMut = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      toast.success("Banner Created!");
      reset();
      setEditingId(null);
      setPreview("");
      qc.invalidateQueries({ queryKey: ["admin-banner-videos"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Creation failed"),
  });

  const updateMut = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      toast.success("Banner Updated!");
      reset();
      setEditingId(null);
      setPreview("");
      qc.invalidateQueries({ queryKey: ["admin-banner-videos"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success("Banner Deleted!");
      qc.invalidateQueries({ queryKey: ["admin-banner-videos"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const onSubmit = (values) => {
    const fd = new FormData();
    fd.append("titleBn", values.titleBn || "");
    fd.append("titleEn", values.titleEn || "");
    fd.append("youtube", values.youtube || "");
    fd.append("isActive", String(values.isActive));
    fd.append("order", String(values.order || 0));

    const img = values.bannerImg?.[0];
    if (!editingId && !img) {
      toast.error("Please select a banner image");
      return;
    }
    if (img) fd.append("bannerImg", img);

    if (editingId) {
      updateMut.mutate({ id: editingId, formData: fd });
    } else {
      createMut.mutate(fd);
    }
  };

  const startEdit = (banner) => {
    setEditingId(banner._id);
    reset({
      titleBn: banner.titleBn || "",
      titleEn: banner.titleEn || "",
      youtube: banner.youtube || "",
      isActive: banner.isActive ?? true,
      order: banner.order ?? 0,
      bannerImg: null,
    });
    setPreview(
      banner.bannerImg ? `${api.defaults.baseURL}${banner.bannerImg}` : "",
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({
      titleBn: "",
      titleEn: "",
      youtube: "",
      isActive: true,
      order: 0,
      bannerImg: null,
    });
    setPreview("");
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&mute=1&controls=1&rel=0`
      : null;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-yellow-950/10 to-black">
      <div className="max-w-7xl mx-auto space-y-10 lg:space-y-12">
        {/* FORM SECTION */}
        <div className="bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-yellow-900/30">
          <h2 className="text-white font-extrabold text-2xl sm:text-3xl lg:text-4xl mb-7 tracking-tight">
            {editingId ? "Edit Banner" : "Create New Banner"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Title (Bangla)
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="ব্যানারের টাইটেল (বাংলা)"
                  {...register("titleBn")}
                />
              </div>
              <div>
                <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Title (English)
                </label>
                <input
                  className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                  placeholder="Banner Title (English)"
                  {...register("titleEn")}
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                YouTube Video URL (optional)
              </label>
              <input
                className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                placeholder="https://www.youtube.com/watch?v=..."
                {...register("youtube")}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <div className="space-y-4">
                <label className="block text-yellow-100 font-bold text-lg cursor-pointer">
                  Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:cursor-pointer cursor-pointer bg-black/70 border border-yellow-700/50 rounded-xl p-4"
                  {...register("bannerImg")}
                />

                {preview && (
                  <div className="rounded-xl overflow-hidden border-2 border-yellow-700/50 bg-black/50 shadow-inner">
                    <img
                      src={preview}
                      alt="Banner Preview"
                      className="w-full h-52 sm:h-64 lg:h-72 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all"
                    {...register("order")}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="w-5 h-5 accent-yellow-500 cursor-pointer"
                    {...register("isActive")}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-yellow-100 font-semibold cursor-pointer"
                  >
                    Active (Visible on client site)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || createMut.isPending || updateMut.isPending
                    }
                    className="flex-1 py-4 px-8 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl text-black font-bold shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all disabled:opacity-60 cursor-pointer text-lg"
                  >
                    {editingId
                      ? updateMut.isPending
                        ? "Updating..."
                        : "Update Banner"
                      : createMut.isPending
                        ? "Creating..."
                        : "Create Banner"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 py-4 px-8 bg-black/70 hover:bg-black/90 text-yellow-200 font-bold rounded-xl border border-yellow-700/50 transition-all cursor-pointer text-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ===================== BANNERS LIST ===================== */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            All Banners and Videos
          </h2>

          {isLoading ? (
            <div className="text-yellow-300 text-center py-16 text-xl font-medium">
              Loading banners...
            </div>
          ) : banners.length === 0 ? (
            <div className="text-yellow-400/80 text-center py-16 text-xl bg-black/50 rounded-2xl border border-yellow-700/30">
              No banners found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {banners.map((banner) => {
                const embedUrl = getYouTubeEmbedUrl(banner.youtube);

                return (
                  <div
                    key={banner._id}
                    className="bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl overflow-hidden shadow-xl shadow-yellow-900/30 hover:shadow-yellow-900/50 transition-all duration-300 flex flex-col"
                  >
                    {/* Banner Image - ALWAYS ON TOP */}
                    <div className="w-full h-56 sm:h-64 lg:h-72 bg-black relative">
                      <img
                        src={`${api.defaults.baseURL}${banner.bannerImg}`}
                        alt={banner.titleEn || "Banner Image"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Title & Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-white font-bold text-xl mb-3 line-clamp-2">
                        {banner.titleEn || banner.titleBn || "No Title"}
                      </h3>

                      {banner.titleBn && banner.titleEn !== banner.titleBn && (
                        <p className="text-yellow-300/90 text-base mb-4 line-clamp-2">
                          {banner.titleBn}
                        </p>
                      )}

                      {/* YouTube Video - BELOW TITLE if exists */}
                      {embedUrl && (
                        <div className="mb-5 rounded-xl overflow-hidden border border-yellow-700/40 bg-black shadow-inner">
                          <div className="aspect-video">
                            <iframe
                              src={embedUrl}
                              title={banner.titleEn || "YouTube preview"}
                              allow="accelerometer; autoplay=0; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Info */}
                      <div className="mt-auto space-y-3 text-sm">
                        <div className="flex justify-between items-center text-yellow-200/90">
                          <span className="font-medium">Order</span>
                          <span className="font-bold text-lg">
                            {banner.order ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-yellow-200/90">
                          <span className="font-medium">Status</span>
                          <span
                            className={`font-bold text-base px-4 py-1.5 rounded-full ${
                              banner.isActive
                                ? "bg-yellow-900/70 text-yellow-300"
                                : "bg-rose-900/70 text-rose-300"
                            }`}
                          >
                            {banner.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {banner.youtube && !embedUrl && (
                          <div className="text-yellow-300/70 text-xs truncate pt-2 border-t border-yellow-800/30">
                            YouTube Linked:{" "}
                            {banner.youtube.substring(0, 30) + "..."}
                          </div>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4 mt-6 pt-5 border-t border-yellow-800/30">
                        <button
                          onClick={() => startEdit(banner)}
                          className="flex-1 py-3 bg-yellow-700/60 hover:bg-yellow-600/70 text-black font-medium rounded-xl transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this banner?",
                              )
                            ) {
                              deleteMut.mutate(banner._id);
                            }
                          }}
                          disabled={deleteMut.isPending}
                          className="flex-1 py-3 bg-red-900/60 hover:bg-red-800/70 text-red-200 font-medium rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {deleteMut.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerController;
