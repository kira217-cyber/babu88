// src/pages/admin/LiveGameController.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaTrash, FaEdit, FaPlus, FaUpload, FaSync } from "react-icons/fa";

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5008";

// Axios instance
import axios from "axios";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const emptyForm = {
  gameUID: "",
  statusText: "",
  statusType: "live",
  title: "",
  datetime: "",
  teams: [
    { name: "", countryImage: "" },
    { name: "", countryImage: "" },
  ],
};

const LiveGameController = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(
    () => list.find((x) => x._id === selectedId),
    [list, selectedId],
  );

  const [form, setForm] = useState(emptyForm);
  const [previews, setPreviews] = useState({ 0: "", 1: "" });

  const loadAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/live-games");
      setList(data || []);
      if (!selectedId && data?.[0]?._id) setSelectedId(data[0]._id);
    } catch (e) {
      toast.error("Failed to load games");
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selected) {
      setForm({
        ...selected,
        datetime: toDatetimeLocal(selected.datetime),
      });
      setPreviews({
        0: selected?.teams?.[0]?.countryImage || "",
        1: selected?.teams?.[1]?.countryImage || "",
      });
    } else {
      setForm(emptyForm);
      setPreviews({ 0: "", 1: "" });
    }
  }, [selected]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setTeamField = (idx, key, value) => {
    setForm((prev) => {
      const teams = [...(prev.teams || [])];
      teams[idx] = { ...teams[idx], [key]: value };
      return { ...prev, teams };
    });
  };

  function toDatetimeLocal(value) {
    if (!value) return "";
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ) {
      return value;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post("/api/live-games/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.url;
  };

  const handlePickImage = async (idx, file) => {
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [idx]: localPreview }));

    try {
      const url = await uploadImage(file);
      if (url) {
        setTeamField(idx, "countryImage", url);
        setPreviews((p) => ({ ...p, [idx]: url }));
        toast.success(`Team ${idx + 1} image uploaded successfully`);
      }
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Upload error:", err);
      setPreviews((p) => ({ ...p, [idx]: "" }));
    }
  };

  const validate = () => {
    if (!form.gameUID?.trim()) return "Game UID is required";
    if (!form.statusText?.trim()) return "Status text is required";
    if (!form.statusType) return "Status type is required";
    if (!form.title?.trim()) return "Title is required";
    if (!form.datetime?.trim()) return "Date & time is required";
    if (form.teams?.length !== 2) return "Exactly 2 teams required";
    if (!form.teams[0]?.name?.trim() || !form.teams[1]?.name?.trim())
      return "Both team names required";
    if (!form.teams[0]?.countryImage || !form.teams[1]?.countryImage)
      return "Both team flags/images required";
    return null;
  };

  const buildPayload = () => ({
    gameUID: form.gameUID,
    statusText: form.statusText,
    statusType: form.statusType,
    title: form.title,
    datetime: form.datetime ? new Date(form.datetime).toISOString() : "",
    teams: form.teams.map((t) => ({
      name: t.name,
      countryImage: t.countryImage,
    })),
  });

  const handleCreate = async () => {
    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      await api.post("/api/live-games", buildPayload());
      toast.success("Game created successfully");
      setForm(emptyForm);
      setSelectedId("");
      setPreviews({ 0: "", 1: "" });
      loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return toast.error("Please select a game to update");
    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      await api.put(`/api/live-games/${selectedId}`, buildPayload());
      toast.success("Game updated successfully");
      loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      await api.delete(`/api/live-games/${itemToDelete}`);
      toast.success("Game deleted successfully");
      setSelectedId("");
      setForm(emptyForm);
      setPreviews({ 0: "", 1: "" });
      loadAll();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setSaving(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleNew = () => {
    setSelectedId("");
    setForm(emptyForm);
    setPreviews({ 0: "", 1: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/30 to-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 tracking-tight">
          Live Games Controller
        </h1>

        {/* ─── FORM SECTION ─── (Now at the top) */}
        <div className="bg-black/40 border border-yellow-700/40 rounded-2xl p-6 shadow-xl shadow-yellow-950/30 mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-xl font-medium cursor-pointer transition-colors"
              disabled={saving}
            >
              <FaPlus /> New Game
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold rounded-xl shadow-lg shadow-yellow-700/40 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Game"}
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving || !selectedId}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-700/40 hover:bg-yellow-600/50 rounded-xl font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              Update Selected
            </button>
            <button
              onClick={() => selectedId && confirmDelete(selectedId)}
              disabled={saving || !selectedId}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/70 hover:bg-red-500 text-white rounded-xl font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-yellow-300/90 mb-1">
                Game UID *
              </label>
              <input
                value={form.gameUID || ""}
                onChange={(e) => setField("gameUID", e.target.value)}
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
                placeholder="e.g. icc-u19-2026-001"
              />
            </div>

            <div>
              <label className="block text-sm text-yellow-300/90 mb-1">
                Status Type *
              </label>
              <select
                value={form.statusType || "live"}
                onChange={(e) => setField("statusType", e.target.value)}
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
              >
                <option value="live">Live</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-yellow-300/90 mb-1">
                Status Text *
              </label>
              <input
                value={form.statusText || ""}
                onChange={(e) => setField("statusText", e.target.value)}
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
                placeholder='e.g. "2nd Innings" / "Match starts soon"'
              />
            </div>

            <div>
              <label className="block text-sm text-yellow-300/90 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={form.datetime || ""}
                onChange={(e) => setField("datetime", e.target.value)}
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-yellow-300/90 mb-1">
                Match Title *
              </label>
              <input
                value={form.title || ""}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
                placeholder="e.g. Bangladesh U19 vs India U19 - Final"
              />
            </div>
          </div>

          {/* Teams Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {[0, 1].map((idx) => (
              <div
                key={idx}
                className="bg-black/50 border border-yellow-700/40 rounded-xl p-5"
              >
                <h3 className="text-lg font-bold text-yellow-300 mb-4">
                  Team {idx + 1}
                </h3>

                <label className="block text-sm text-yellow-200/80 mb-1">
                  Team Name *
                </label>
                <input
                  value={form.teams?.[idx]?.name || ""}
                  onChange={(e) => setTeamField(idx, "name", e.target.value)}
                  className="w-full bg-black/60 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors mb-4"
                  placeholder="e.g. Bangladesh U19"
                />

                <label className="block text-sm text-yellow-200/80 mb-2">
                  Country Flag / Image *
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="cursor-pointer bg-yellow-600/30 hover:bg-yellow-600/50 px-5 py-3 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center">
                    <FaUpload />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handlePickImage(idx, e.target.files?.[0])
                      }
                      className="hidden"
                    />
                  </label>

                  {previews?.[idx] ? (
                    <div className="relative">
                      <img
                        src={
                          previews[idx].startsWith("blob:")
                            ? previews[idx]
                            : `${API_BASE_URL}${previews[idx]}`
                        }
                        alt={`Team ${idx + 1} preview`}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-yellow-500/40 shadow-md"
                        onError={(e) => {
                          e.target.src = "/placeholder-team.png";
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-black/40 border border-yellow-700/40 flex items-center justify-center text-yellow-500/50 text-xs">
                      No image
                    </div>
                  )}
                </div>

                {form.teams?.[idx]?.countryImage && (
                  <p className="mt-3 text-xs text-yellow-200/60 break-all">
                    Saved URL: {form.teams[idx].countryImage}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-yellow-200/50 text-center italic">
            Note: Game UID must be unique • Both teams and images are required •
            Images are uploaded to server
          </p>
        </div>

        {/* ─── GAMES LIST SECTION ─── (Now below the form) */}
        <div className="bg-black/40 border border-yellow-700/40 rounded-2xl p-5 shadow-xl shadow-yellow-950/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-yellow-300">
              Live Games List
            </h2>
            <button
              onClick={loadAll}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto [scrollbar-width:none] pr-2 scrollbar-hide">
            {list.length === 0 ? (
              <p className="text-center text-yellow-200/60 py-10">
                No live games found
              </p>
            ) : (
              list.map((game) => (
                <motion.div
                  key={game._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedId === game._id
                      ? "bg-yellow-600/20 border-yellow-500/60 shadow-lg shadow-yellow-600/30"
                      : "bg-black/30 border-yellow-700/30 hover:border-yellow-600/50 hover:bg-yellow-950/20"
                  }`}
                  onClick={() => setSelectedId(game._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-yellow-100 line-clamp-1">
                        {game.title}
                      </h3>
                      <p className="text-xs text-yellow-200/70 mt-1">
                        {game.gameUID}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(game._id);
                        }}
                        className="p-2.5 bg-yellow-600/40 hover:bg-yellow-500/60 rounded-lg text-yellow-100 cursor-pointer transition-colors"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(game._id);
                        }}
                        className="p-2.5 bg-red-600/50 hover:bg-red-500/70 rounded-lg text-white cursor-pointer transition-colors"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    {game.teams?.map((team, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {team.countryImage && (
                          <img
                            src={`${API_BASE_URL}${team.countryImage}`}
                            alt={team.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-yellow-600/40 shadow-sm"
                            onError={(e) => {
                              e.target.src = "/placeholder-flag.png";
                            }}
                          />
                        )}
                        <span className="text-sm text-yellow-200/90 font-medium">
                          {team.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-black to-yellow-950/50 border border-yellow-600/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-yellow-900/40"
          >
            <h3 className="text-2xl font-bold text-yellow-300 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-yellow-100/90 mb-8">
              Are you sure you want to permanently delete this live game? This
              action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? "Deleting..." : "Delete Game"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LiveGameController;
