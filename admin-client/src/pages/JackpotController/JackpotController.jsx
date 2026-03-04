import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";


const emptyForm = {
  miniAmount: "",
  grandAmount: "",
  majorAmount: "",
  isActive: true,

  bgImage: null,
  miniBoxImage: null,
  grandBoxImage: null,
  majorBoxImage: null,
};

const JackpotController = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [preview, setPreview] = useState({
    bg: "",
    mini: "",
    grand: "",
    major: "",
  });

  const loadConfig = async () => {
    try {
      const res = await api.get("/api/jackpot");
      const data = res.data?.data || null;
      setCfg(data);

      setForm((p) => ({
        ...p,
        miniAmount: data?.miniAmount ?? "",
        grandAmount: data?.grandAmount ?? "",
        majorAmount: data?.majorAmount ?? "",
        isActive: data?.isActive ?? true,

        bgImage: null,
        miniBoxImage: null,
        grandBoxImage: null,
        majorBoxImage: null,
      }));
    } catch (e) {
      toast.error("Failed to load jackpot config");
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // ✅ file previews
  useEffect(() => {
    const make = (file, fallback) => {
      if (file instanceof File) return URL.createObjectURL(file);
      return fallback || "";
    };

    const bgFallback = cfg?.bgImage ? `${API_URL}${cfg.bgImage}` : "";
    const miniFallback = cfg?.miniBoxImage
      ? `${API_URL}${cfg.miniBoxImage}`
      : "";
    const grandFallback = cfg?.grandBoxImage
      ? `${API_URL}${cfg.grandBoxImage}`
      : "";
    const majorFallback = cfg?.majorBoxImage
      ? `${API_URL}${cfg.majorBoxImage}`
      : "";

    const bgUrl = make(form.bgImage, bgFallback);
    const miniUrl = make(form.miniBoxImage, miniFallback);
    const grandUrl = make(form.grandBoxImage, grandFallback);
    const majorUrl = make(form.majorBoxImage, majorFallback);

    setPreview({ bg: bgUrl, mini: miniUrl, grand: grandUrl, major: majorUrl });

    return () => {
      // revoke only blob urls
      [bgUrl, miniUrl, grandUrl, majorUrl].forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.bgImage,
    form.miniBoxImage,
    form.grandBoxImage,
    form.majorBoxImage,
    cfg,
  ]);

  const cardBg = "bg-gradient-to-br from-black via-yellow-950/30 to-black";
  const inputBase =
    "w-full px-5 py-3.5 bg-black/60 border border-yellow-700/50 rounded-xl text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400/70 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200";
  const fileInputBase =
    "w-full px-5 py-3.5 bg-black/60 border border-yellow-700/50 rounded-xl text-white file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-yellow-500 file:to-amber-500 file:text-black file:font-bold file:cursor-pointer file:shadow-sm file:hover:brightness-110 transition-all";
  const btnPrimary =
    "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-yellow-600/40 hover:shadow-yellow-500/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const btnSecondary =
    "bg-black/80 hover:bg-black/60 text-white font-medium py-3.5 px-6 rounded-xl border border-yellow-700/50 hover:border-yellow-500/70 transition-all duration-300";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("miniAmount", String(form.miniAmount || 0));
      fd.append("grandAmount", String(form.grandAmount || 0));
      fd.append("majorAmount", String(form.majorAmount || 0));
      fd.append("isActive", String(!!form.isActive));

      // if file chosen => upload
      if (form.bgImage instanceof File) fd.append("bgImage", form.bgImage);
      if (form.miniBoxImage instanceof File)
        fd.append("miniBoxImage", form.miniBoxImage);
      if (form.grandBoxImage instanceof File)
        fd.append("grandBoxImage", form.grandBoxImage);
      if (form.majorBoxImage instanceof File)
        fd.append("majorBoxImage", form.majorBoxImage);

      const res = await api.put("/api/jackpot", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Jackpot updated");
      setCfg(res.data?.data || null);

      // reset files (keep numbers)
      setForm((p) => ({
        ...p,
        bgImage: null,
        miniBoxImage: null,
        grandBoxImage: null,
        majorBoxImage: null,
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-5 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-2 text-center md:text-left tracking-tight">
          Jackpot Controller
        </h1>
        <p className="text-yellow-300/70 mb-10 text-center md:text-left">
          Control jackpot images & amounts
        </p>

        <div
          className={`${cardBg} border border-yellow-700/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/70 mb-10`}
        >
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            {/* Active */}
            <div className="md:col-span-2 flex items-center justify-between bg-black/50 border border-yellow-700/40 rounded-xl px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-yellow-300/90">
                  Jackpot Active
                </div>
                <div className="text-xs text-yellow-400/60">
                  Turn off to hide jackpot on client
                </div>
              </div>
              <input
                type="checkbox"
                className="h-6 w-6 accent-yellow-400"
                checked={!!form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
            </div>

            {/* Amounts */}
            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Mini Amount
              </label>
              <input
                className={inputBase}
                value={form.miniAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, miniAmount: e.target.value }))
                }
                placeholder="ex: 1071.44"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Grand Amount
              </label>
              <input
                className={inputBase}
                value={form.grandAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, grandAmount: e.target.value }))
                }
                placeholder="ex: 113601.96"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Major Amount
              </label>
              <input
                className={inputBase}
                value={form.majorAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, majorAmount: e.target.value }))
                }
                placeholder="ex: 18670.31"
              />
            </div>

            <div className="hidden md:block" />

            {/* Images */}
            <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                  Background Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={fileInputBase}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      bgImage: e.target.files?.[0] || null,
                    }))
                  }
                />
                {preview.bg && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-700/40">
                    <img
                      src={preview.bg}
                      alt="bg"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                  Mini Box Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={fileInputBase}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      miniBoxImage: e.target.files?.[0] || null,
                    }))
                  }
                />
                {preview.mini && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-700/40 bg-black/40 p-3">
                    <img
                      src={preview.mini}
                      alt="mini"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                  Grand Box Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={fileInputBase}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      grandBoxImage: e.target.files?.[0] || null,
                    }))
                  }
                />
                {preview.grand && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-700/40 bg-black/40 p-3">
                    <img
                      src={preview.grand}
                      alt="grand"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                  Major Box Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={fileInputBase}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      majorBoxImage: e.target.files?.[0] || null,
                    }))
                  }
                />
                {preview.major && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-700/40 bg-black/40 p-3">
                    <img
                      src={preview.major}
                      alt="major"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-2">
              <button
                type="submit"
                disabled={loading}
                className={`${btnPrimary} flex-1 text-lg`}
              >
                {loading ? "Saving..." : "Save Jackpot Settings"}
              </button>

              <button
                type="button"
                onClick={loadConfig}
                className={`${btnSecondary} flex-1 text-lg`}
              >
                Reload
              </button>
            </div>
          </form>
        </div>

        {/* Quick Preview (mobile style look) */}
        <div
          className={`${cardBg} border border-yellow-700/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/70`}
        >
          <div className="text-yellow-200 font-bold mb-4">Preview</div>

          <div
            className="w-full h-40 rounded-xl overflow-hidden border border-white/10"
            style={{
              backgroundImage: `url(${preview.bg || ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="px-3 pb-3 pt-10">
              <div className="grid grid-cols-3 gap-6 items-end">
                <img
                  src={preview.mini || ""}
                  alt="mini"
                  className="w-full mt-4"
                />
                <img
                  src={preview.grand || ""}
                  alt="grand"
                  className="w-full mt-4 scale-[1.2]"
                />
                <img
                  src={preview.major || ""}
                  alt="major"
                  className="w-full mt-4"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-yellow-400/70">
            Client will use these uploaded images + amounts.
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotController;
