import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const emptyItem = () => ({ name: "", imageUrl: "" });

const AffFooterController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [form, setForm] = useState({
    leftTitleBn: "",
    leftTitleEn: "",
    leftBodyBn: "",
    leftBodyEn: "",

    rightTitleBn: "",
    rightTitleEn: "",

    responsibleTitleBn: "",
    responsibleTitleEn: "",

    paymentTitleBn: "",
    paymentTitleEn: "",

    followTitleBn: "",
    followTitleEn: "",

    copyrightBn: "",
    copyrightEn: "",

    officialLogoUrl: "",

    partners: [emptyItem()],
    paymentMethods: [emptyItem()],
    responsible: [emptyItem()],

    socialLinks: {
      facebook: "",
      twitter: "",
      youtube: "",
      instagram: "",
      telegram: "",
    },
  });

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const setSocial = (key, value) =>
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }));

  const updateArrayItem = (key, idx, patch) => {
    setForm((p) => {
      const arr = [...(p[key] || [])];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...p, [key]: arr };
    });
  };

  const addArrayItem = (key) =>
    setForm((p) => ({ ...p, [key]: [...(p[key] || []), emptyItem()] }));

  const removeArrayItem = (key, idx) =>
    setForm((p) => {
      const arr = [...(p[key] || [])].filter((_, i) => i !== idx);
      return { ...p, [key]: arr.length ? arr : [emptyItem()] };
    });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-footer");

      if (data?._id) {
        setDocId(data._id);
        setForm((prev) => ({
          ...prev,
          ...data,
          partners: data.partners?.length ? data.partners : [emptyItem()],
          paymentMethods: data.paymentMethods?.length
            ? data.paymentMethods
            : [emptyItem()],
          responsible: data.responsible?.length
            ? data.responsible
            : [emptyItem()],
          socialLinks: {
            facebook: data.socialLinks?.facebook || "",
            twitter: data.socialLinks?.twitter || "",
            youtube: data.socialLinks?.youtube || "",
            instagram: data.socialLinks?.instagram || "",
            telegram: data.socialLinks?.telegram || "",
          },
        }));
      } else {
        setDocId(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load footer config");
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

    const { data } = await api.post("/api/aff-footer/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data?.url;
  };

  const pickAndUpload = async (onUrl) => {
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
          onUrl(url);
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

  const save = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        partners: (form.partners || []).filter(
          (x) => x.name?.trim() || x.imageUrl,
        ),
        paymentMethods: (form.paymentMethods || []).filter(
          (x) => x.name?.trim() || x.imageUrl,
        ),
        responsible: (form.responsible || []).filter(
          (x) => x.name?.trim() || x.imageUrl,
        ),
      };

      let res;
      if (docId) {
        res = await api.put(`/api/aff-footer/${docId}`, payload);
        toast.success("Footer updated successfully");
      } else {
        res = await api.post("/api/aff-footer", payload);
        toast.success("Footer created successfully");
      }

      if (res?.data?._id) setDocId(res.data._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!docId) return toast.info("No footer config to delete");
    if (!window.confirm("Are you sure you want to delete this footer config?"))
      return;

    try {
      await api.delete(`/api/aff-footer/${docId}`);
      toast.success("Footer config deleted");
      setDocId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const container =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6 lg:p-8";
  const card =
    "bg-gradient-to-b from-black/80 via-yellow-950/30 to-black border border-yellow-700/40 rounded-xl shadow-2xl shadow-yellow-900/20 overflow-hidden";
  const sectionTitle =
    "text-xl md:text-2xl font-bold text-yellow-400 mb-5 px-5 pt-5";
  const label = "text-xs md:text-sm text-yellow-300/80 mb-1.5 font-medium";
  const inputBase =
    "w-full bg-black/60 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200";
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;
  const addBtn = `${btnBase} bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-300 border border-yellow-600/30`;

  if (loading) {
    return (
      <div className={container}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-yellow-400 text-lg animate-pulse">
            Loading footer configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-tight">
              Affiliate Footer Controller
            </h1>
            <p className="text-sm text-yellow-200/70 mt-1">
              Manage affiliate footer content — direct upload + database save
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={primaryBtn} onClick={save} disabled={saving}>
              {saving ? "Saving..." : docId ? "Update Footer" : "Create Footer"}
            </button>
            <button className={dangerBtn} onClick={del}>
              Delete Config
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 md:space-y-8">
          {/* TEXTS */}
          <div className={card}>
            <h3 className={sectionTitle}>Footer Texts (Bengali / English)</h3>
            <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              {[
                { key: "leftTitle", label: "Left Title" },
                { key: "leftBody", label: "Left Body", isTextArea: true },
                { key: "rightTitle", label: "Right Title" },
                { key: "responsibleTitle", label: "Responsible Gaming Title" },
                { key: "paymentTitle", label: "Payment Title" },
                { key: "followTitle", label: "Follow Us Title" },
                { key: "copyright", label: "Copyright Text" },
              ].map(({ key, label: lbl, isTextArea }) => (
                <React.Fragment key={key}>
                  <div>
                    <label className={label}>{lbl} (BN)</label>
                    {isTextArea ? (
                      <textarea
                        className={`${inputBase} min-h-[100px] md:min-h-[120px]`}
                        value={form[`${key}Bn`]}
                        onChange={(e) => setField(`${key}Bn`, e.target.value)}
                      />
                    ) : (
                      <input
                        className={inputBase}
                        value={form[`${key}Bn`]}
                        onChange={(e) => setField(`${key}Bn`, e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <label className={label}>{lbl} (EN)</label>
                    {isTextArea ? (
                      <textarea
                        className={`${inputBase} min-h-[100px] md:min-h-[120px]`}
                        value={form[`${key}En`]}
                        onChange={(e) => setField(`${key}En`, e.target.value)}
                      />
                    ) : (
                      <input
                        className={inputBase}
                        value={form[`${key}En`]}
                        onChange={(e) => setField(`${key}En`, e.target.value)}
                      />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* OFFICIAL LOGO */}
          <div className={card}>
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className={sectionTitle.replace("mb-5", "mb-0")}>
                Official Logo
              </h3>
              <button
                className={secondaryBtn}
                onClick={() =>
                  pickAndUpload((url) =>
                    setForm((p) => ({ ...p, officialLogoUrl: url })),
                  )
                }
              >
                Upload Logo
              </button>
            </div>
            <div className="px-5 pb-6">
              <div className="bg-black/40 border border-yellow-700/30 rounded-lg p-4 text-center">
                {form.officialLogoUrl ? (
                  <img
                    src={form.officialLogoUrl}
                    alt="Official Logo Preview"
                    className="max-h-28 md:max-h-36 mx-auto object-contain"
                  />
                ) : (
                  <p className="text-yellow-400/60 py-8">
                    No logo uploaded yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PARTNERS / RESPONSIBLE / PAYMENT — similar structure */}
          {[
            {
              key: "partners",
              title: "Official Partners & Sponsors",
              placeholder: "Partner Name",
            },
            {
              key: "responsible",
              title: "Responsible Gaming",
              placeholder: "e.g. 18+ / BeGambleAware",
            },
            {
              key: "paymentMethods",
              title: "Payment Methods",
              placeholder: "bKash / Nagad / Rocket...",
            },
          ].map(({ key, title, placeholder }) => (
            <div key={key} className={card}>
              <div className="flex items-center justify-between px-5 pt-5">
                <h3 className={sectionTitle.replace("mb-5", "mb-0")}>
                  {title}
                </h3>
                <button className={addBtn} onClick={() => addArrayItem(key)}>
                  + Add Item
                </button>
              </div>
              <div className="px-5 pb-6 space-y-5">
                {form[key].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black/50 border border-yellow-800/30 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                  >
                    <input
                      className={inputBase}
                      placeholder={placeholder}
                      value={item.name}
                      onChange={(e) =>
                        updateArrayItem(key, idx, { name: e.target.value })
                      }
                    />

                    <div className="bg-black/60 border border-yellow-700/30 rounded-lg p-3 flex items-center justify-center min-h-[100px] md:min-h-[120px]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={`${title} preview ${idx + 1}`}
                          className="max-h-28 md:max-h-40 object-contain"
                        />
                      ) : (
                        <p className="text-yellow-400/50 text-sm">No image</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                      <button
                        className={secondaryBtn}
                        onClick={() =>
                          pickAndUpload((url) =>
                            updateArrayItem(key, idx, { imageUrl: url }),
                          )
                        }
                      >
                        Upload Image
                      </button>
                      <button
                        className={dangerBtn}
                        onClick={() => removeArrayItem(key, idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* SOCIAL LINKS */}
          <div className={card}>
            <h3 className={sectionTitle}>Follow Us / Social Links</h3>
            <div className="px-5 pb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {["facebook", "twitter", "youtube", "instagram", "telegram"].map(
                (k) => (
                  <div key={k}>
                    <label className={label}>
                      {k.charAt(0).toUpperCase() + k.slice(1)} URL
                    </label>
                    <input
                      className={inputBase}
                      value={form.socialLinks?.[k] || ""}
                      onChange={(e) => setSocial(k, e.target.value)}
                      placeholder={`https://${k}.com/...`}
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="h-16 md:h-24" />
      </div>
    </div>
  );
};

export default AffFooterController;
