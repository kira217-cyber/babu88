import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffSliderController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [slides, setSlides] = useState([]);
  const [autoPlayDelay, setAutoPlayDelay] = useState(2000);
  const [loop, setLoop] = useState(true);

  // ── Consistent styles matching sidebar ──
  const container =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6 lg:p-8";
  const card =
    "bg-gradient-to-b from-black/80 via-yellow-950/30 to-black border border-yellow-700/40 rounded-xl shadow-2xl shadow-yellow-900/20 overflow-hidden";
  const sectionTitle =
    "text-xl md:text-2xl font-bold text-yellow-400 mb-5 px-5 pt-5";
  const label = "text-xs md:text-sm text-yellow-300/80 mb-1.5 font-medium";
  const inputBase =
    "w-full bg-black/60 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200 cursor-pointer";
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-slider");

      if (data?._id) {
        setDocId(data._id);
        setSlides(data.slides || []);
        setAutoPlayDelay(data.autoPlayDelay ?? 2000);
        setLoop(data.loop ?? true);
      } else {
        setDocId(null);
        setSlides([]);
        setAutoPlayDelay(2000);
        setLoop(true);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load slider config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);

    const { data } = await api.post("/api/aff-slider/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data?.url;
  };

  const pickAndUpload = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.info("Uploading image...");
        try {
          const url = await uploadImage(file);
          if (!url) throw new Error("No URL returned");
          setSlides((prev) => [...prev, url]);
          toast.success("Image uploaded successfully");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Upload failed");
        }
      };

      input.click();
    } catch (e) {
      toast.error("File selection failed");
    }
  };

  const removeSlide = (idx) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    try {
      setSaving(true);

      const payload = {
        slides: slides.filter(Boolean),
        autoPlayDelay: Number(autoPlayDelay) || 2000,
        loop: !!loop,
      };

      let res;
      if (docId) {
        res = await api.put(`/api/aff-slider/${docId}`, payload);
        toast.success("Slider updated successfully");
      } else {
        res = await api.post("/api/aff-slider", payload);
        toast.success("Slider created successfully");
      }

      if (res?.data?._id) setDocId(res.data._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!docId) return toast.info("No slider config to delete");
    if (
      !window.confirm(
        "Are you sure you want to delete this slider configuration?",
      )
    )
      return;

    try {
      await api.delete(`/api/aff-slider/${docId}`);
      toast.success("Slider config deleted");
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
            Loading slider configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-tight">
              Affiliate Slider Controller
            </h1>
            <p className="text-sm text-yellow-200/70 mt-1">
              Upload slider images — will be saved directly to database
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={primaryBtn} onClick={save} disabled={saving}>
              {saving ? "Saving..." : docId ? "Update Slider" : "Create Slider"}
            </button>
            <button className={dangerBtn} onClick={del}>
              Delete Config
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className={card}>
          <h3 className={sectionTitle}>Slider Images</h3>

          <div className="px-5 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-yellow-300/80">
                {slides.length === 0
                  ? "No slides added yet — click below to upload"
                  : `${slides.length} slide${slides.length > 1 ? "s" : ""} added`}
              </p>

              <button className={secondaryBtn} onClick={pickAndUpload}>
                + Upload New Slide
              </button>
            </div>

            {/* Slides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {slides.length === 0 ? (
                <div className="col-span-full py-12 text-center text-yellow-400/60">
                  No slides yet. Upload your first slider image.
                </div>
              ) : (
                slides.map((url, idx) => (
                  <div
                    key={url + idx}
                    className="bg-black/50 border border-yellow-800/30 rounded-lg overflow-hidden group"
                  >
                    <div className="aspect-[12/3] relative overflow-hidden">
                      <img
                        src={url}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3 flex items-center justify-between gap-3 bg-black/40">
                      <p className="text-xs text-yellow-200/70 truncate max-w-[180px]">
                        {url.split("/").pop()}
                      </p>
                      <button
                        className={dangerBtn}
                        onClick={() => removeSlide(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Settings */}
            <div className="mt-10 pt-6 border-t border-yellow-700/30 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={label}>Autoplay Delay (milliseconds)</label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  className={inputBase}
                  value={autoPlayDelay}
                  onChange={(e) => setAutoPlayDelay(e.target.value)}
                />
                <p className="mt-1 text-xs text-yellow-400/60">
                  Recommended: 2000–5000 ms
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <input
                  type="checkbox"
                  id="loop"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="w-5 h-5 accent-yellow-500 cursor-pointer"
                />
                <label
                  htmlFor="loop"
                  className="text-sm text-yellow-200 cursor-pointer"
                >
                  Enable Loop (continuous sliding)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="h-16 md:h-24" />
      </div>
    </div>
  );
};

export default AffSliderController;
