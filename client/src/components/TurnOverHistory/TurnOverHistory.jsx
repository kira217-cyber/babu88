import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import Loading from "../Loading/Loading";

const money = (n, symbol = "৳") => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return `${symbol} 0.00`;
  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  const s = String(status || "running").toLowerCase();
  if (s === "completed")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  return "bg-yellow-500/15 text-black border-yellow-400/30";
};

const FieldRow = ({ k, v, noBorder = false }) => (
  <div
    className={`flex items-start justify-between gap-4 py-2 ${
      noBorder ? "" : "border-b border-black/10"
    }`}
  >
    <div className="text-[12px] font-bold text-black/50">{k}</div>
    <div className="text-[13px] font-extrabold text-black/80 text-right break-all">
      {v}
    </div>
  </div>
);

const TurnOverHistory = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("all"); // all|running|completed
  const [sourceType, setSourceType] = useState("all"); // all|deposit|redeem|auto-deposit
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [expandedId, setExpandedId] = useState("");

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const statusLabel = (s) => {
    const st = String(s || "").toLowerCase();
    if (st === "completed") return t("সম্পন্ন", "Completed");
    return t("চলমান", "Running");
  };

  const sourceLabel = (type) => {
    const st = String(type || "").toLowerCase();
    if (st === "redeem") return t("রিডিম", "Redeem");
    if (st === "auto-deposit") return t("অটো ডিপোজিট", "Auto Deposit");
    return t("ডিপোজিট", "Deposit");
  };

  const sourceNote = (type) => {
    const st = String(type || "").toLowerCase();

    if (st === "redeem") {
      return t(
        "এই টার্নওভারটি রিডিম থেকে তৈরি হয়েছে। Required amount পূরণ হলে এটি completed হবে।",
        "This turnover was created from redeem. It will be completed when the required amount is fulfilled.",
      );
    }

    if (st === "auto-deposit") {
      return t(
        "এই টার্নওভারটি অটো ডিপোজিট থেকে তৈরি হয়েছে। বোনাস থাকলে credited amount এবং multiplier অনুযায়ী turnover target নির্ধারিত হয়েছে।",
        "This turnover was created from auto deposit. If a bonus was used, the turnover target was calculated based on credited amount and multiplier.",
      );
    }

    return t(
      "এই টার্নওভারটি ডিপোজিট থেকে তৈরি হয়েছে। আপনি যত বেশি খেলবেন, progress বাড়বে।",
      "This turnover was created from deposit. As you play more, the progress will increase.",
    );
  };

  const fetchData = async (page = meta.page) => {
    try {
      setLoading(true);

      const params = { page, limit: meta.limit };
      const { data } = await api.get("/api/turnovers/my", { params });

      const items = Array.isArray(data?.data) ? data.data : [];
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
    let items = Array.isArray(list) ? list : [];

    if (status !== "all") {
      items = items.filter(
        (x) => String(x?.status || "running").toLowerCase() === status,
      );
    }

    if (sourceType !== "all") {
      items = items.filter(
        (x) => String(x?.sourceType || "").toLowerCase() === sourceType,
      );
    }

    if (q) {
      items = items.filter((x) => {
        const id = String(x?._id || "").toLowerCase();
        const st = String(x?.status || "").toLowerCase();
        const srcType = String(x?.sourceType || "").toLowerCase();
        const srcId = String(x?.sourceId || "").toLowerCase();
        const required = String(x?.required ?? "").toLowerCase();
        const progress = String(x?.progress ?? "").toLowerCase();
        const credited = String(x?.creditedAmount ?? "").toLowerCase();
        return (
          id.includes(q) ||
          st.includes(q) ||
          srcType.includes(q) ||
          srcId.includes(q) ||
          required.includes(q) ||
          progress.includes(q) ||
          credited.includes(q)
        );
      });
    }

    return items;
  }, [list, status, sourceType, q]);

  return (
    <div className="w-full">
      <Loading open={loading} text={t("লোড হচ্ছে...", "Loading...")} />

      <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-black">
              {t("টার্নওভার হিস্টরি", "Turnover History")}
            </div>
            <div className="mt-1 text-[12px] text-black/55">
              {t(
                "ডিপোজিট, অটো ডিপোজিট বা রিডিম থেকে তৈরি হওয়া আপনার টার্নওভার তালিকা।",
                "Your turnover list created from deposit, auto deposit or redeem.",
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_200px_140px] gap-3">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t(
                  "সার্চ: source / required / progress / id...",
                  "Search: source / required / progress / id...",
                )}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-black/15 text-black placeholder-black/30 outline-none focus:ring-2 focus:ring-black/10"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-black/60">
                {t("স্ট্যাটাস", "Status")}
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-white border border-black/15 text-black outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="all">{t("সবগুলো", "All")}</option>
                <option value="running">{t("চলমান", "Running")}</option>
                <option value="completed">{t("সম্পন্ন", "Completed")}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-black/60">
                {t("সোর্স", "Source")}
              </div>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-white border border-black/15 text-black outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="all">{t("সবগুলো", "All")}</option>
                <option value="deposit">{t("ডিপোজিট", "Deposit")}</option>
                <option value="auto-deposit">
                  {t("অটো ডিপোজিট", "Auto Deposit")}
                </option>
                <option value="redeem">{t("রিডিম", "Redeem")}</option>
              </select>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-3 rounded-xl bg-black/[0.03] border border-black/10 px-4 py-3">
              <div className="text-[12px] text-black/50">
                {t("দেখাচ্ছে", "Shown")}
              </div>
              <div className="text-[14px] font-extrabold text-black">
                {filtered.length}
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="py-10 text-center text-[13px] text-black/60">
                {t("লোড হচ্ছে...", "Loading...")}
              </div>
            ) : filtered.length ? (
              <div className="divide-y divide-black/10">
                {filtered.map((r) => {
                  const isOpen = expandedId === r._id;

                  const createdAt = r?.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "—";

                  const st = String(r?.status || "running");
                  const required = Number(r?.required || 0);
                  const progress = Number(r?.progress || 0);
                  const remaining = Math.max(0, required - progress);
                  const credited = Number(r?.creditedAmount || 0);
                  const srcType = String(r?.sourceType || "deposit");
                  const srcId = String(r?.sourceId || "—");

                  const percent =
                    required > 0
                      ? Math.min(100, Math.floor((progress / required) * 100))
                      : 0;

                  return (
                    <div key={r._id} className="bg-white">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? "" : r._id)}
                        className="w-full text-left px-4 sm:px-5 py-4 hover:bg-black/[0.02] transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-extrabold text-black">
                                {t("সোর্স:", "Source:")} {sourceLabel(srcType)}
                              </span>

                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                                  st,
                                )}`}
                              >
                                {statusLabel(st)}
                              </span>

                              <span className="text-[12px] text-black/45 break-all">
                                {t("Source ID:", "Source ID:")} {srcId}
                              </span>
                            </div>

                            <div className="mt-1 text-[12px] text-black/55">
                              {createdAt}
                            </div>

                            <div className="mt-3 max-w-[360px]">
                              <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    st === "completed"
                                      ? "bg-emerald-500"
                                      : "bg-yellow-400"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="mt-1 text-[11px] font-bold text-black/55">
                                {t("প্রোগ্রেস", "Progress")}: {percent}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-[12px] text-black/45">
                                {t("রিকোয়ার্ড", "Required")}
                              </div>
                              <div className="text-[14px] font-extrabold text-black">
                                {money(required)}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[12px] text-black/45">
                                {t("প্রোগ্রেস", "Progress")}
                              </div>
                              <div className="text-[14px] font-extrabold text-black">
                                {money(progress)}
                              </div>
                            </div>

                            <div className="ml-2 text-black/60">
                              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4">
                          <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="rounded-xl border border-black/10 bg-white p-4">
                                <div className="text-[13px] font-extrabold text-black">
                                  {t("সামারি", "Summary")}
                                </div>

                                <div className="mt-3 space-y-2">
                                  <FieldRow
                                    k={t("স্ট্যাটাস", "Status")}
                                    v={statusLabel(st)}
                                  />
                                  <FieldRow
                                    k={t("সোর্স টাইপ", "Source Type")}
                                    v={sourceLabel(srcType)}
                                  />
                                  <FieldRow
                                    k={t("সোর্স আইডি", "Source ID")}
                                    v={srcId}
                                  />
                                  <FieldRow
                                    k={t("ক্রেডিটেড", "Credited")}
                                    v={money(credited)}
                                  />
                                  <FieldRow
                                    k={t("রিকোয়ার্ড", "Required")}
                                    v={money(required)}
                                  />
                                  <FieldRow
                                    k={t("প্রোগ্রেস", "Progress")}
                                    v={money(progress)}
                                  />
                                  <FieldRow
                                    k={t("বাকি", "Remaining")}
                                    v={money(remaining)}
                                  />
                                  <FieldRow
                                    k={t("কমপ্লিশন", "Completion")}
                                    v={`${percent}%`}
                                  />
                                  <FieldRow
                                    k={t("টার্নওভার আইডি", "Turnover ID")}
                                    v={String(r?._id || "—")}
                                    noBorder
                                  />
                                </div>

                                {r?.completedAt ? (
                                  <div className="mt-4 rounded-xl border border-black/10 bg-white p-3">
                                    <div className="text-[12px] font-extrabold text-black/70">
                                      {t("কমপ্লিটেড", "Completed")}
                                    </div>
                                    <div className="mt-1 text-[13px] text-black/80">
                                      {new Date(r.completedAt).toLocaleString()}
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              <div className="rounded-xl border border-black/10 bg-white p-4">
                                <div className="text-[13px] font-extrabold text-black">
                                  {t("নোট", "Note")}
                                </div>
                                <div className="mt-3 text-[13px] text-black/65 leading-relaxed">
                                  {sourceNote(srcType)}
                                </div>

                                <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-3">
                                  <div className="text-[12px] font-extrabold text-black/70">
                                    {t("দ্রুত তথ্য", "Quick Info")}
                                  </div>

                                  <div className="mt-2 space-y-2 text-[12px] text-black/65">
                                    <div>
                                      •{" "}
                                      {st === "completed"
                                        ? t(
                                            "এই টার্নওভার সম্পন্ন হয়েছে।",
                                            "This turnover has been completed.",
                                          )
                                        : t(
                                            "এই টার্নওভার এখনো চলমান আছে।",
                                            "This turnover is still running.",
                                          )}
                                    </div>
                                    <div>
                                      •{" "}
                                      {t(
                                        `এখন পর্যন্ত ${money(progress)} progress হয়েছে।`,
                                        `${money(progress)} progress has been completed so far.`,
                                      )}
                                    </div>
                                    <div>
                                      •{" "}
                                      {remaining > 0
                                        ? t(
                                            `আরও ${money(
                                              remaining,
                                            )} বাকি আছে completed হতে।`,
                                            `${money(
                                              remaining,
                                            )} is remaining to complete it.`,
                                          )
                                        : t(
                                            "আর কোনো বাকি নেই।",
                                            "Nothing is remaining.",
                                          )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-[13px] text-black/60">
                {t("কোনো টার্নওভার পাওয়া যায়নি।", "No turnover history found.")}
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
                  ${
                    meta.page <= 1 || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-black/[0.03]"
                  }`}
              >
                {t("আগের", "Prev")}
              </button>
              <button
                onClick={() => fetchData(Math.min(pageCount, meta.page + 1))}
                disabled={meta.page >= pageCount || loading}
                className={`px-4 py-2 rounded-xl border border-black/15 font-extrabold text-[13px] transition
                  ${
                    meta.page >= pageCount || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-black/[0.03]"
                  }`}
              >
                {t("পরের", "Next")}
              </button>
            </div>
          </div>

          <div className="mt-2 text-[12px] text-black/50">
            {t(
              "নোট: আপনার API যদি full list return করে, তাহলে filtering client-side এ হবে।",
              "Note: If your API returns the full list, filtering will be handled on the client side.",
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnOverHistory;
