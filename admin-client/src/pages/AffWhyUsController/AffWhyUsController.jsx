import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const makeDefaultItems = () => [
  { titleBn: "", titleEn: "", descBn: "", descEn: "" },
  { titleBn: "", titleEn: "", descBn: "", descEn: "" },
  { titleBn: "", titleEn: "", descBn: "", descEn: "" },
  { titleBn: "", titleEn: "", descBn: "", descEn: "" },
];

const AffWhyUsController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [form, setForm] = useState({
    sectionTitleBn: "",
    sectionTitleEn: "",
    items: makeDefaultItems(),
  });

  const sectionCls =
    "bg-[#121212] border border-white/10 rounded-xl p-4 sm:p-6 text-white";
  const btnCls =
    "px-4 py-2 rounded-lg font-bold text-sm transition border border-white/10";
  const primaryBtn = `${btnCls} bg-[#f5b400] text-black hover:bg-[#e2a800]`;
  const ghostBtn = `${btnCls} bg-white/10 text-white hover:bg-white/15`;
  const inputCls =
    "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20";
  const labelCls = "text-xs text-white/70 mb-1";

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-whyus");
      if (data?._id) {
        setDocId(data._id);
        setForm({
          sectionTitleBn: data.sectionTitleBn || "",
          sectionTitleEn: data.sectionTitleEn || "",
          items: data.items?.length ? data.items : makeDefaultItems(),
        });
      } else {
        setDocId(null);
        setForm({
          sectionTitleBn: "",
          sectionTitleEn: "",
          items: makeDefaultItems(),
        });
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load WhyUs config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setItem = (idx, key, value) => {
    setForm((p) => {
      const items = [...p.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...p, items };
    });
  };

  const save = async () => {
    try {
      setSaving(true);

      const payload = {
        sectionTitleBn: form.sectionTitleBn,
        sectionTitleEn: form.sectionTitleEn,
        items: (form.items || []).map((x) => ({
          titleBn: x.titleBn || "",
          titleEn: x.titleEn || "",
          descBn: x.descBn || "",
          descEn: x.descEn || "",
        })),
      };

      let res;
      if (docId) {
        res = await api.put(`/api/aff-whyus/${docId}`, payload);
        toast.success("WhyUs updated");
      } else {
        res = await api.post("/api/aff-whyus", payload);
        toast.success("WhyUs created");
      }

      if (res?.data?._id) setDocId(res.data._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    try {
      if (!docId) return toast.info("Nothing to delete");
      await api.delete(`/api/aff-whyus/${docId}`);
      toast.success("Deleted");
      setDocId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <p>Loading WhyUs config...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold">Aff WhyUs Controller</h2>
          <p className="text-xs text-white/60 mt-1">
            WhyUs section এর text এখানে manage হবে (BN/EN)
          </p>
        </div>

        <div className="flex gap-2">
          <button className={primaryBtn} onClick={save} disabled={saving}>
            {saving ? "Saving..." : docId ? "Update" : "Create"}
          </button>
          <button className={ghostBtn} onClick={del}>
            Delete
          </button>
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className="font-extrabold mb-4">Section Title</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div>
            <p className={labelCls}>Title (BN)</p>
            <input
              className={inputCls}
              value={form.sectionTitleBn}
              onChange={(e) =>
                setForm((p) => ({ ...p, sectionTitleBn: e.target.value }))
              }
              placeholder="কেন BABU88?"
            />
          </div>
          <div>
            <p className={labelCls}>Title (EN)</p>
            <input
              className={inputCls}
              value={form.sectionTitleEn}
              onChange={(e) =>
                setForm((p) => ({ ...p, sectionTitleEn: e.target.value }))
              }
              placeholder="Why BABU88?"
            />
          </div>
        </div>

        <h3 className="font-extrabold mb-4">Items (4)</h3>

        <div className="space-y-4">
          {form.items.map((it, idx) => (
            <div
              key={idx}
              className="bg-black/30 border border-white/10 rounded-lg p-4"
            >
              <p className="text-sm font-bold text-white/80 mb-3">
                Item #{idx + 1} (Client icon fixed)
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className={labelCls}>Item Title (BN)</p>
                  <input
                    className={inputCls}
                    value={it.titleBn}
                    onChange={(e) => setItem(idx, "titleBn", e.target.value)}
                  />
                </div>
                <div>
                  <p className={labelCls}>Item Title (EN)</p>
                  <input
                    className={inputCls}
                    value={it.titleEn}
                    onChange={(e) => setItem(idx, "titleEn", e.target.value)}
                  />
                </div>

                <div>
                  <p className={labelCls}>Item Desc (BN)</p>
                  <textarea
                    className={`${inputCls} min-h-[90px]`}
                    value={it.descBn}
                    onChange={(e) => setItem(idx, "descBn", e.target.value)}
                  />
                </div>
                <div>
                  <p className={labelCls}>Item Desc (EN)</p>
                  <textarea
                    className={`${inputCls} min-h-[90px]`}
                    value={it.descEn}
                    onChange={(e) => setItem(idx, "descEn", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-white/50">
          Note: Client side icon order fixed থাকবে: 1) DollarSign 2) Lock 3) Smartphone 4) BarChart3
        </p>
      </div>

      <div className="h-10" />
    </div>
  );
};

export default AffWhyUsController;
