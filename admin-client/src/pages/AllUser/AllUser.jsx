import React, { useEffect, useState, useCallback } from "react";
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
  FaFilter,
} from "react-icons/fa";

const fetchUsers = async ({ page, limit, search, status }) => {
  const { data } = await api.get("/api/admin/users", {
    params: { page, limit, search, status },
  });
  return data;
};

const AllUser = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [nextStatus, setNextStatus] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-users", page, debouncedSearch, statusFilter],
    queryFn: () =>
      fetchUsers({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
      }),
    keepPreviousData: true,
    staleTime: 10_000,
    retry: 1,
  });

  const users = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const openConfirm = (user) => {
    setTargetUser(user);
    setNextStatus(!user.isActive);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (saving) return;
    setConfirmOpen(false);
    setTargetUser(null);
    setNextStatus(false);
  };

  const handleToggleStatus = async () => {
    if (!targetUser?._id) return;

    try {
      setSaving(true);
      const { data: res } = await api.patch(
        `/api/admin/users/${targetUser._id}/status`,
        { isActive: nextStatus },
      );
      toast.success(res?.message || "User status updated");
      closeConfirm();
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  // Styles (consistent with affiliate page)
  const card =
    "bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] border border-amber-900/40 rounded-xl shadow-lg shadow-black/40 text-white overflow-hidden";
  const btnBase =
    "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-md shadow-amber-700/30`;
  const dangerBtn = `${btnBase} bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-900/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 border border-white/15 text-white`;
  const inputBase =
    "w-full bg-black/40 border border-amber-900/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30 transition-all";

  const filterOptions = [
    { value: "all", label: "All Users" },
    { value: "active", label: "Active Only" },
    { value: "inactive", label: "Inactive Only" },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-amber-950/10 to-black text-white">
      <div className={card + " p-5 sm:p-7"}>
        {/* Header + Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              All Users
            </h2>
            <p className="text-amber-200/80 mt-1 text-sm sm:text-base">
              Total: <strong>{pagination.total || 0}</strong>
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

            <div className="relative min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className={inputBase + " appearance-none pr-10 cursor-pointer"}
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/70 pointer-events-none" />
            </div>

            <button onClick={handleRefresh} className={secondaryBtn}>
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-amber-900/30">
          <table className="w-full text-sm min-w-[800px]">
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
                    className="py-12 text-center text-amber-200/60"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-red-400">
                    Failed to load users
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="text-amber-200/70 text-lg font-medium">
                      {statusFilter === "active"
                        ? "No active users found"
                        : statusFilter === "inactive"
                          ? "No inactive users found"
                          : debouncedSearch
                            ? "No users match your search"
                            : "No users found in the system"}
                    </div>
                    <p className="text-amber-200/50 mt-2 text-sm">
                      {statusFilter !== "all" &&
                        "Try changing the filter or refreshing"}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-amber-950/20 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium">{u.username}</td>
                    <td className="px-5 py-4">{u.phone || "—"}</td>
                    <td className="px-5 py-4 font-medium">
                      {u.currency === "USDT" ? "$" : "৳"}{" "}
                      {Number(u.balance ?? 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          u.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openConfirm(u)}
                        className={
                          u.isActive
                            ? dangerBtn + " min-w-[110px]"
                            : primaryBtn + " min-w-[110px]"
                        }
                      >
                        {u.isActive ? (
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
                        onClick={() => navigate(`/users/${u._id}`)}
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
        {pagination.total > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="text-amber-200/70">
              Page <strong>{page}</strong> of{" "}
              <strong>{pagination.totalPages}</strong>
              {" • "} Showing {users.length} of {pagination.total}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className={secondaryBtn + " px-6 disabled:opacity-40"}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                disabled={page >= pagination.totalPages}
                className={secondaryBtn + " px-6 disabled:opacity-40"}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmOpen && targetUser && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-[#111] to-[#1a1200] border border-amber-800/50 rounded-2xl p-6 shadow-2xl shadow-amber-900/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-amber-300">
              {nextStatus ? "Activate" : "Deactivate"} User?
            </h3>
            <p className="mt-3 text-amber-200/80">
              Are you sure you want to{" "}
              <strong>{nextStatus ? "ACTIVATE" : "DEACTIVATE"}</strong> this
              user?
            </p>

            <div className="mt-4 text-amber-200/90 text-sm space-y-1">
              <div>
                Username:{" "}
                <span className="font-semibold">{targetUser.username}</span>
              </div>
              <div>
                Phone:{" "}
                <span className="font-semibold">{targetUser.phone || "—"}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={closeConfirm}
                className={secondaryBtn}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={saving}
                className={nextStatus ? primaryBtn : dangerBtn}
              >
                {saving
                  ? "Processing..."
                  : nextStatus
                    ? "Activate"
                    : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUser;
