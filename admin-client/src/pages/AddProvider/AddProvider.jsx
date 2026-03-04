// src/pages/admin/AddProvider.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

// ✅ NEW ORACLE PROVIDER API (use this, not the old one)
const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_PROVIDER_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const emptyForm = {
  categoryId: "",
  providerId: "", // ✅ providerCode here
  providerName: "", // ✅ providerName
  providerImage: null,
  providerIcon: null,
  status: "active",

  // ✅ NEW
  isHot: false,
  isNew: false,
};

const AddProvider = () => {
  const [categories, setCategories] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [savedProviders, setSavedProviders] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [imgPreview, setImgPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/game-categories");
      setCategories(res.data?.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  // ✅ now loads from https://api.oraclegames.live/api/providers
  const loadOracleProviders = async () => {
    try {
      const res = await axios.get(ORACLE_PROVIDER_API, {
        headers: {
          "x-api-key": ORACLE_PROVIDER_KEY,
        },
      });

      setOracleProviders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to load providers from Oracle API",
      );
    }
  };

  const loadSavedProviders = async (categoryId) => {
    if (!categoryId) {
      setSavedProviders([]);
      return;
    }
    try {
      const res = await api.get(`/api/game-providers?categoryId=${categoryId}`);
      setSavedProviders(res.data?.data || []);
    } catch {
      toast.error("Failed to load saved providers");
    }
  };

  useEffect(() => {
    loadCategories();
    loadOracleProviders();
  }, []);

  useEffect(() => {
    if (form.categoryId) loadSavedProviders(form.categoryId);
  }, [form.categoryId]);

  useEffect(() => {
    // banner preview
    if (form.providerImage instanceof File) {
      const url = URL.createObjectURL(form.providerImage);
      setImgPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (editing?.providerImage) {
      setImgPreview(`${import.meta.env.VITE_API_URL}${editing.providerImage}`);
    } else {
      setImgPreview("");
    }

    // icon preview
    if (form.providerIcon instanceof File) {
      const url = URL.createObjectURL(form.providerIcon);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (editing?.providerIcon) {
      setIconPreview(`${import.meta.env.VITE_API_URL}${editing.providerIcon}`);
    } else {
      setIconPreview("");
    }
  }, [form.providerImage, form.providerIcon, editing]);

  // ✅ select provider by providerCode, save providerCode + providerName
  const handleProviderSelect = (providerCode) => {
    const selected = oracleProviders.find(
      (p) => String(p.providerCode) === String(providerCode),
    );

    setForm((prev) => ({
      ...prev,
      providerId: selected?.providerCode || "",
      providerName: selected?.providerName || "",
    }));
  };

  const startEdit = (provider) => {
    setEditing(provider);
    setForm({
      categoryId: provider.categoryId || "",
      providerId: provider.providerId || "",
      providerName: provider.providerName || "",
      providerImage: null,
      providerIcon: null,
      status: provider.status || "active",

      // ✅ NEW
      isHot: !!provider.isHot,
      isNew: !!provider.isNew,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setImgPreview("");
    setIconPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId) return toast.error("Please select a category");
    if (!form.providerId || !form.providerName)
      return toast.error("Please select a provider");

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("categoryId", form.categoryId);
      fd.append("providerId", form.providerId);
      fd.append("providerName", form.providerName);
      fd.append("status", form.status);

      // ✅ NEW (send as "true"/"false")
      fd.append("isHot", String(!!form.isHot));
      fd.append("isNew", String(!!form.isNew));

      if (form.providerImage instanceof File)
        fd.append("providerImage", form.providerImage);
      if (form.providerIcon instanceof File)
        fd.append("providerIcon", form.providerIcon);

      if (editing?._id) {
        await api.put(`/api/game-providers/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Provider updated successfully");
      } else {
        await api.post("/api/game-providers", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Provider added successfully");
      }

      await loadSavedProviders(form.categoryId);
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this provider?")) return;

    try {
      await api.delete(`/api/game-providers/${id}`);
      toast.success("Provider deleted");
      setSavedProviders((prev) => prev.filter((p) => p._id !== id));
      if (editing?._id === id) resetForm();
    } catch {
      toast.error("Failed to delete provider");
    }
  };

  const selectedCategoryName = useMemo(() => {
    const cat = categories.find((c) => c._id === form.categoryId);
    return cat?.categoryName?.en || "";
  }, [categories, form.categoryId]);

  // ────────────────────────────────────────────────
  //                   STYLES (dark/yellow theme)
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

  // ✅ Small checkbox style that matches theme
  const checkWrap =
    "flex items-center justify-between gap-4 bg-black/60 border border-yellow-700/50 rounded-xl px-5 py-4";
  const checkLabel = "text-sm font-semibold text-yellow-300/90";
  const checkBox = "h-5 w-5 accent-yellow-400 cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2 text-center md:text-left tracking-tight">
          Provider Management
        </h1>
        <p className="text-yellow-300/70 mb-10 text-center md:text-left">
          Add & manage game providers under each category
        </p>

        {/* FORM CARD */}
        <div
          className={`${cardBg} border border-yellow-700/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/70 mb-12 backdrop-blur-sm`}
        >
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Select Game Category
              </label>
              <select
                className={inputBase}
                value={form.categoryId}
                onChange={(e) => {
                  setForm((p) => ({ ...p, categoryId: e.target.value }));
                  setEditing(null);
                }}
                required
              >
                <option value="">Choose category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName?.en} • {c.categoryName?.bn}
                  </option>
                ))}
              </select>

              {form.categoryId && (
                <div className="mt-2 text-xs text-yellow-400/70">
                  Selected:{" "}
                  <span className="font-semibold text-yellow-200">
                    {selectedCategoryName}
                  </span>{" "}
                  • ID: <span className="font-mono">{form.categoryId}</span>
                </div>
              )}
            </div>

            {/* Provider (from NEW oracle API) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Select Provider
              </label>
              <select
                className={inputBase}
                value={form.providerId}
                onChange={(e) => handleProviderSelect(e.target.value)}
                required
              >
                <option value="">Choose provider...</option>
                {oracleProviders.map((p) => (
                  <option key={p._id} value={p.providerCode}>
                    {p.providerName} ({p.providerCode})
                  </option>
                ))}
              </select>

              {form.providerId && (
                <div className="mt-2 text-xs text-yellow-400/70">
                  Code: <span className="font-mono">{form.providerId}</span> •
                  Name:{" "}
                  <span className="font-semibold text-yellow-200">
                    {form.providerName}
                  </span>
                </div>
              )}
            </div>

            {/* ✅ NEW: HOT / NEW toggles */}
            <div className={checkWrap}>
              <div>
                <div className={checkLabel}>Mark as HOT</div>
                <div className="text-xs text-yellow-400/60">
                  Show HOT badge on provider card
                </div>
              </div>
              <input
                type="checkbox"
                className={checkBox}
                checked={!!form.isHot}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isHot: e.target.checked }))
                }
              />
            </div>

            <div className={checkWrap}>
              <div>
                <div className={checkLabel}>Mark as NEW</div>
                <div className="text-xs text-yellow-400/60">
                  Show NEW badge on provider card
                </div>
              </div>
              <input
                type="checkbox"
                className={checkBox}
                checked={!!form.isNew}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isNew: e.target.checked }))
                }
              />
            </div>

            {/* Provider Image */}
            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Provider Image (Main Banner)
              </label>
              <input
                type="file"
                accept="image/*"
                required={!editing}
                className={fileInputBase}
                onChange={(e) =>
                  setForm({
                    ...form,
                    providerImage: e.target.files?.[0] || null,
                  })
                }
              />
              {imgPreview && (
                <div className="mt-5 rounded-xl overflow-hidden border border-yellow-700/40 shadow-lg shadow-black/50">
                  <img
                    src={imgPreview}
                    alt="provider banner"
                    className="w-full h-56 md:h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Provider Icon */}
            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Provider Icon (Small)
              </label>
              <input
                type="file"
                accept="image/*"
                required={!editing}
                className={fileInputBase}
                onChange={(e) =>
                  setForm({
                    ...form,
                    providerIcon: e.target.files?.[0] || null,
                  })
                }
              />
              {iconPreview && (
                <div className="mt-5 flex justify-center">
                  <img
                    src={iconPreview}
                    alt="provider icon"
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-yellow-600/50 shadow-md shadow-black/40"
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
                    ? "Update Provider"
                    : "Add Provider"}
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

        {/* LIST SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-yellow-200">
            Saved Providers
            {form.categoryId && (
              <span className="text-yellow-400/70 ml-2">
                ({selectedCategoryName})
              </span>
            )}
          </h2>
          {form.categoryId && (
            <button
              onClick={() => loadSavedProviders(form.categoryId)}
              className="px-6 py-2.5 bg-black/70 hover:bg-black/50 border border-yellow-700/50 hover:border-yellow-500 rounded-xl text-yellow-300 font-medium transition-all duration-200"
            >
              Refresh List
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedProviders.map((prov) => (
            <div
              key={prov._id}
              className={`${cardBg} border border-yellow-700/30 rounded-2xl overflow-hidden shadow-xl shadow-black/60 hover:shadow-yellow-900/40 transition-all duration-300 group`}
            >
              <div className="relative">
                <img
                  src={`${import.meta.env.VITE_API_URL}${prov.providerImage}`}
                  alt={prov.providerName}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* ✅ HOT/NEW BADGES (left) */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {prov.isHot && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-500/90 text-black shadow-sm">
                      HOT
                    </span>
                  )}
                  {prov.isNew && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-400/90 text-black shadow-sm">
                      NEW
                    </span>
                  )}
                </div>

                {/* Status badge (right) */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      prov.status === "active"
                        ? "bg-green-600/90 text-white"
                        : "bg-red-600/90 text-white"
                    }`}
                  >
                    {prov.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${prov.providerIcon}`}
                    alt="icon"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-yellow-600/40 shadow-sm"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-yellow-100 group-hover:text-yellow-300 transition-colors truncate">
                      {prov.providerName}
                    </h3>
                    <p className="text-xs text-yellow-400/70 font-mono truncate">
                      {prov.providerId}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(prov)}
                    className="flex-1 bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500 hover:to-amber-500 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prov._id)}
                    className={btnDanger}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {savedProviders.length === 0 && form.categoryId && (
            <div className="col-span-full text-center py-16 text-yellow-400/60">
              No providers added for this category yet.
            </div>
          )}

          {!form.categoryId && (
            <div className="col-span-full text-center py-16 text-yellow-500/50">
              Select a category to view / add providers
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProvider;
