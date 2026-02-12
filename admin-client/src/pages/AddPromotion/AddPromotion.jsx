// src/pages/AddPromotion.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddPromotion = () => {
  const categories = useMemo(
    () => [
      { key: "cricket", label: "Cricket" },
      { key: "fast", label: "Fast" },
      { key: "sports", label: "Sports" },
      { key: "livecasino", label: "Live Casino" },
      { key: "slots", label: "Slots" },
      { key: "table", label: "Table Games" },
      { key: "vip", label: "VIP" },
      { key: "crash", label: "Crash" },
      { key: "tournament", label: "Tournament" },
    ],
    []
  );

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // form states
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState("cricket");
  const [titleBn, setTitleBn] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [shortDescBn, setShortDescBn] = useState("");
  const [shortDescEn, setShortDescEn] = useState("");
  const [detailsBn, setDetailsBn] = useState("");
  const [detailsEn, setDetailsEn] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);

  // delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/promotions");
      setList(data?.promotions || []);
    } catch (e) {
      setList([]);
      toast.error(e?.response?.data?.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Live preview for selected image
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const resetForm = () => {
    setEditingId(null);
    setCategory("cricket");
    setTitleBn("");
    setTitleEn("");
    setShortDescBn("");
    setShortDescEn("");
    setDetailsBn("");
    setDetailsEn("");
    setImageFile(null);
    setPreviewUrl("");
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setCategory(p.category || "cricket");
    setTitleBn(p.title?.bn || "");
    setTitleEn(p.title?.en || "");
    setShortDescBn(p.shortDesc?.bn || "");
    setShortDescEn(p.shortDesc?.en || "");
    setDetailsBn(p.details?.bn || "");
    setDetailsEn(p.details?.en || "");
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("category", category);
      fd.append("titleBn", titleBn);
      fd.append("titleEn", titleEn);
      fd.append("shortDescBn", shortDescBn);
      fd.append("shortDescEn", shortDescEn);
      fd.append("detailsBn", detailsBn);
      fd.append("detailsEn", detailsEn);
      if (imageFile) fd.append("image", imageFile);

      if (editingId) {
        await api.put(`/api/promotions/${editingId}`, fd);
        toast.success("Promotion updated");
      } else {
        if (!imageFile) {
          toast.error("Please select an image for the new promotion");
          return;
        }
        await api.post(`/api/promotions`, fd);
        toast.success("Promotion added");
      }

      await load();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await api.delete(`/api/promotions/${deleteConfirmId}`);
      toast.success("Promotion deleted");
      await load();
      if (editingId === deleteConfirmId) resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL}${img}`;
  };

  const getCurrentImageSrc = () => {
    if (previewUrl) return previewUrl;
    if (editingId && list.length > 0) {
      const currentPromo = list.find((p) => p._id === editingId);
      if (currentPromo?.image) return resolveImg(currentPromo.image);
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
          {editingId ? "Update Promotion" : "Add New Promotion"}
        </h2>

        <form
          onSubmit={submit}
          className="bg-black/60 backdrop-blur-md border border-yellow-700/40 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-yellow-900/30 mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload + Preview */}
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Promotion Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-black/50 border border-yellow-700/40 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-600/80 file:text-black hover:file:bg-yellow-500/90 file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs text-yellow-400/70 mt-2">
                Choose an image file (jpg, png, webp)
              </p>

              {(previewUrl || (editingId && getCurrentImageSrc())) && (
                <div className="mt-5">
                  <p className="text-sm text-yellow-300/80 mb-2">
                    {previewUrl ? "New Image Preview:" : "Current Image:"}
                  </p>
                  <div className="relative rounded-xl overflow-hidden border border-yellow-700/50 shadow-lg shadow-black/40">
                    <img
                      src={getCurrentImageSrc()}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    {previewUrl && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium px-4 text-center text-lg">
                          New selected image
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Title (Bangla)
              </label>
              <input
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
                placeholder="প্রমোশনের নাম (বাংলা)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Title (English)
              </label>
              <input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
                placeholder="Promotion Title (English)"
              />
            </div>
          </div>

          {/* Short Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Short Description (BN)
              </label>
              <input
                value={shortDescBn}
                onChange={(e) => setShortDescBn(e.target.value)}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
                placeholder="সংক্ষিপ্ত বর্ণনা (বাংলা)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Short Description (EN)
              </label>
              <input
                value={shortDescEn}
                onChange={(e) => setShortDescEn(e.target.value)}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
                placeholder="Short description (English)"
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Details (Bangla)
              </label>
              <textarea
                value={detailsBn}
                onChange={(e) => setDetailsBn(e.target.value)}
                rows={5}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all resize-none"
                placeholder="বিস্তারিত বর্ণনা..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-300/90 mb-2">
                Details (English)
              </label>
              <textarea
                value={detailsEn}
                onChange={(e) => setDetailsEn(e.target.value)}
                rows={5}
                className="w-full bg-black/70 border border-yellow-700/50 rounded-xl px-4 py-3 text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all resize-none"
                placeholder="Detailed description..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-10">
            <button
              type="submit"
              disabled={saving}
              className={`cursor-pointer px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg
                ${saving
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-yellow-600/50 hover:shadow-yellow-500/70 border border-yellow-400/40"
                }`}
            >
              {saving ? "Saving..." : editingId ? "Update Promotion" : "Add Promotion"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer px-8 py-3.5 rounded-xl font-semibold text-lg bg-black/70 border border-yellow-700/50 hover:bg-yellow-900/40 hover:border-yellow-500/60 text-yellow-200 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Promotion List */}
        <div>
          <h3 className="text-2xl font-bold text-yellow-300/90 mb-6">
            All Promotions
          </h3>

          {loading ? (
            <div className="bg-black/50 border border-yellow-700/40 rounded-2xl p-8 text-center text-yellow-300/70">
              Loading promotions...
            </div>
          ) : list.length === 0 ? (
            <div className="bg-black/50 border border-yellow-700/40 rounded-2xl p-8 text-center text-yellow-300/70">
              No promotions found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((p) => (
                <div
                  key={p._id}
                  className="bg-black/60 backdrop-blur-md border border-yellow-700/40 rounded-2xl overflow-hidden shadow-xl shadow-yellow-900/20 hover:shadow-yellow-800/40 transition-all duration-300 group"
                >
                  <img
                    src={resolveImg(p.image)}
                    alt={p.title?.en || "Promotion"}
                    className="w-full h-48 object-cover"
                    draggable="false"
                  />
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-yellow-100 group-hover:text-yellow-300 transition-colors">
                      {p.title?.en || p.title?.bn || "Untitled"}
                    </h4>
                    <p className="text-sm text-yellow-200/70 mt-2 line-clamp-2">
                      {p.shortDesc?.en || p.shortDesc?.bn || "No description available"}
                    </p>

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => startEdit(p)}
                        className="cursor-pointer flex-1 py-2.5 rounded-lg bg-blue-700/80 hover:bg-blue-600 text-white font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(p._id)}
                        className="cursor-pointer flex-1 py-2.5 rounded-lg bg-red-700/80 hover:bg-red-600 text-white font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 border border-yellow-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-yellow-900/50">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">
                Confirm Delete
              </h3>
              <p className="text-yellow-100/90 mb-6">
                Are you sure you want to delete this promotion? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-black/70 border border-yellow-700/50 hover:bg-yellow-900/40 text-yellow-200 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPromotion;