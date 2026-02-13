import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffAgentController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [form, setForm] = useState({
    titleBn: "",
    titleEn: "",
    p1Bn: "",
    p1En: "",
    p2Bn: "",
    p2En: "",
    p3Bn: "",
    p3En: "",
    listBn: [""],
    listEn: [""],
    percentText: "60%",
    stripBn: "",
    stripEn: "",
    btnBn: "",
    btnEn: "",
    btnLink: "/register",
  });

  // ── Styles matching sidebar ───────────────────────────────────────────────
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
  const textareaBase = `${inputBase} min-h-[100px] md:min-h-[120px] resize-y`;
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;
  const addBtn = `${btnBase} bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-300 border border-yellow-600/30`;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-agent");

      if (data?._id) {
        setDocId(data._id);
        setForm({
          titleBn: data.titleBn || "",
          titleEn: data.titleEn || "",
          p1Bn: data.p1Bn || "",
          p1En: data.p1En || "",
          p2Bn: data.p2Bn || "",
          p2En: data.p2En || "",
          p3Bn: data.p3Bn || "",
          p3En: data.p3En || "",
          listBn: data.listBn?.length ? data.listBn : [""],
          listEn: data.listEn?.length ? data.listEn : [""],
          percentText: data.percentText || "60%",
          stripBn: data.stripBn || "",
          stripEn: data.stripEn || "",
          btnBn: data.btnBn || "",
          btnEn: data.btnEn || "",
          btnLink: data.btnLink || "/register",
        });
      } else {
        setDocId(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load Agent config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setListItem = (key, idx, value) => {
    setForm((p) => {
      const arr = [...(p[key] || [])];
      arr[idx] = value;
      return { ...p, [key]: arr };
    });
  };

  const addListItem = (key) =>
    setForm((p) => ({ ...p, [key]: [...(p[key] || []), ""] }));

  const removeListItem = (key, idx) =>
    setForm((p) => {
      const arr = [...(p[key] || [])].filter((_, i) => i !== idx);
      return { ...p, [key]: arr.length ? arr : [""] };
    });

  const save = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        listBn: (form.listBn || []).map((x) => x.trim()).filter(Boolean),
        listEn: (form.listEn || []).map((x) => x.trim()).filter(Boolean),
        percentText: (form.percentText || "60%").trim(),
        btnLink: (form.btnLink || "/register").trim(),
      };

      let res;
      if (docId) {
        res = await api.put(`/api/aff-agent/${docId}`, payload);
        toast.success("Agent section updated successfully");
      } else {
        res = await api.post("/api/aff-agent", payload);
        toast.success("Agent section created successfully");
      }

      if (res?.data?._id) setDocId(res.data._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!docId) return toast.info("No agent config to delete");
    if (
      !window.confirm(
        "Are you sure you want to delete this agent section config?",
      )
    )
      return;

    try {
      await api.delete(`/api/aff-agent/${docId}`);
      toast.success("Agent config deleted");
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
            Loading agent section configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-tight">
              Affiliate Agent Controller
            </h1>
            <p className="text-sm text-yellow-200/70 mt-1">
              Manage all text content for the Agent / Become an Agent section
              (BN/EN)
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={primaryBtn} onClick={save} disabled={saving}>
              {saving
                ? "Saving..."
                : docId
                  ? "Update Section"
                  : "Create Section"}
            </button>
            <button className={dangerBtn} onClick={del}>
              Delete Config
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className={card}>
          <h3 className={sectionTitle}>Main Texts</h3>

          <div className="px-5 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { key: "title", label: "Section Title" },
              { key: "p1", label: "Paragraph 1", isTextArea: true },
              { key: "p2", label: "Paragraph 2", isTextArea: true },
              { key: "p3", label: "Paragraph 3", isTextArea: true },
            ].map(({ key, label: lbl, isTextArea }) => (
              <React.Fragment key={key}>
                <div>
                  <label className={label}>{lbl} (BN)</label>
                  {isTextArea ? (
                    <textarea
                      className={textareaBase}
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
                      className={textareaBase}
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

          {/* Checklist Section */}
          <div className="px-5 pb-6 border-t border-yellow-700/30 pt-6">
            <h3 className={sectionTitle.replace("mb-6", "mb-4")}>
              Checklist Items
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BN List */}
              <div className="bg-black/50 border border-yellow-800/30 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-yellow-300">
                    List Items (BN)
                  </h4>
                  <button
                    className={addBtn}
                    onClick={() => addListItem("listBn")}
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {form.listBn.map((val, idx) => (
                    <div key={idx} className="flex gap-3">
                      <input
                        className={inputBase}
                        value={val}
                        onChange={(e) =>
                          setListItem("listBn", idx, e.target.value)
                        }
                        placeholder={`BN list item ${idx + 1}`}
                      />
                      <button
                        className={dangerBtn}
                        onClick={() => removeListItem("listBn", idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* EN List */}
              <div className="bg-black/50 border border-yellow-800/30 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-yellow-300">
                    List Items (EN)
                  </h4>
                  <button
                    className={addBtn}
                    onClick={() => addListItem("listEn")}
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {form.listEn.map((val, idx) => (
                    <div key={idx} className="flex gap-3">
                      <input
                        className={inputBase}
                        value={val}
                        onChange={(e) =>
                          setListItem("listEn", idx, e.target.value)
                        }
                        placeholder={`EN list item ${idx + 1}`}
                      />
                      <button
                        className={dangerBtn}
                        onClick={() => removeListItem("listEn", idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Yellow Card Section */}
          <div className="px-5 pb-8 border-t border-yellow-700/30 pt-6">
            <h3 className={sectionTitle.replace("mb-6", "mb-4")}>
              Right Yellow Card
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className={label}>Percent Text (e.g. 60%)</label>
                <input
                  className={inputBase}
                  value={form.percentText}
                  onChange={(e) => setField("percentText", e.target.value)}
                />
              </div>

              <div>
                <label className={label}>
                  Button Link (default: /register)
                </label>
                <input
                  className={inputBase}
                  value={form.btnLink}
                  onChange={(e) => setField("btnLink", e.target.value)}
                />
              </div>

              <div>
                <label className={label}>Strip Text (BN)</label>
                <input
                  className={inputBase}
                  value={form.stripBn}
                  onChange={(e) => setField("stripBn", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Strip Text (EN)</label>
                <input
                  className={inputBase}
                  value={form.stripEn}
                  onChange={(e) => setField("stripEn", e.target.value)}
                />
              </div>

              <div>
                <label className={label}>Button Text (BN)</label>
                <input
                  className={inputBase}
                  value={form.btnBn}
                  onChange={(e) => setField("btnBn", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Button Text (EN)</label>
                <input
                  className={inputBase}
                  value={form.btnEn}
                  onChange={(e) => setField("btnEn", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-16 md:h-24" />
      </div>
    </div>
  );
};

export default AffAgentController;
