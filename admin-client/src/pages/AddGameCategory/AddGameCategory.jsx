// src/pages/admin/AddGameCategory.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const emptyForm = {
  categoryNameBn: "",
  categoryNameEn: "",
  categoryTitleBn: "",
  categoryTitleEn: "",
  bannerImage: null,
  iconImage: null, // ← NEW
  status: "active",
};

const AddGameCategory = () => {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");
  const [editing, setEditing] = useState(null);

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/game-categories");
      setCategories(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load game categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Banner preview
  useEffect(() => {
    if (form.bannerImage instanceof File) {
      const url = URL.createObjectURL(form.bannerImage);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (editing?.bannerImage) {
      setBannerPreview(`${import.meta.env.VITE_API_URL}${editing.bannerImage}`);
    } else {
      setBannerPreview("");
    }
  }, [form.bannerImage, editing]);

  // Icon preview
  useEffect(() => {
    if (form.iconImage instanceof File) {
      const url = URL.createObjectURL(form.iconImage);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (editing?.iconImage) {
      setIconPreview(`${import.meta.env.VITE_API_URL}${editing.iconImage}`);
    } else {
      setIconPreview("");
    }
  }, [form.iconImage, editing]);

  const startEdit = (category) => {
    setEditing(category);
    setForm({
      categoryNameBn: category?.categoryName?.bn || "",
      categoryNameEn: category?.categoryName?.en || "",
      categoryTitleBn: category?.categoryTitle?.bn || "",
      categoryTitleEn: category?.categoryTitle?.en || "",
      bannerImage: null,
      iconImage: null, // reset file input
      status: category?.status || "active",
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setBannerPreview("");
    setIconPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("categoryNameBn", form.categoryNameBn);
      fd.append("categoryNameEn", form.categoryNameEn);
      fd.append("categoryTitleBn", form.categoryTitleBn);
      fd.append("categoryTitleEn", form.categoryTitleEn);
      fd.append("status", form.status);

      if (form.bannerImage instanceof File) {
        fd.append("bannerImage", form.bannerImage);
      }
      if (form.iconImage instanceof File) {
        fd.append("iconImage", form.iconImage); // ← NEW
      }

      if (editing?._id) {
        await api.put(`/api/game-categories/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully!");
      } else {
        await api.post("/api/game-categories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category created successfully!");
      }

      await loadCategories();
      resetForm();
    } catch (err) {
      const msg = err?.response?.data?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await api.delete(`/api/game-categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      if (editing?._id === id) resetForm();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // ────────────────────────────────────────────────
  //                   STYLES
  // ────────────────────────────────────────────────
  const cardBg = "bg-gradient-to-br from-black via-yellow-950/30 to-black";
  const inputBase =
    "w-full px-5 py-3.5 bg-black/60 border border-yellow-700/50 rounded-xl text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400/70 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200";
  const fileInputBase =
    "w-full px-5 py-3.5 bg-black/60 border border-yellow-700/50 rounded-xl text-white file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-yellow-500 file:to-amber-500 file:text-black file:font-bold file:cursor-pointer file:shadow-sm file:hover:brightness-110 transition-all";
  const btnPrimary =
    "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-yellow-600/40 hover:shadow-yellow-500/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const btnSecondary =
    "bg-black/80 hover:bg-black/60 text-white font-medium py-3.5 px-6 rounded-xl border border-yellow-700/50 hover:border-yellow-500/70 transition-all duration-300";
  const btnDanger =
    "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-red-500/40";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2 text-center md:text-left tracking-tight">
          Game Category Management
        </h1>
        <p className="text-yellow-300/70 mb-10 text-center md:text-left">
          Create, update and manage game categories for your platform
        </p>

        {/* FORM */}
        <div
          className={`${cardBg} border border-yellow-700/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/70 mb-12 backdrop-blur-sm`}
        >
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Category Name (Bangla)
              </label>
              <input
                required
                className={inputBase}
                value={form.categoryNameBn}
                onChange={(e) =>
                  setForm({ ...form, categoryNameBn: e.target.value })
                }
                placeholder="যেমন: স্লট গেম"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Category Name (English)
              </label>
              <input
                required
                className={inputBase}
                value={form.categoryNameEn}
                onChange={(e) =>
                  setForm({ ...form, categoryNameEn: e.target.value })
                }
                placeholder="e.g. Slot Games"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Category Title (Bangla)
              </label>
              <input
                required
                className={inputBase}
                value={form.categoryTitleBn}
                onChange={(e) =>
                  setForm({ ...form, categoryTitleBn: e.target.value })
                }
                placeholder="যেমন: সবচেয়ে জনপ্রিয় স্লট গেমস"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Category Title (English)
              </label>
              <input
                required
                className={inputBase}
                value={form.categoryTitleEn}
                onChange={(e) =>
                  setForm({ ...form, categoryTitleEn: e.target.value })
                }
                placeholder="e.g. Most Popular Slot Games"
              />
            </div>

            {/* Banner */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Banner Image
              </label>
              <input
                type="file"
                accept="image/*"
                required={!editing}
                className={fileInputBase}
                onChange={(e) =>
                  setForm({ ...form, bannerImage: e.target.files?.[0] || null })
                }
              />
              {bannerPreview && (
                <div className="mt-5 rounded-xl overflow-hidden border border-yellow-700/40 shadow-lg shadow-black/50">
                  <img
                    src={bannerPreview}
                    alt="banner preview"
                    className="w-full h-56 md:h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Icon — NEW */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Category Icon (small logo / symbol)
              </label>
              <input
                type="file"
                accept="image/*"
                className={fileInputBase}
                onChange={(e) =>
                  setForm({ ...form, iconImage: e.target.files?.[0] || null })
                }
              />
              {iconPreview && (
                <div className="mt-5 flex justify-center">
                  <img
                    src={iconPreview}
                    alt="icon preview"
                    className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl border-2 border-yellow-600/50 shadow-md shadow-black/40 bg-black/40 p-2"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Status
              </label>
              <select
                className={inputBase}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`${btnPrimary} flex-1 text-lg`}
              >
                {loading
                  ? "Saving..."
                  : editing
                    ? "Update Category"
                    : "Create Category"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${btnSecondary} flex-1 text-lg`}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className={`${cardBg} border border-yellow-700/30 rounded-2xl overflow-hidden shadow-xl shadow-black/60 hover:shadow-yellow-900/40 transition-all duration-300 group`}
            >
              <div className="relative">
                {/* Banner */}
                <img
                  src={`${import.meta.env.VITE_API_URL}${cat.bannerImage}`}
                  alt={cat.categoryName?.en}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.target.src = "/fallback-placeholder.png")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Icon overlay (top-left corner) */}
                {cat.iconImage && (
                  <div className="absolute top-3 left-3 w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-400/70 shadow-lg">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${cat.iconImage}`}
                      alt="category icon"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      cat.status === "active"
                        ? "bg-green-600/90 text-white"
                        : "bg-red-600/90 text-white"
                    }`}
                  >
                    {cat.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-yellow-100 group-hover:text-yellow-300 transition-colors">
                  {cat.categoryName?.en || "—"}
                </h3>
                <p className="text-sm text-yellow-200/70 mt-1 line-clamp-2">
                  {cat.categoryTitle?.en || "No title"}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => startEdit(cat)}
                    className="flex-1 bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500 hover:to-amber-500 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className={btnDanger}
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4 text-xs text-yellow-400/50 font-mono">
                  ID: {cat._id}
                </div>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 text-yellow-400/60">
              No categories found. Create your first category above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGameCategory;
