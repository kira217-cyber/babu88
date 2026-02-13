import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

/* ===================== helpers ===================== */
const emptyBi = () => ({ bn: "", en: "" });

const DEFAULT_FORM = {
  name: "Default Commission",
  isActive: true,

  sectionTitle: emptyBi(),
  btnMore: emptyBi(),

  th: {
    bn: ["", "", "", "", "", ""],
    
    en: ["", "", "", "", "", ""],
  },

  rows: [
    {
      level: "1",
      newReg: emptyBi(),
      base: "20%",
      extra: "5%",
      need: emptyBi(),
      total: "25%",
    },
  ],

  modalTitle: emptyBi(),
  bullets: { bn: [""], en: [""] },

  formulaTitle: emptyBi(),
  formulaLabels: {
    bn: ["", "", "", "", "", ""],
    en: ["", "", "", "", "", ""],
  },

  exampleTitle: emptyBi(),

  exTh: {
    bn: ["", "", "", "", "", ""],
    en: ["", "", "", "", "", ""],
  },

  exRows: [
    {
      no: "1",
      wl: "",
      op: "",
      bonus: "",
      formula: emptyBi(),
      agent: "",
    },
  ],

  exTotalLabel: emptyBi(),
  exTotal: { wl: "", op: "", bonus: "", agent: "" },

  close: emptyBi(),
};

/* ===================== Main Component ===================== */
const AffCommissionController = () => {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);

  const selected = useMemo(
    () => list.find((x) => x._id === selectedId),
    [list, selectedId],
  );

  /* ===================== Styles (Sidebar Match) ===================== */
  const container =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6 lg:p-8";
  const card =
    "bg-gradient-to-b from-black/80 via-yellow-950/30 to-black border border-yellow-700/40 rounded-xl shadow-2xl shadow-yellow-900/20 overflow-hidden";
  const sectionTitle =
    "text-xl md:text-2xl font-bold text-yellow-400 mb-6 px-5 pt-5";
  const label =
    "text-xs md:text-sm text-yellow-300/80 mb-1.5 font-medium block";
  const inputBase =
    "w-full bg-black/60 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200 cursor-pointer";
  const textareaBase = `${inputBase} min-h-[100px] md:min-h-[120px] resize-y`;
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;
  const addBtn = `${btnBase} bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-300 border border-yellow-600/30`;

  /* ===================== Load & Select ===================== */
  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/aff-commission");
      setList(res.data || []);
    } catch (e) {
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selected) {
      const { _id, createdAt, updatedAt, __v, ...rest } = selected;
      setForm(rest);
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [selected]);

  /* ===================== Small Setters ===================== */
  const setBi = (key, lang, value) => {
    setForm((p) => ({ ...p, [key]: { ...p[key], [lang]: value } }));
  };

  const setArrayItem = (path, lang, idx, value) => {
    setForm((p) => {
      const arr = [...(p[path]?.[lang] || [])];
      arr[idx] = value;
      return { ...p, [path]: { ...p[path], [lang]: arr } };
    });
  };

  const addArrayItem = (path, lang) => {
    setForm((p) => {
      const arr = [...(p[path]?.[lang] || [])];
      arr.push("");
      return { ...p, [path]: { ...p[path], [lang]: arr } };
    });
  };

  const removeArrayItem = (path, lang, idx) => {
    setForm((p) => {
      const arr = [...(p[path]?.[lang] || [])];
      arr.splice(idx, 1);
      return { ...p, [path]: { ...p[path], [lang]: arr } };
    });
  };

  /* ===================== Main Table Rows ===================== */
  const addMainRow = () => {
    setForm((p) => ({
      ...p,
      rows: [
        ...(p.rows || []),
        {
          level: String((p.rows?.length || 0) + 1),
          newReg: emptyBi(),
          base: "",
          extra: "",
          need: emptyBi(),
          total: "",
        },
      ],
    }));
  };

  const removeMainRow = (idx) => {
    setForm((p) => {
      const rows = [...(p.rows || [])];
      rows.splice(idx, 1);
      return { ...p, rows };
    });
  };

  const setMainRow = (idx, key, value) => {
    setForm((p) => {
      const rows = [...(p.rows || [])];
      rows[idx] = { ...rows[idx], [key]: value };
      return { ...p, rows };
    });
  };

  const setMainRowBi = (idx, key, lang, value) => {
    setForm((p) => {
      const rows = [...(p.rows || [])];
      rows[idx] = { ...rows[idx], [key]: { ...rows[idx][key], [lang]: value } };
      return { ...p, rows };
    });
  };

  /* ===================== Example Rows ===================== */
  const addExRow = () => {
    setForm((p) => ({
      ...p,
      exRows: [
        ...(p.exRows || []),
        {
          no: String((p.exRows?.length || 0) + 1),
          wl: "",
          op: "",
          bonus: "",
          formula: emptyBi(),
          agent: "",
        },
      ],
    }));
  };

  const removeExRow = (idx) => {
    setForm((p) => {
      const rows = [...(p.exRows || [])];
      rows.splice(idx, 1);
      return { ...p, exRows: rows };
    });
  };

  const setExRow = (idx, key, value) => {
    setForm((p) => {
      const rows = [...(p.exRows || [])];
      rows[idx] = { ...rows[idx], [key]: value };
      return { ...p, exRows: rows };
    });
  };

  const setExRowBi = (idx, key, lang, value) => {
    setForm((p) => {
      const rows = [...(p.exRows || [])];
      rows[idx] = { ...rows[idx], [key]: { ...rows[idx][key], [lang]: value } };
      return { ...p, exRows: rows };
    });
  };

  /* ===================== CRUD ===================== */
  const handleNew = () => {
    setSelectedId("");
    setForm(DEFAULT_FORM);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/aff-commission", form);
      toast.success("Created successfully");
      await loadAll();
      setSelectedId(res.data?._id || "");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return toast.error("Select a config first");
    try {
      setLoading(true);
      await api.put(`/api/aff-commission/${selectedId}`, form);
      toast.success("Updated successfully");
      await loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast.error("Select a config first");
    if (
      !window.confirm("Are you sure you want to delete this commission config?")
    )
      return;

    try {
      setLoading(true);
      await api.delete(`/api/aff-commission/${selectedId}`);
      toast.success("Deleted successfully");
      handleNew();
      await loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className={container}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-tight">
            Affiliate Commission Controller
          </h1>

          <div className="flex flex-wrap gap-3">
            <button className={secondaryBtn} onClick={handleNew}>
              New Config
            </button>
            <button
              disabled={loading}
              onClick={handleCreate}
              className={primaryBtn}
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              disabled={loading || !selectedId}
              onClick={handleUpdate}
              className={primaryBtn}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              disabled={loading || !selectedId}
              onClick={handleDelete}
              className={dangerBtn}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Saved Configs List */}
          <div className={card}>
            <h3 className={sectionTitle.replace("mb-6", "mb-4")}>
              Saved Configurations
            </h3>

            <div className="px-5 pb-6">
              <button
                onClick={loadAll}
                className={`${secondaryBtn} w-full mb-4`}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh List"}
              </button>

              {list.length === 0 ? (
                <p className="text-yellow-400/70 text-center py-8">
                  No commission configs found
                </p>
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                  {list.map((x) => (
                    <button
                      key={x._id}
                      onClick={() => setSelectedId(x._id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedId === x._id
                          ? "border-yellow-500 bg-yellow-950/30 shadow-md shadow-yellow-900/40"
                          : "border-yellow-700/30 hover:bg-yellow-950/20 hover:border-yellow-600/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-yellow-300">
                          {x.name}
                        </span>
                        {x.isActive ? (
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-green-600/80 text-white">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-yellow-400/60 mt-1 truncate">
                        {x._id}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <div className={`${card} lg:col-span-3`}>
            <h3 className={sectionTitle}>Commission Configuration</h3>

            <div className="px-5 pb-8 space-y-8">
              {/* Basic Info */}
              <div>
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                  Basic Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>Config Name</label>
                    <input
                      className={inputBase}
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={!!form.isActive}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                      className="w-5 h-5 accent-yellow-500 cursor-pointer"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-yellow-200 cursor-pointer"
                    >
                      Active (visible on client side)
                    </label>
                  </div>
                </div>
              </div>

              {/* Section Texts */}
              <div className="border-t border-yellow-700/30 pt-6">
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                  Section Texts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>Section Title (BN)</label>
                    <input
                      className={inputBase}
                      value={form.sectionTitle.bn}
                      onChange={(e) =>
                        setBi("sectionTitle", "bn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={label}>Section Title (EN)</label>
                    <input
                      className={inputBase}
                      value={form.sectionTitle.en}
                      onChange={(e) =>
                        setBi("sectionTitle", "en", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>View More Button (BN)</label>
                    <input
                      className={inputBase}
                      value={form.btnMore.bn}
                      onChange={(e) => setBi("btnMore", "bn", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={label}>View More Button (EN)</label>
                    <input
                      className={inputBase}
                      value={form.btnMore.en}
                      onChange={(e) => setBi("btnMore", "en", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Main Table Headers */}
              <div className="border-t border-yellow-700/30 pt-6">
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                  Main Table Headers (6 Columns)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>BN Headers</label>
                    {form.th.bn.map((val, i) => (
                      <input
                        key={`th-bn-${i}`}
                        className={`${inputBase} mb-2`}
                        value={val}
                        onChange={(e) =>
                          setArrayItem("th", "bn", i, e.target.value)
                        }
                        placeholder={`Header ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div>
                    <label className={label}>EN Headers</label>
                    {form.th.en.map((val, i) => (
                      <input
                        key={`th-en-${i}`}
                        className={`${inputBase} mb-2`}
                        value={val}
                        onChange={(e) =>
                          setArrayItem("th", "en", i, e.target.value)
                        }
                        placeholder={`Header ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Rows */}
              <div className="border-t border-yellow-700/30 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-yellow-300">
                    Main Commission Rows
                  </h4>
                  <button className={addBtn} onClick={addMainRow}>
                    + Add Row
                  </button>
                </div>

                <div className="space-y-6">
                  {(form.rows || []).map((r, idx) => (
                    <div
                      key={idx}
                      className="bg-black/50 border border-yellow-800/30 rounded-lg p-5"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-semibold text-yellow-200">
                          Row #{idx + 1}
                        </h5>
                        <button
                          className={dangerBtn}
                          onClick={() => removeMainRow(idx)}
                        >
                          Remove Row
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={label}>Level</label>
                          <input
                            className={inputBase}
                            value={r.level}
                            onChange={(e) =>
                              setMainRow(idx, "level", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className={label}>Base Commission (%)</label>
                          <input
                            className={inputBase}
                            value={r.base}
                            onChange={(e) =>
                              setMainRow(idx, "base", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className={label}>Extra Commission (%)</label>
                          <input
                            className={inputBase}
                            value={r.extra}
                            onChange={(e) =>
                              setMainRow(idx, "extra", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className={label}>Total Commission (%)</label>
                          <input
                            className={inputBase}
                            value={r.total}
                            onChange={(e) =>
                              setMainRow(idx, "total", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className={label}>New Registration (BN)</label>
                          <textarea
                            className={textareaBase}
                            value={r.newReg?.bn || ""}
                            onChange={(e) =>
                              setMainRowBi(idx, "newReg", "bn", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className={label}>New Registration (EN)</label>
                          <textarea
                            className={textareaBase}
                            value={r.newReg?.en || ""}
                            onChange={(e) =>
                              setMainRowBi(idx, "newReg", "en", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className={label}>Requirement (BN)</label>
                          <textarea
                            className={textareaBase}
                            value={r.need?.bn || ""}
                            onChange={(e) =>
                              setMainRowBi(idx, "need", "bn", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className={label}>Requirement (EN)</label>
                          <textarea
                            className={textareaBase}
                            value={r.need?.en || ""}
                            onChange={(e) =>
                              setMainRowBi(idx, "need", "en", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="border-t border-yellow-700/30 pt-6">
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                  Modal Content
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>Modal Title (BN)</label>
                    <input
                      className={inputBase}
                      value={form.modalTitle.bn}
                      onChange={(e) =>
                        setBi("modalTitle", "bn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={label}>Modal Title (EN)</label>
                    <input
                      className={inputBase}
                      value={form.modalTitle.en}
                      onChange={(e) =>
                        setBi("modalTitle", "en", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="mt-6">
                  <h5 className="text-md font-semibold text-yellow-300 mb-3">
                    Bullet Points
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className={label}>Bangla Bullets</label>
                        <button
                          className={addBtn}
                          onClick={() => addArrayItem("bullets", "bn")}
                        >
                          + Add
                        </button>
                      </div>
                      {form.bullets.bn.map((val, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input
                            className={inputBase}
                            value={val}
                            onChange={(e) =>
                              setArrayItem("bullets", "bn", i, e.target.value)
                            }
                          />
                          <button
                            className={dangerBtn}
                            onClick={() => removeArrayItem("bullets", "bn", i)}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className={label}>English Bullets</label>
                        <button
                          className={addBtn}
                          onClick={() => addArrayItem("bullets", "en")}
                        >
                          + Add
                        </button>
                      </div>
                      {form.bullets.en.map((val, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input
                            className={inputBase}
                            value={val}
                            onChange={(e) =>
                              setArrayItem("bullets", "en", i, e.target.value)
                            }
                          />
                          <button
                            className={dangerBtn}
                            onClick={() => removeArrayItem("bullets", "en", i)}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Formula */}
                <div className="mt-8">
                  <h5 className="text-md font-semibold text-yellow-300 mb-3">
                    Formula Section
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={label}>Formula Title (BN)</label>
                      <input
                        className={inputBase}
                        value={form.formulaTitle.bn}
                        onChange={(e) =>
                          setBi("formulaTitle", "bn", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={label}>Formula Title (EN)</label>
                      <input
                        className={inputBase}
                        value={form.formulaTitle.en}
                        onChange={(e) =>
                          setBi("formulaTitle", "en", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h6 className="text-sm font-medium text-yellow-300 mb-3">
                      Formula Labels (6 items)
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={label}>BN Labels</label>
                        {form.formulaLabels.bn.map((val, i) => (
                          <input
                            key={`fl-bn-${i}`}
                            className={`${inputBase} mb-2`}
                            value={val}
                            onChange={(e) =>
                              setArrayItem(
                                "formulaLabels",
                                "bn",
                                i,
                                e.target.value,
                              )
                            }
                          />
                        ))}
                      </div>
                      <div>
                        <label className={label}>EN Labels</label>
                        {form.formulaLabels.en.map((val, i) => (
                          <input
                            key={`fl-en-${i}`}
                            className={`${inputBase} mb-2`}
                            value={val}
                            onChange={(e) =>
                              setArrayItem(
                                "formulaLabels",
                                "en",
                                i,
                                e.target.value,
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Table */}
              <div className="border-t border-yellow-700/30 pt-6">
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                  Example Table
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>Example Title (BN)</label>
                    <input
                      className={inputBase}
                      value={form.exampleTitle.bn}
                      onChange={(e) =>
                        setBi("exampleTitle", "bn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={label}>Example Title (EN)</label>
                    <input
                      className={inputBase}
                      value={form.exampleTitle.en}
                      onChange={(e) =>
                        setBi("exampleTitle", "en", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Example Headers */}
                <div className="mt-6">
                  <h5 className="text-md font-semibold text-yellow-300 mb-3">
                    Example Table Headers (6 Columns)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={label}>BN Headers</label>
                      {form.exTh.bn.map((val, i) => (
                        <input
                          key={`exth-bn-${i}`}
                          className={`${inputBase} mb-2`}
                          value={val}
                          onChange={(e) =>
                            setArrayItem("exTh", "bn", i, e.target.value)
                          }
                        />
                      ))}
                    </div>
                    <div>
                      <label className={label}>EN Headers</label>
                      {form.exTh.en.map((val, i) => (
                        <input
                          key={`exth-en-${i}`}
                          className={`${inputBase} mb-2`}
                          value={val}
                          onChange={(e) =>
                            setArrayItem("exTh", "en", i, e.target.value)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Rows */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-md font-semibold text-yellow-300">
                      Example Rows
                    </h5>
                    <button className={addBtn} onClick={addExRow}>
                      + Add Example Row
                    </button>
                  </div>

                  <div className="space-y-6">
                    {(form.exRows || []).map((r, idx) => (
                      <div
                        key={idx}
                        className="bg-black/50 border border-yellow-800/30 rounded-lg p-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="text-md font-semibold text-yellow-200">
                            Example Row #{idx + 1}
                          </h6>
                          <button
                            className={dangerBtn}
                            onClick={() => removeExRow(idx)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={label}>No</label>
                            <input
                              className={inputBase}
                              value={r.no}
                              onChange={(e) =>
                                setExRow(idx, "no", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className={label}>Win/Loss (wl)</label>
                            <input
                              className={inputBase}
                              value={r.wl}
                              onChange={(e) =>
                                setExRow(idx, "wl", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className={label}>Operation Cost (op)</label>
                            <input
                              className={inputBase}
                              value={r.op}
                              onChange={(e) =>
                                setExRow(idx, "op", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className={label}>Bonus</label>
                            <input
                              className={inputBase}
                              value={r.bonus}
                              onChange={(e) =>
                                setExRow(idx, "bonus", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className={label}>Agent Commission</label>
                            <input
                              className={inputBase}
                              value={r.agent}
                              onChange={(e) =>
                                setExRow(idx, "agent", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className={label}>Formula Text (BN)</label>
                          <textarea
                            className={textareaBase}
                            value={r.formula?.bn || ""}
                            onChange={(e) =>
                              setExRowBi(idx, "formula", "bn", e.target.value)
                            }
                          />
                        </div>
                        <div className="mt-4">
                          <label className={label}>Formula Text (EN)</label>
                          <textarea
                            className={textareaBase}
                            value={r.formula?.en || ""}
                            onChange={(e) =>
                              setExRowBi(idx, "formula", "en", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example Total */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={label}>Total Label (BN)</label>
                    <input
                      className={inputBase}
                      value={form.exTotalLabel.bn}
                      onChange={(e) =>
                        setBi("exTotalLabel", "bn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={label}>Total Label (EN)</label>
                    <input
                      className={inputBase}
                      value={form.exTotalLabel.en}
                      onChange={(e) =>
                        setBi("exTotalLabel", "en", e.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2 bg-black/50 border border-yellow-800/30 rounded-lg p-5">
                    <h5 className="text-md font-semibold text-yellow-300 mb-4">
                      Example Total Values
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className={label}>Total WL</label>
                        <input
                          className={inputBase}
                          value={form.exTotal.wl}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              exTotal: { ...p.exTotal, wl: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className={label}>Total OP</label>
                        <input
                          className={inputBase}
                          value={form.exTotal.op}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              exTotal: { ...p.exTotal, op: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className={label}>Total Bonus</label>
                        <input
                          className={inputBase}
                          value={form.exTotal.bonus}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              exTotal: { ...p.exTotal, bonus: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className={label}>Total Agent</label>
                        <input
                          className={inputBase}
                          value={form.exTotal.agent}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              exTotal: { ...p.exTotal, agent: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-yellow-700/30 pt-6">
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">
                  Close Button Text
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>Close (BN)</label>
                    <input
                      className={inputBase}
                      value={form.close.bn}
                      onChange={(e) => setBi("close", "bn", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={label}>Close (EN)</label>
                    <input
                      className={inputBase}
                      value={form.close.en}
                      onChange={(e) => setBi("close", "en", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===================== Reusable UI Components ===================== */
const Section = ({ title, children }) => (
  <div className="border-t border-yellow-700/30 pt-6">
    <h4 className="text-lg font-semibold text-yellow-300 mb-5">{title}</h4>
    {children}
  </div>
);

const Field = ({ label, value, onChange }) => (
  <div>
    <label className={label}>{label}</label>
    <input
      className={inputBase}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const BiField = ({ title, bn, en, onBn, onEn }) => (
  <div className="bg-black/50 border border-yellow-800/30 rounded-lg p-5">
    <h5 className="text-md font-semibold text-yellow-300 mb-4">{title}</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className={label}>Bangla</label>
        <input
          className={inputBase}
          value={bn ?? ""}
          onChange={(e) => onBn(e.target.value)}
        />
      </div>
      <div>
        <label className={label}>English</label>
        <input
          className={inputBase}
          value={en ?? ""}
          onChange={(e) => onEn(e.target.value)}
        />
      </div>
    </div>
  </div>
);

const TwoColArray = ({
  leftTitle,
  rightTitle,
  left,
  right,
  onLeft,
  onRight,
  fixedCount = 6,
  hint,
}) => (
  <div className="bg-black/50 border border-yellow-800/30 rounded-lg p-5">
    <div className="flex justify-between items-center mb-4">
      <h5 className="text-md font-semibold text-yellow-300">
        {leftTitle} / {rightTitle}
      </h5>
      {hint && <p className="text-xs text-yellow-400/70">{hint}</p>}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-3">
        <label className={label}>{leftTitle}</label>
        {Array.from({ length: fixedCount }).map((_, i) => (
          <input
            key={`left-${i}`}
            className={inputBase}
            value={left?.[i] ?? ""}
            onChange={(e) => onLeft(i, e.target.value)}
            placeholder={`Item ${i + 1}`}
          />
        ))}
      </div>

      <div className="space-y-3">
        <label className={label}>{rightTitle}</label>
        {Array.from({ length: fixedCount }).map((_, i) => (
          <input
            key={`right-${i}`}
            className={inputBase}
            value={right?.[i] ?? ""}
            onChange={(e) => onRight(i, e.target.value)}
            placeholder={`Item ${i + 1}`}
          />
        ))}
      </div>
    </div>
  </div>
);

export default AffCommissionController;
