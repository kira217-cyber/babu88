import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// status: running | completed | expired (example)
const chipClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (s === "expired" || s === "cancelled")
    return "bg-red-500/15 text-red-300 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-300 border-yellow-400/30"; // running
};

const TurnOverHistory = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const statusLabel = (s) => {
    const st = String(s || "").toLowerCase();
    if (st === "completed") return t("সম্পন্ন", "Completed");
    if (st === "expired" || st === "cancelled") return t("বাতিল", "Expired");
    return t("চলমান", "Running");
  };

  const fetchData = async (page = meta.page) => {
    try {
      setLoading(true);
      const params = { page, limit: meta.limit };

      // ✅ আপনার আসল endpoint যেটা, সেটা রাখবেন
      const { data } = await api.get("/api/turnovers/my", { params });

      const items = data?.data || [];
      const total = data?.meta?.total ?? items.length;

      setList(items);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          t(
            "টার্নওভার হিস্টরি লোড করা যায়নি",
            "Failed to load turnover history",
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    setQ(qInput.trim().toLowerCase());
  };

  const filtered = useMemo(() => {
    const items = Array.isArray(list) ? list : [];
    if (!q) return items;

    return items.filter((x) => {
      const id = String(x?._id || "").toLowerCase();
      const status = String(x?.status || "").toLowerCase();
      const depReq = String(x?.depositRequest || "").toLowerCase();

      // numbers searchable too (required/progress/creditedAmount)
      const required = String(x?.required ?? "").toLowerCase();
      const progress = String(x?.progress ?? "").toLowerCase();
      const credited = String(x?.creditedAmount ?? "").toLowerCase();

      return (
        id.includes(q) ||
        status.includes(q) ||
        depReq.includes(q) ||
        required.includes(q) ||
        progress.includes(q) ||
        credited.includes(q)
      );
    });
  }, [list, q]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-black">
              {t("টার্নওভার হিস্টরি", "Turnover History")}
            </div>
            <div className="mt-1 text-[12px] text-black/55">
              {t(
                "আপনার টার্নওভার টার্গেট (required) এবং অগ্রগতি (progress) এখানে দেখাবে।",
                "Your turnover target (required) and progress will show here.",
              )}
            </div>
          </div>

          <button
            onClick={() => fetchData(meta.page)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/15 bg-white hover:bg-black/[0.03] transition text-[13px] font-extrabold"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            {t("রিফ্রেশ", "Refresh")}
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_140px] gap-3">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t(
                  "সার্চ: status / required / progress / credited / id...",
                  "Search: status / required / progress / credited / id...",
                )}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-black/15 text-black placeholder-black/30 outline-none focus:ring-2 focus:ring-black/10"
              />
            </form>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.03] border border-black/10 px-4 py-3">
              <div className="text-[12px] text-black/50">
                {t("দেখাচ্ছে", "Shown")}
              </div>
              <div className="text-[14px] font-extrabold text-black">
                {filtered.length}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="py-10 text-center text-[13px] text-black/60">
                {t("লোড হচ্ছে...", "Loading...")}
              </div>
            ) : filtered.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full">
                  <thead className="bg-black/[0.03]">
                    <tr className="text-left text-[12px] uppercase tracking-wider text-black/50">
                      <th className="px-5 py-4">{t("স্ট্যাটাস", "Status")}</th>
                      <th className="px-5 py-4">
                        {t("ক্রেডিটেড", "Credited")}
                      </th>
                      <th className="px-5 py-4">
                        {t("রিকোয়ার্ড", "Required")}
                      </th>
                      <th className="px-5 py-4">
                        {t("প্রোগ্রেস", "Progress")}
                      </th>
                      <th className="px-5 py-4">{t("বাকি", "Remaining")}</th>
                      <th className="px-5 py-4">
                        {t("ডিপোজিট রিকোয়েস্ট", "Deposit Request")}
                      </th>
                      <th className="px-5 py-4">{t("তারিখ", "Date")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((x) => {
                      const required = Number(x?.required || 0);
                      const progress = Number(x?.progress || 0);
                      const remaining = Math.max(0, required - progress);
                      const credited = Number(x?.creditedAmount || 0);
                      const status = String(x?.status || "running");
                      const createdAt = x?.createdAt
                        ? new Date(x.createdAt).toLocaleString()
                        : "—";

                      return (
                        <tr
                          key={x._id}
                          className="border-t border-black/10 hover:bg-black/[0.02] transition"
                        >
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                                status,
                              )}`}
                            >
                              {statusLabel(status)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-extrabold text-black">
                              {money(credited)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-extrabold text-black">
                              {money(required)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-extrabold text-black">
                              {money(progress)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-extrabold text-black">
                              {money(remaining)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[12px] font-bold text-black/70 break-all">
                              {String(x?.depositRequest || "—")}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[12px] text-black/60">
                              {createdAt}
                            </div>
                            {x?.completedAt ? (
                              <div className="text-[12px] text-black/50">
                                {t("কমপ্লিট:", "Completed:")}{" "}
                                {new Date(x.completedAt).toLocaleString()}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-[13px] text-black/60">
                {t(
                  "কোনো টার্নওভার হিস্টরি পাওয়া যায়নি।",
                  "No turnover history found.",
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-[12px] text-black/55">
              {t("পেজ", "Page")}{" "}
              <span className="font-extrabold text-black">{meta.page}</span>{" "}
              {t("এর", "of")}{" "}
              <span className="font-extrabold text-black">{pageCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(Math.max(1, meta.page - 1))}
                disabled={meta.page <= 1 || loading}
                className={`px-4 py-2 rounded-xl border border-black/15 font-extrabold text-[13px] transition
                  ${meta.page <= 1 || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-black/[0.03]"}`}
              >
                {t("আগের", "Prev")}
              </button>
              <button
                onClick={() => fetchData(Math.min(pageCount, meta.page + 1))}
                disabled={meta.page >= pageCount || loading}
                className={`px-4 py-2 rounded-xl border border-black/15 font-extrabold text-[13px] transition
                  ${meta.page >= pageCount || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-black/[0.03]"}`}
              >
                {t("পরের", "Next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnOverHistory;
