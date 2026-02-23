import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "PAID")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (status === "FAILED")
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

const AutoDepositHistory = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const user = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);
  const userId = user?._id;

  const [all, setAll] = useState([]); // full list from server
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState("");

  // ✅ client-side pagination (because your API doesn't return meta)
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const pageItems = useMemo(() => {
    const start = (meta.page - 1) * meta.limit;
    const end = start + meta.limit;
    return all.slice(start, end);
  }, [all, meta.page, meta.limit]);

  const fetchData = async (page = meta.page) => {
    try {
      if (!isAuthed || !userId) {
        toast.error(t("অনুগ্রহ করে লগইন করুন", "Please login"));
        return;
      }

      setLoading(true);

      // ✅ your provided API
      const { data } = await api.get(`/api/auto-deposit/history/${userId}`);

      const items = Array.isArray(data?.data) ? data.data : [];
      setAll(items);
      setMeta((m) => ({
        ...m,
        page: Math.max(
          1,
          Math.min(page, Math.max(1, Math.ceil(items.length / m.limit))),
        ),
        total: items.length,
      }));
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          t(
            "অটো ডিপোজিট হিস্টরি লোড করা যায়নি",
            "Failed to load auto deposit history",
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line
  }, [isAuthed, userId]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between">
          <div>
            <div className="text-[18px] font-extrabold text-black">
              {t("অটো ডিপোজিট হিস্টরি", "Auto Deposit History")}
            </div>
            <div className="mt-1 text-[12px] text-black/55">
              {t(
                "অটোমেটিক ডিপোজিটের সম্পূর্ণ ইতিহাস।",
                "Your automatic deposit transactions.",
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

        {/* List */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="py-10 text-center text-[13px] text-black/60">
                {t("লোড হচ্ছে...", "Loading...")}
              </div>
            ) : pageItems.length ? (
              <div className="divide-y divide-black/10">
                {pageItems.map((r) => {
                  const isOpen = expandedId === r._id;

                  const createdAt = r?.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "—";

                  return (
                    <div key={r._id}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? "" : r._id)}
                        className="w-full text-left px-4 sm:px-5 py-4 hover:bg-black/[0.02] transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-extrabold text-black">
                                OraclePay
                              </span>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                                  r.status,
                                )}`}
                              >
                                {r.status}
                              </span>

                              {r.balanceAdded === true ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border bg-emerald-500/10 text-emerald-600 border-emerald-500/25">
                                  {t("ব্যালেন্স অ্যাডেড", "Balance Added")}
                                </span>
                              ) : null}
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
                                {money(r.amount)}
                              </div>
                            </div>

                            <div className="text-black/60">
                              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4">
                          <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                            <div className="rounded-xl border border-black/10 bg-white p-4">
                              <div className="text-[13px] font-extrabold text-black mb-3">
                                {t("ডিটেইলস", "Details")}
                              </div>

                              <FieldRow
                                k={t("ইনভয়েস", "Invoice")}
                                v={r.invoiceNumber || "—"}
                              />
                              <FieldRow
                                k={t("ব্যাংক", "Bank")}
                                v={r.bank || "—"}
                              />
                              <FieldRow
                                k={t("ট্রান্স আইডি", "Transaction ID")}
                                v={r.transactionId || "—"}
                              />
                              <FieldRow
                                k={t("সেশন কোড", "Session Code")}
                                v={r.sessionCode || "—"}
                              />
                              <FieldRow
                                k={t("পেইড টাইম", "Paid At")}
                                v={
                                  r.paidAt
                                    ? new Date(r.paidAt).toLocaleString()
                                    : "—"
                                }
                              />

                              {/* Footprint link (new tab) */}
                              {r.footprint && (
                                <div className="pt-3">
                                  <a
                                    href={r.footprint}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-600 hover:underline"
                                  >
                                    <FaExternalLinkAlt />
                                    {t(
                                      "পেমেন্ট লিংক দেখুন",
                                      "View Payment Link",
                                    )}
                                  </a>
                                </div>
                              )}
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
                {t(
                  "কোনো অটো ডিপোজিট হিস্টরি পাওয়া যায়নি।",
                  "No auto deposit history found.",
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-[12px] text-black/55">
              {t("পেজ", "Page")}{" "}
              <span className="font-extrabold text-black">{meta.page}</span>{" "}
              {t("এর", "of")}{" "}
              <span className="font-extrabold text-black">{pageCount}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setMeta((m) => ({ ...m, page: Math.max(1, m.page - 1) }))
                }
                disabled={meta.page <= 1 || loading}
                className="px-4 py-2 rounded-xl border border-black/15 font-extrabold text-[13px] disabled:opacity-50"
              >
                {t("আগের", "Prev")}
              </button>
              <button
                onClick={() =>
                  setMeta((m) => ({
                    ...m,
                    page: Math.min(pageCount, m.page + 1),
                  }))
                }
                disabled={meta.page >= pageCount || loading}
                className="px-4 py-2 rounded-xl border border-black/15 font-extrabold text-[13px] disabled:opacity-50"
              >
                {t("পরের", "Next")}
              </button>
            </div>
          </div>

          {/* Extra hint */}
          <div className="mt-2 text-[12px] text-black/50">
            {t(
              "নোট: এই API সার্ভার সাইডে pagination দেয় না, তাই client-side pagination ব্যবহার করা হচ্ছে।",
              "Note: This API returns full list; pagination is handled on the client.",
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDepositHistory;
