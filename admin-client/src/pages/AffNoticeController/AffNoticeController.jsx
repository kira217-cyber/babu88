import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffNoticeController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [form, setForm] = useState({
    textBn: "",
    textEn: "",
    speedSec: 16,
  });

  // ── Consistent styles with sidebar ────────────────────────────────────────
  const container =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6 lg:p-8";
  const card =
    "bg-gradient-to-b from-black/80 via-yellow-950/30 to-black border border-yellow-700/40 rounded-xl shadow-2xl shadow-yellow-900/20 overflow-hidden";
  const sectionTitle =
    "text-xl md:text-2xl font-bold text-yellow-400 mb-6 px-5 pt-5";
  const label =
    "text-xs md:text-sm text-yellow-300/80 mb-1.5 font-medium block";
  const inputBase =
    "w-full bg-black/60 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200";
  const textareaBase = `${inputBase} min-h-[120px] md:min-h-[140px] resize-y`;
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-notice");

      if (data?._id) {
        setDocId(data._id);
        setForm({
          textBn: data.textBn || "",
          textEn: data.textEn || "",
          speedSec: data.speedSec ?? 16,
        });
      } else {
        setDocId(null);
        setForm({ textBn: "", textEn: "", speedSec: 16 });
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load notice config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);

      const payload = {
        textBn: form.textBn || "",
        textEn: form.textEn || "",
        speedSec: Number(form.speedSec) || 16,
      };

      let res;
      if (docId) {
        res = await api.put(`/api/aff-notice/${docId}`, payload);
        toast.success("Notice updated successfully");
      } else {
        res = await api.post("/api/aff-notice", payload);
        toast.success("Notice created successfully");
      }

      if (res?.data?._id) setDocId(res.data._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!docId) return toast.info("No notice config to delete");
    if (
      !window.confirm(
        "Are you sure you want to delete this notice configuration?",
      )
    )
      return;

    try {
      await api.delete(`/api/aff-notice/${docId}`);
      toast.success("Notice config deleted");
      setDocId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className={container}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-yellow-400 text-lg animate-pulse">
            Loading notice configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-tight">
              Affiliate Notice Controller
            </h1>
            <p className="text-sm text-yellow-200/70 mt-1">
              Manage scrolling notice text (Bengali / English) & animation speed
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={primaryBtn} onClick={save} disabled={saving}>
              {saving ? "Saving..." : docId ? "Update Notice" : "Create Notice"}
            </button>
            <button className={dangerBtn} onClick={del}>
              Delete Config
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className={card}>
          <h3 className={sectionTitle}>Notice Content</h3>

          <div className="px-5 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className={label}>Notice Text (BN)</label>
              <textarea
                className={textareaBase}
                value={form.textBn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, textBn: e.target.value }))
                }
                placeholder="আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন!..."
              />
            </div>

            <div>
              <label className={label}>Notice Text (EN)</label>
              <textarea
                className={textareaBase}
                value={form.textEn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, textEn: e.target.value }))
                }
                placeholder="Get up to 60% commission today! Become a BABU88 agent today!..."
              />
            </div>

            <div className="lg:col-span-2">
              <label className={label}>Animation Speed (seconds)</label>
              <input
                className={inputBase}
                type="number"
                min="8"
                max="40"
                step="1"
                value={form.speedSec}
                onChange={(e) =>
                  setForm((p) => ({ ...p, speedSec: e.target.value }))
                }
                placeholder="16"
              />
              <p className="mt-2 text-xs text-yellow-400/70">
                Larger value = slower scroll, smaller value = faster scroll
                (recommended: 12–20 seconds)
              </p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="px-5 pb-8 border-t border-yellow-700/30 pt-6">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4">
              Live Preview
            </h4>

            <div className="w-full bg-[#2b2b2b] rounded-lg border border-yellow-700/30 p-4">
              <div className="bg-[#f5b400] rounded-md px-4 py-3 overflow-hidden shadow-md">
                <div className="notice-viewport">
                  <div className="notice-single text-black font-bold text-base sm:text-lg md:text-xl whitespace-nowrap">
                    {(form.textBn ||
                      "Preview notice text will appear here...") + "   "}
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              .notice-viewport {
                position: relative;
                overflow: hidden;
                width: 100%;
              }
              .notice-single {
                display: inline-block;
                will-change: transform;
                animation: noticeOne ${Number(form.speedSec) || 16}s linear infinite;
              }
              @keyframes noticeOne {
                0%   { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              @media (prefers-reduced-motion: reduce) {
                .notice-single {
                  animation: none;
                  transform: translateX(0);
                }
              }
            `}</style>
          </div>
        </div>

        <div className="h-16 md:h-24" />
      </div>
    </div>
  );
};

export default AffNoticeController;
