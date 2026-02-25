// src/pages/admin/LiveGameController.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaSave, FaSync } from "react-icons/fa";

// Base URL (your backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5008";

// Axios
import axios from "axios";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * ✅ NEW BEHAVIOR (as you asked)
 * - Database এ শুধু 1টা global gameUID থাকবে
 * - LiveGames.jsx এ যেই match এ click করুক -> /playgame/{globalGameUID}
 * - এখানে admin panel থেকে global gameUID + isActive সেট হবে
 *
 * Backend endpoint expected:
 *  GET  /api/live-games/global  -> { _id, gameUID, isActive }
 *  PUT  /api/live-games/global  -> { gameUID, isActive } -> returns updated doc
 */

const emptyForm = {
  gameUID: "",
  isActive: true,
};

const LiveGameController = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadGlobal = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/live-games/global");
      setForm({
        gameUID: data?.gameUID || "",
        isActive: data?.isActive !== false,
      });
    } catch (e) {
      toast.error("Failed to load global live game config");
      console.error("Load error:", e);
      setForm(emptyForm);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobal();
  }, []);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    if (!String(form.gameUID || "").trim())
      return "Global Game UID is required";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);

    try {
      setSaving(true);
      await api.put("/api/live-games/global", {
        gameUID: String(form.gameUID || "").trim(),
        isActive: !!form.isActive,
      });
      toast.success("Saved successfully");
      await loadGlobal();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/30 to-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 tracking-tight">
          Live Game Global Controller
        </h1>

        {/* CONFIG CARD */}
        <div className="bg-black/40 border border-yellow-700/40 rounded-2xl p-6 shadow-xl shadow-yellow-950/30">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={loadGlobal}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-600/20 hover:bg-yellow-600/35 rounded-xl font-medium cursor-pointer transition-colors disabled:opacity-50"
              title="Reload from DB"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Reload"}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold rounded-xl shadow-lg shadow-yellow-700/40 cursor-pointer transition-all disabled:opacity-50"
            >
              <FaSave />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-yellow-300/90 mb-1">
                Global Game UID *
              </label>
              <input
                value={form.gameUID || ""}
                onChange={(e) => setField("gameUID", e.target.value)}
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
                placeholder="e.g. 69987ca39fa20f5dfecbdc95"
              />
              <p className="mt-2 text-xs text-yellow-200/50">
                LiveGames এ যেকোন match এ click করলে যাবে:
                <span className="font-bold text-yellow-200/80">
                  {" "}
                  /playgame/{`{GLOBAL_GAME_UID}`}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm text-yellow-300/90 mb-1">
                Live Games Click Status *
              </label>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setField("isActive", e.target.value === "active")
                }
                className="w-full bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white focus:border-yellow-400 outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <p className="mt-2 text-xs text-yellow-200/50">
                Inactive হলে frontend এ click disable করে দিতে পারো
                (LiveGames.jsx এ)।
              </p>
            </div>
          </div>

          {/* PREVIEW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl border border-yellow-700/30 bg-black/30"
          >
            <div className="text-sm text-yellow-200/80 font-bold mb-1">
              Current Preview
            </div>
            <div className="text-xs text-yellow-200/60">
              URL will be:
              <span className="ml-2 font-extrabold text-yellow-200/90">
                /playgame/{String(form.gameUID || "").trim() || "____"}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-yellow-200/50">
              Status:{" "}
              <span className="font-extrabold">
                {form.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </motion.div>

          <p className="mt-6 text-xs text-yellow-200/45 text-center italic">
            Note: এখানে শুধু ১টা global UID থাকে • সব match click করলে একই UID
            তে যাবে
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveGameController;
