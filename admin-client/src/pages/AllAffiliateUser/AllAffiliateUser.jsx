import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const fetchAffiliates = async ({ page, limit, search }) => {
  const { data } = await api.get("/api/admin/affiliates", {
    params: { page, limit, search },
  });
  return data; // { items, page, limit, totalItems, totalPages }
};

const AllAffiliateUser = () => {
  const navigate = useNavigate();

  // ─── States ────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal states
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gameLossCommission: "",
    depositCommission: "",
    referCommission: "",
    gameWinCommission: "",
  });

  // ─── Debounce search ───────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchText]);

  // ─── Data fetching ─────────────────────────────────────────
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-affiliates", page, debouncedSearch],
    queryFn: () => fetchAffiliates({ page, limit, search: debouncedSearch }),
    staleTime: 12 * 1000,
    retry: 1,
  });

  const affiliates = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  // ─── Handlers ──────────────────────────────────────────────
  const openActivateModal = (aff) => {
    setSelectedAffiliate(aff);
    setForm({
      gameLossCommission: aff?.gameLossCommission ?? "",
      depositCommission: aff?.depositCommission ?? "",
      referCommission: aff?.referCommission ?? "",
      gameWinCommission: aff?.gameWinCommission ?? "",
    });
    setActivateModalOpen(true);
    setDeactivateModalOpen(false);
  };

  const openDeactivateModal = (aff) => {
    setSelectedAffiliate(aff);
    setDeactivateModalOpen(true);
    setActivateModalOpen(false);
  };

  const closeModals = () => {
    if (saving) return;
    setActivateModalOpen(false);
    setDeactivateModalOpen(false);
    setSelectedAffiliate(null);
  };

  const handleToggle = (aff) => {
    if (aff?.isActive) {
      openDeactivateModal(aff);
    } else {
      openActivateModal(aff);
    }
  };

  const handleActivateAndSave = async () => {
    if (!selectedAffiliate?._id) return;

    const toNumber = (val) => {
      const num = Number(val);
      return Number.isFinite(num) && num >= 0 ? num : 0;
    };

    const payload = {
      gameLossCommission: toNumber(form.gameLossCommission),
      depositCommission: toNumber(form.depositCommission),
      referCommission: toNumber(form.referCommission),
      gameWinCommission: toNumber(form.gameWinCommission),
    };

    try {
      setSaving(true);
      await api.patch(
        `/api/admin/affiliates/${selectedAffiliate._id}/activate`,
        payload,
      );
      toast.success("Affiliate activated with updated commissions");
      closeModals();
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Activation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedAffiliate?._id) return;

    try {
      setSaving(true);
      await api.patch(
        `/api/admin/affiliates/${selectedAffiliate._id}/deactivate`,
      );
      toast.success("Affiliate deactivated");
      closeModals();
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deactivation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ─── Styles (matching sidebar theme) ───────────────────────
  const card =
    "bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] border border-amber-900/40 rounded-xl shadow-lg shadow-black/40 text-white overflow-hidden";
  const btnBase =
    "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-md shadow-amber-700/30`;
  const dangerBtn = `${btnBase} bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-900/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 border border-white/15 text-white`;
  const inputBase =
    "w-full bg-black/40 border border-amber-900/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30 transition-all";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-amber-950/10 to-black text-white">
      <div className={card + " p-5 sm:p-7"}>
        {/* Header + Search + Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              All Affiliate Users
            </h2>
            <p className="text-amber-200/80 mt-1 text-sm sm:text-base">
              Total: <strong>{totalItems}</strong>
              {isFetching && (
                <span className="ml-2 animate-pulse">(refreshing...)</span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[260px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/70" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search username or phone..."
                className={inputBase + " pl-10"}
              />
            </div>

            <button onClick={handleRefresh} className={secondaryBtn}>
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-amber-900/30">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-amber-950/40">
              <tr className="text-amber-200/90 text-left">
                <th className="px-5 py-4 font-semibold">Username</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Balance</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Toggle</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-900/20">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-amber-200/60"
                  >
                    Loading affiliates...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-red-400">
                    Failed to load data
                  </td>
                </tr>
              ) : affiliates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-amber-200/50"
                  >
                    No affiliate users found
                  </td>
                </tr>
              ) : (
                affiliates.map((aff) => (
                  <tr
                    key={aff._id}
                    className="hover:bg-amber-950/20 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium">{aff.username}</td>
                    <td className="px-5 py-4">{aff.phone || "—"}</td>
                    <td className="px-5 py-4 font-medium">
                      {Number(aff.balance || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          aff.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {aff.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(aff)}
                        className={
                          aff.isActive
                            ? dangerBtn + " min-w-[110px]"
                            : primaryBtn + " min-w-[110px]"
                        }
                      >
                        {aff.isActive ? (
                          <>
                            <FaToggleOff /> Deactivate
                          </>
                        ) : (
                          <>
                            <FaToggleOn /> Activate
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          navigate(`/affiliate-users/${aff._id}`)
                        }
                        className={secondaryBtn + " min-w-[110px]"}
                      >
                        <FaEye /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-amber-200/70">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            {" • "} {totalItems} total
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className={secondaryBtn + " px-5 disabled:opacity-40"}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className={secondaryBtn + " px-5 disabled:opacity-40"}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── Activate Modal ────────────────────────────────────── */}
      {activateModalOpen && selectedAffiliate && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModals}
        >
          <div
            className="w-full max-w-lg bg-gradient-to-b from-[#111] to-[#1a1200] border border-amber-800/50 rounded-2xl p-6 shadow-2xl shadow-amber-900/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-amber-300">
              Activate {selectedAffiliate.username}
            </h3>
            <p className="text-amber-200/70 mt-2">
              Set commission rates and activate the affiliate account.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { key: "gameLossCommission", label: "Game Loss Commission" },
                { key: "depositCommission", label: "Deposit Commission" },
                { key: "referCommission", label: "Referral Commission" },
                { key: "gameWinCommission", label: "Game Win Commission" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm text-amber-200/80 mb-1.5 font-medium">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className={inputBase}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={closeModals}
                className={secondaryBtn}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleActivateAndSave}
                disabled={saving}
                className={primaryBtn + " min-w-[140px]"}
              >
                {saving ? "Saving..." : "Save & Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Deactivate Confirmation Modal ─────────────────────── */}
      {deactivateModalOpen && selectedAffiliate && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModals}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#111] to-[#1a1200] border border-red-800/50 rounded-2xl p-6 shadow-2xl shadow-red-900/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-red-300">
              Deactivate {selectedAffiliate.username}?
            </h3>
            <p className="mt-3 text-red-200/80">
              This affiliate will no longer earn commissions or be visible as
              active.
            </p>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={closeModals}
                className={secondaryBtn}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={saving}
                className={dangerBtn + " min-w-[140px]"}
              >
                {saving ? "Processing..." : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAffiliateUser;
