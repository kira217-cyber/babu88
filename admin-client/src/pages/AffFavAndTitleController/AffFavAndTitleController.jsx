import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffFavAndTitleController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [form, setForm] = useState({
    titleBn: "",
    titleEn: "",
    faviconUrl: "",
    logoUrl: "",
  });

  // ── Styles matching sidebar & other controllers ───────────────────────────
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
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-site-meta");

      if (data?._id) {
        setDocId(data._id);
        setForm({
          titleBn: data.titleBn || "",
          titleEn: data.titleEn || "",
          faviconUrl: data.faviconUrl || "",
          logoUrl: data.logoUrl || "",
        });
      } else {
        setDocId(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load site meta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pickFile = (accept = "image/*") =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = (e) => resolve(e.target.files?.[0] || null);
      input.click();
    });

  const uploadTo = async (endpoint, file) => {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post(endpoint, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.url;
  };

  const uploadFavicon = async () => {
    try {
      const file = await pickFile(
        "image/png,image/x-icon,image/vnd.microsoft.icon",
      );
      if (!file) return;
      toast.info("Uploading favicon...");
      const url = await uploadTo("/api/aff-site-meta/upload/favicon", file);
      if (!url) return toast.error("Upload failed");
      setForm((p) => ({ ...p, faviconUrl: url }));
      toast.success("Favicon uploaded successfully");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Favicon upload failed");
    }
  };

  const uploadLogo = async () => {
    try {
      const file = await pickFile("image/*");
      if (!file) return;
      toast.info("Uploading logo...");
      const url = await uploadTo("/api/aff-site-meta/upload/logo", file);
      if (!url) return toast.error("Upload failed");
      setForm((p) => ({ ...p, logoUrl: url }));
      toast.success("Logo uploaded successfully");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Logo upload failed");
    }
  };

  const save = async () => {
    try {
      setSaving(true);

      const payload = {
        titleBn: form.titleBn.trim(),
        titleEn: form.titleEn.trim(),
        faviconUrl: form.faviconUrl.trim(),
        logoUrl: form.logoUrl.trim(),
      };

      let res;
      if (docId) {
        res = await api.put(`/api/aff-site-meta/${docId}`, payload);
        toast.success("Site meta updated successfully");
      } else {
        res = await api.post("/api/aff-site-meta", payload);
        toast.success("Site meta created successfully");
      }

      if (res?.data?._id) setDocId(res.data._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!docId) return toast.info("No site meta config to delete");
    if (
      !window.confirm(
        "Are you sure you want to delete this site meta configuration?",
      )
    )
      return;

    try {
      await api.delete(`/api/aff-site-meta/${docId}`);
      toast.success("Site meta deleted");
      setDocId(null);
      setForm({ titleBn: "", titleEn: "", faviconUrl: "", logoUrl: "" });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className={container}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-yellow-400 text-lg animate-pulse">
            Loading site meta configuration...
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
              Affiliate Favicon & Title Controller
            </h1>
            <p className="text-sm text-yellow-200/70 mt-1">
              Manage website title (BN/EN), favicon & main logo — saved directly
              to DB
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={primaryBtn} onClick={save} disabled={saving}>
              {saving ? "Saving..." : docId ? "Update Meta" : "Create Meta"}
            </button>
            <button className={dangerBtn} onClick={del}>
              Delete Config
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className={card}>
          <h3 className={sectionTitle}>Website Title</h3>

          <div className="px-5 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={label}>Title (BN)</label>
              <input
                className={inputBase}
                value={form.titleBn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, titleBn: e.target.value }))
                }
                placeholder="BABU88 অফিসিয়াল সাইট..."
              />
            </div>
            <div>
              <label className={label}>Title (EN)</label>
              <input
                className={inputBase}
                value={form.titleEn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, titleEn: e.target.value }))
                }
                placeholder="BABU88 Official Website..."
              />
            </div>
          </div>

          {/* Favicon Section */}
          <div className="px-5 pb-8 border-t border-yellow-700/30 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h3 className="text-lg font-semibold text-yellow-300">Favicon</h3>
              <button className={secondaryBtn} onClick={uploadFavicon}>
                Upload Favicon
              </button>
            </div>

            <div className="bg-black/50 border border-yellow-800/30 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {form.faviconUrl ? (
                <>
                  <img
                    src={form.faviconUrl}
                    alt="Favicon Preview"
                    className="w-16 h-16 rounded-md object-contain bg-white/5 border border-yellow-700/20"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-200 break-all">
                      {form.faviconUrl}
                    </p>
                    <p className="text-xs text-yellow-400/70 mt-1">
                      Recommended: 32×32 or 64×64 PNG / ICO
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-yellow-400/60 py-6 text-center w-full">
                  No favicon uploaded yet
                </p>
              )}
            </div>
          </div>

          {/* Logo Section */}
          <div className="px-5 pb-8 border-t border-yellow-700/30 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h3 className="text-lg font-semibold text-yellow-300">
                Website Logo
              </h3>
              <button className={secondaryBtn} onClick={uploadLogo}>
                Upload Logo
              </button>
            </div>

            <div className="bg-black/50 border border-yellow-800/30 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {form.logoUrl ? (
                <>
                  <img
                    src={form.logoUrl}
                    alt="Logo Preview"
                    className="max-h-20 w-auto object-contain rounded-md bg-white/5 border border-yellow-700/20"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-200 break-all">
                      {form.logoUrl}
                    </p>
                    <p className="text-xs text-yellow-400/70 mt-1">
                      Recommended: transparent PNG, height 60–120px
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-yellow-400/60 py-8 text-center w-full">
                  No logo uploaded yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="h-16 md:h-24" />
      </div>
    </div>
  );
};

export default AffFavAndTitleController;
