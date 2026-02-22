import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaSearch, FaSyncAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
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

const chipClass = (status) => {
  if (status === "approved")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (status === "rejected")
    return "bg-red-500/15 text-red-300 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-300 border-yellow-400/30";
};

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-black/10">
    <div className="text-[12px] font-bold text-black/50">{k}</div>
    <div className="text-[13px] font-extrabold text-black/80 text-right break-all">
      {v}
    </div>
  </div>
);

const DepositHistory = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("all"); // all|pending|approved|rejected
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [expandedId, setExpandedId] = useState("");

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const statusLabel = (s) => {
    if (s === "approved") return t("অনুমোদিত", "Approved");
    if (s === "rejected") return t("বাতিল", "Rejected");
    return t("পেন্ডিং", "Pending");
  };

  const fetchData = async (page = meta.page) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      const { data } = await api.get("/api/deposit-requests/my", { params });

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
          t("ডিপোজিট হিস্টরি লোড করা যায়নি", "Failed to load deposit history"),
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
      items = items.filter((x) => String(x?.status || "pending") === status);
    }

    if (q) {
      items = items.filter((x) => {
        const methodId = String(x?.methodId || "").toLowerCase();
        const channelId = String(x?.channelId || "").toLowerCase();
        const promoId = String(x?.promoId || "").toLowerCase();

        const fields = x?.fields || {};
        const trxId = String(fields?.trxId || fields?.transactionId || "").toLowerCase();
        const sender = String(fields?.senderNumber || fields?.phone || "").toLowerCase();

        return (
          methodId.includes(q) ||
          channelId.includes(q) ||
          promoId.includes(q) ||
          trxId.includes(q) ||
          sender.includes(q)
        );
      });
    }

    return items;
  }, [list, status, q]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-black">
              {t("ডিপোজিট হিস্টরি", "Deposit History")}
            </div>
            <div className="mt-1 text-[12px] text-black/55">
              {t(
                "আপনার ডিপোজিট রিকোয়েস্টসমূহ (পেন্ডিং / অনুমোদিত / বাতিল)।",
                "Your deposit requests (pending / approved / rejected).",
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(meta.page)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/15 bg-white hover:bg-black/[0.03] transition text-[13px] font-extrabold"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              {t("রিফ্রেশ", "Refresh")}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_140px] gap-3">
            {/* Search */}
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t(
                  "সার্চ: মেথড / চ্যানেল / ট্রান্স আইডি / সেন্ডার...",
                  "Search: method / channel / trxId / sender...",
                )}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-black/15 text-black placeholder-black/30 outline-none focus:ring-2 focus:ring-black/10"
              />
            </form>

            {/* Status filter */}
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
                <option value="pending">{t("পেন্ডিং", "Pending")}</option>
                <option value="approved">{t("অনুমোদিত", "Approved")}</option>
                <option value="rejected">{t("বাতিল", "Rejected")}</option>
              </select>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between lg:justify-end gap-3 rounded-xl bg-black/[0.03] border border-black/10 px-4 py-3">
              <div className="text-[12px] text-black/50">{t("দেখাচ্ছে", "Shown")}</div>
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

                  const statusText = String(r?.status || "pending");

                  const amount = Number(r?.amount || 0);
                  const bonus = Number(r?.calc?.totalBonus || 0);
                  const turnover = Number(r?.calc?.targetTurnover || 0);
                  const credited = Number(r?.calc?.creditedAmount || 0);

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
                                {String(r?.methodId || "—").toUpperCase()}
                              </span>
                              <span className="text-[12px] text-black/45">
                                {t("চ্যানেল:", "Channel:")} {r?.channelId || "—"}
                              </span>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                                  statusText,
                                )}`}
                              >
                                {statusLabel(statusText)}
                              </span>
                            </div>

                            <div className="mt-1 text-[12px] text-black/55">
                              {createdAt}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-[12px] text-black/45">
                                {t("অ্যামাউন্ট", "Amount")}
                              </div>
                              <div className="text-[14px] font-extrabold text-black">
                                {money(amount)}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[12px] text-black/45">
                                {t("বোনাস", "Bonus")}
                              </div>
                              <div className="text-[14px] font-extrabold text-black">
                                {money(bonus)}
                              </div>
                            </div>

                            <div className="text-right hidden sm:block">
                              <div className="text-[12px] text-black/45">
                                {t("টার্নওভার", "Turnover")}
                              </div>
                              <div className="text-[14px] font-extrabold text-black">
                                {money(turnover)}
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
                              {/* Summary */}
                              <div className="rounded-xl border border-black/10 bg-white p-4">
                                <div className="text-[13px] font-extrabold text-black">
                                  {t("সামারি", "Summary")}
                                </div>

                                <div className="mt-3 space-y-2">
                                  <FieldRow k={t("ডিপোজিট অ্যামাউন্ট", "Deposit Amount")} v={money(amount)} />
                                  <FieldRow k={t("প্রোমো বোনাস", "Promo Bonus")} v={money(r?.calc?.promoBonus || 0)} />
                                  <FieldRow k={t("চ্যানেল বোনাস", "Channel Bonus")} v={money(r?.calc?.percentBonus || 0)} />
                                  <FieldRow k={t("মোট বোনাস", "Total Bonus")} v={money(bonus)} />
                                  <FieldRow
                                    k={t("টার্নওভার মাল্টিপ্লায়ার", "Turnover Multiplier")}
                                    v={`x${r?.calc?.turnoverMultiplier ?? 13}`}
                                  />
                                  <FieldRow k={t("টার্গেট টার্নওভার", "Target Turnover")} v={money(turnover)} />
                                  <FieldRow
                                    k={t("ক্রেডিটেড অ্যামাউন্ট", "Credited Amount")}
                                    v={statusText === "approved" ? money(credited) : "—"}
                                  />
                                </div>

                                {r?.adminNote ? (
                                  <div className="mt-4 rounded-xl border border-black/10 bg-white p-3">
                                    <div className="text-[12px] font-extrabold text-black/70">
                                      {t("এডমিন নোট", "Admin Note")}
                                    </div>
                                    <div className="mt-1 text-[13px] text-black/80">
                                      {r.adminNote}
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              {/* Submitted Fields */}
                              <div className="rounded-xl border border-black/10 bg-white p-4">
                                <div className="text-[13px] font-extrabold text-black">
                                  {t("সাবমিট করা তথ্য", "Submitted Info")}
                                </div>

                                <div className="mt-3 rounded-xl border border-black/10 bg-white px-3 py-2">
                                  {r?.fields && Object.keys(r.fields).length ? (
                                    Object.keys(r.fields).map((k) => (
                                      <FieldRow key={k} k={k} v={String(r.fields[k] ?? "")} />
                                    ))
                                  ) : (
                                    <div className="py-3 text-[13px] text-black/55">
                                      {t("কোনো তথ্য সাবমিট করা হয়নি।", "No submitted fields.")}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 text-[12px] text-black/50">
                                  {t("প্রোমো:", "Promo:")}{" "}
                                  <span className="font-extrabold">{r?.promoId || "none"}</span>
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
                {t("কোনো ডিপোজিট হিস্টরি পাওয়া যায়নি।", "No deposit history found.")}
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

export default DepositHistory;