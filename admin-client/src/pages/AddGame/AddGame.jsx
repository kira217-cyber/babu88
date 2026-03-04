// src/pages/admin/AddGame.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const ORACLE_BASE = "https://api.oraclegames.live/api";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const GAMES_PER_PAGE = 50;

const AddGame = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProviderDbId, setSelectedProviderDbId] = useState("");

  const selectedProvider = useMemo(
    () => providers.find((p) => p._id === selectedProviderDbId),
    [providers, selectedProviderDbId],
  );

  const [providerGames, setProviderGames] = useState([]); // ✅ oracle games
  const [selectedGames, setSelectedGames] = useState([]); // ✅ your DB games

  const [loadingGames, setLoadingGames] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  // ✅ Per-card add temp state (global)
  const [form, setForm] = useState({
    image: null,
    isHot: false,
    isNew: false,

    // ✅ NEW
    isJackpot: false,
  });
  const [imagePreview, setImagePreview] = useState("");

  // ✅ Edit modal temp state
  const [editForm, setEditForm] = useState({
    image: null,
    isHot: false,
    isNew: false,

    // ✅ NEW
    isJackpot: false,
  });
  const [editPreview, setEditPreview] = useState("");

  // ✅ NEW: bulk action loading
  const [bulkLoading, setBulkLoading] = useState(false);

  // ────────────────────────────────────────────────
  //                   LOAD DATA
  // ────────────────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/api/game-categories");
        setCategories(res.data?.data || []);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProviders = async () => {
      if (!selectedCategoryId) {
        setProviders([]);
        setSelectedProviderDbId("");
        return;
      }
      try {
        const res = await api.get(
          `/api/game-providers?categoryId=${selectedCategoryId}`,
        );
        setProviders(res.data?.data || []);
      } catch {
        toast.error("Failed to load providers");
      }
    };
    loadProviders();
  }, [selectedCategoryId]);

  useEffect(() => {
    const loadSelected = async () => {
      if (!selectedProviderDbId) {
        setSelectedGames([]);
        return;
      }
      try {
        const res = await api.get(
          `/api/games?providerDbId=${selectedProviderDbId}`,
        );
        setSelectedGames(res.data?.data || []);
      } catch {
        toast.error("Failed to load selected games");
      }
    };
    loadSelected();
  }, [selectedProviderDbId]);

  // ✅ Load oracle games by providerCode
  useEffect(() => {
    if (!selectedProvider?.providerId) {
      setProviderGames([]);
      setCurrentPage(1);
      return;
    }

    const fetchOracleGames = async () => {
      setLoadingGames(true);
      try {
        const providerCode = selectedProvider.providerId; // ex: "JILIS"
        const res = await axios.get(
          `${ORACLE_BASE}/providers/${providerCode}`,
          {
            headers: { "x-api-key": ORACLE_KEY },
          },
        );

        setProviderGames(res.data?.games || []);
        setCurrentPage(1);
      } catch (e) {
        toast.error("Failed to load games from provider");
        setProviderGames([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchOracleGames();
  }, [selectedProvider?.providerId]);

  // Previews
  useEffect(() => {
    if (!form.image) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(form.image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  useEffect(() => {
    if (!editForm.image) return;
    const url = URL.createObjectURL(editForm.image);
    setEditPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editForm.image]);

  // ────────────────────────────────────────────────
  //                   PAGINATION
  // ────────────────────────────────────────────────
  const totalPages = Math.ceil(providerGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const endIndex = startIndex + GAMES_PER_PAGE;
  const paginatedGames = providerGames.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ────────────────────────────────────────────────
  //                   HELPERS
  // ────────────────────────────────────────────────
  const isGameSelected = (oracleGameId) =>
    selectedGames.some((sg) => sg.gameId === oracleGameId);

  const getSelectedGame = (oracleGameId) =>
    selectedGames.find((sg) => sg.gameId === oracleGameId);

  const resetAddForm = () => {
    setForm({ image: null, isHot: false, isNew: false, isJackpot: false });
    setImagePreview("");
  };

  // ✅ better: oracle image is already full url
  const oracleFallbackImage = (game) => {
    if (game?.image) return game.image;
    return "";
  };

  /**
   * ✅ Select/Unselect single game (kept same logic)
   */
  const handleSelectGame = async (game) => {
    const oracleGameId = game._id;
    const oracleGameCode = game.game_code || "";
    const oracleGameName = game.gameName || game.name || "Unnamed Game";
    const oracleImageUrl = game.image || "";

    const alreadySelected = isGameSelected(oracleGameId);

    try {
      if (alreadySelected) {
        const doc = getSelectedGame(oracleGameId);
        await api.delete(`/api/games/${doc._id}`);
        setSelectedGames((prev) => prev.filter((x) => x._id !== doc._id));
        toast.success("Game removed from selection");
        return;
      }

      const fd = new FormData();
      fd.append("categoryId", selectedCategoryId);
      fd.append("providerDbId", selectedProviderDbId);

      fd.append("gameId", oracleGameId);
      fd.append("gameUuid", oracleGameCode);
      fd.append("gameName", oracleGameName);

      fd.append("isHot", String(form.isHot));
      fd.append("isNew", String(form.isNew));

      // ✅ NEW
      fd.append("isJackpot", String(form.isJackpot));

      if (form.image instanceof File) {
        fd.append("image", form.image);
      } else {
        fd.append("imageUrl", oracleImageUrl);
      }

      const res = await api.post("/api/games", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedGames((prev) => [res.data.data, ...prev]);
      toast.success("Game added successfully");
      resetAddForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  // ✅ NEW: Add all games in current page
  const handleSelectAllThisPage = async () => {
    if (bulkLoading) return;
    if (!paginatedGames.length) return;

    setBulkLoading(true);
    let added = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const game of paginatedGames) {
        const oracleGameId = game._id;
        if (isGameSelected(oracleGameId)) {
          skipped++;
          continue;
        }

        const fd = new FormData();
        fd.append("categoryId", selectedCategoryId);
        fd.append("providerDbId", selectedProviderDbId);

        fd.append("gameId", oracleGameId);
        fd.append("gameUuid", game.game_code || "");
        fd.append("gameName", game.gameName || game.name || "Unnamed Game");

        // bulk uses current form flags
        fd.append("isHot", String(form.isHot));
        fd.append("isNew", String(form.isNew));

        // ✅ NEW
        fd.append("isJackpot", String(form.isJackpot));

        // bulk does NOT upload per-card image; saves oracle URL
        fd.append("imageUrl", game.image || "");

        try {
          const res = await api.post("/api/games", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setSelectedGames((prev) => [res.data.data, ...prev]);
          added++;
        } catch (e) {
          failed++;
        }
      }

      if (added) toast.success(`Selected ${added} games (this page)`);
      if (skipped) toast.info(`Skipped ${skipped} already selected`);
      if (failed) toast.error(`Failed ${failed} games`);
    } finally {
      setBulkLoading(false);
    }
  };

  // ✅ NEW: Remove all selected games in current page
  const handleRemoveAllThisPage = async () => {
    if (bulkLoading) return;
    if (!paginatedGames.length) return;

    setBulkLoading(true);
    let removed = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const game of paginatedGames) {
        const doc = getSelectedGame(game._id);
        if (!doc?._id) {
          skipped++;
          continue;
        }

        try {
          await api.delete(`/api/games/${doc._id}`);
          setSelectedGames((prev) => prev.filter((x) => x._id !== doc._id));
          removed++;
        } catch (e) {
          failed++;
        }
      }

      if (removed) toast.success(`Removed ${removed} games (this page)`);
      if (skipped) toast.info(`Skipped ${skipped} not selected`);
      if (failed) toast.error(`Failed ${failed} removes`);
    } finally {
      setBulkLoading(false);
    }
  };

  const openEditModal = (selectedDoc) => {
    setEditingGame(selectedDoc);
    setEditForm({
      image: null,
      isHot: !!selectedDoc.isHot,
      isNew: !!selectedDoc.isNew,

      // ✅ NEW
      isJackpot: !!selectedDoc.isJackpot,
    });

    const img = selectedDoc.image || "";
    if (!img) setEditPreview("");
    else if (/^https?:\/\//i.test(img)) setEditPreview(img);
    else setEditPreview(`${API_URL}${img}`);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGame(null);
    setEditForm({ image: null, isHot: false, isNew: false, isJackpot: false });
    setEditPreview("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingGame) return;

    try {
      const fd = new FormData();
      fd.append("isHot", String(editForm.isHot));
      fd.append("isNew", String(editForm.isNew));

      // ✅ NEW
      fd.append("isJackpot", String(editForm.isJackpot));

      if (editForm.image instanceof File) fd.append("image", editForm.image);

      const res = await api.put(`/api/games/${editingGame._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedGames((prev) =>
        prev.map((x) => (x._id === editingGame._id ? res.data.data : x)),
      );

      toast.success("Game updated");
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  // ────────────────────────────────────────────────
  //                   STYLES
  // ────────────────────────────────────────────────
  const cardBg = "bg-gradient-to-br from-black via-yellow-950/30 to-black";
  const inputBase =
    "w-full px-5 py-3.5 bg-black/60 border border-yellow-700/50 rounded-xl text-white placeholder-yellow-400/60 focus:outline-none focus:border-yellow-400/70 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200";
  const fileInputBase =
    "w-full px-5 py-3.5 bg-black/60 border border-yellow-700/50 rounded-xl text-white file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-yellow-500 file:to-amber-500 file:text-black file:font-bold file:cursor-pointer file:shadow-sm file:hover:brightness-110 transition-all";
  const btnPrimary =
    "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-3 px-6 rounded-xl shadow-lg shadow-yellow-600/40 hover:shadow-yellow-500/60 transition-all duration-300 disabled:opacity-60";
  const btnDanger =
    "bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-red-500/40";

  // helper: how many selected on this page
  const selectedCountThisPage = useMemo(() => {
    return paginatedGames.reduce(
      (acc, g) => (isGameSelected(g._id) ? acc + 1 : acc),
      0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedGames, selectedGames]);

  const allSelectedThisPage =
    paginatedGames.length > 0 &&
    selectedCountThisPage === paginatedGames.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-3 text-center md:text-left tracking-tight">
          Game Management
        </h1>
        <p className="text-yellow-300/70 mb-10 text-center md:text-left">
          Select category & provider → add / manage games
        </p>

        {/* Filters */}
        <div
          className={`${cardBg} border border-yellow-700/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/70 mb-8 backdrop-blur-sm`}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedProviderDbId("");
                  setProviderGames([]);
                  setSelectedGames([]);
                  setCurrentPage(1);
                  resetAddForm();
                }}
                className={inputBase}
              >
                <option value="">Choose category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName?.en} • {c.categoryName?.bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                Select Provider
              </label>
              <select
                value={selectedProviderDbId}
                onChange={(e) => {
                  setSelectedProviderDbId(e.target.value);
                  setProviderGames([]);
                  setSelectedGames([]);
                  setCurrentPage(1);
                  resetAddForm();
                }}
                disabled={!selectedCategoryId}
                className={`${inputBase} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Choose provider...</option>
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.providerName} (CODE: {p.providerId})
                  </option>
                ))}
              </select>

              {selectedProvider && (
                <div className="mt-2 text-xs text-yellow-400/70">
                  Selected:{" "}
                  <span className="text-yellow-200 font-medium">
                    {selectedProvider.providerName}
                  </span>{" "}
                  • Provider Code:{" "}
                  <span className="font-mono">
                    {selectedProvider.providerId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Bulk action bar */}
        {selectedProviderDbId && providerGames.length > 0 && !loadingGames && (
          <div
            className={`${cardBg} border border-yellow-700/30 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/60 mb-10`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-yellow-300/80">
                This page:{" "}
                <span className="text-yellow-200 font-semibold">
                  {selectedCountThisPage}/{paginatedGames.length}
                </span>{" "}
                selected
              </div>

              <div className="grid grid-cols-1 items-center md:grid-cols-2 lg:grid-cols-3 flex-wrap gap-3">
                <div>
                  {/* Pagination Controls (inside bar - kept as your structure) */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-3">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 bg-black/70 border border-yellow-700/50 rounded-lg text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-900/40 transition"
                      >
                        Previous
                      </button>

                      <span className="px-4 py-2 text-yellow-200 font-medium">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 bg-black/70 border border-yellow-700/50 rounded-lg text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-900/40 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSelectAllThisPage}
                  disabled={bulkLoading || allSelectedThisPage}
                  className={`${btnPrimary} py-2.5 px-5 rounded-xl disabled:opacity-60`}
                >
                  {bulkLoading ? "Working..." : "Select All (This Page)"}
                </button>

                <button
                  onClick={handleRemoveAllThisPage}
                  disabled={bulkLoading || selectedCountThisPage === 0}
                  className="py-2.5 px-5 rounded-xl bg-black/70 hover:bg-black/50 border border-yellow-700/50 text-yellow-300 font-medium transition disabled:opacity-50"
                >
                  {bulkLoading ? "Working..." : "Remove All (This Page)"}
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs text-yellow-400/70">
              Bulk add uses current Hot/New/Jackpot flags (from the left form
              state) and saves Oracle image URL (no custom uploads).
            </div>
          </div>
        )}

        {/* Games Grid + Pagination */}
        {!selectedProviderDbId ? (
          <div className="text-center py-24 text-yellow-400/60">
            Select a category and provider to start managing games
          </div>
        ) : loadingGames ? (
          <div className="text-center py-24 text-yellow-300">
            Loading games from provider...
          </div>
        ) : providerGames.length === 0 ? (
          <div className="text-center py-24 bg-black/40 rounded-2xl border border-yellow-700/30">
            <p className="text-2xl font-bold text-yellow-400 mb-4">
              No games available
            </p>
            <p className="text-yellow-300/70">
              This provider currently has no games listed.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
              {paginatedGames.map((game) => {
                const selected = isGameSelected(game._id);
                const selectedDoc = getSelectedGame(game._id);

                const displayName =
                  selectedDoc?.gameName || game.gameName || "Unnamed Game";

                const imageToShow = selected
                  ? selectedDoc?.image
                    ? /^https?:\/\//i.test(selectedDoc.image)
                      ? selectedDoc.image
                      : `${API_URL}${selectedDoc.image}`
                    : ""
                  : oracleFallbackImage(game);

                return (
                  <div
                    key={game._id}
                    className={`${cardBg} border border-yellow-700/30 rounded-2xl overflow-hidden shadow-xl shadow-black/60 hover:shadow-yellow-900/40 transition-all duration-300 group ${
                      selected
                        ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-black"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      {imageToShow ? (
                        <img
                          src={imageToShow}
                          alt={displayName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback-game.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-black/50 flex items-center justify-center text-yellow-500/70 font-medium">
                          No Image
                        </div>
                      )}

                      {selected && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold px-3 py-1 rounded-full text-xs shadow-md">
                          SELECTED
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg text-yellow-100 group-hover:text-yellow-300 transition-colors line-clamp-2 mb-2">
                        {displayName}
                      </h3>

                      <div className="text-xs text-yellow-400/70 mb-4 font-mono space-y-1">
                        <div>gameId: {game._id}</div>
                        <div>game_code: {game.game_code}</div>

                        {/* ✅ Hot / New / Jackpot badges */}
                        <div className="flex flex-wrap gap-2 pt-1 font-sans">
                          {(selected ? selectedDoc?.isHot : form.isHot) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-200 border border-red-400/30">
                              HOT
                            </span>
                          )}
                          {(selected ? selectedDoc?.isNew : form.isNew) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30">
                              NEW
                            </span>
                          )}
                          {(selected
                            ? selectedDoc?.isJackpot
                            : form.isJackpot) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/15 text-yellow-200 border border-yellow-400/30">
                              JACKPOT
                            </span>
                          )}
                        </div>

                        {selectedDoc?.gameName && (
                          <div className="text-yellow-200/90">
                            Saved name: {selectedDoc.gameName}
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleSelectGame(game)}
                          className="w-5 h-5 accent-yellow-500"
                        />
                        <span className="text-yellow-200 font-medium">
                          {selected ? "Selected" : "Add to Platform"}
                        </span>
                      </label>

                      {!selected && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-yellow-300/90 mb-2">
                              Custom Image (optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  image: e.target.files?.[0] || null,
                                })
                              }
                              className={fileInputBase}
                            />
                            {imagePreview && (
                              <img
                                src={imagePreview}
                                alt="preview"
                                className="mt-3 w-full h-32 object-cover rounded-xl border border-yellow-600/40"
                              />
                            )}

                            {!form.image && game.image && (
                              <div className="mt-2 text-xs text-yellow-400/70">
                                If you don&apos;t upload, Oracle image URL will
                                be saved in DB.
                              </div>
                            )}
                          </div>

                          <div className="flex gap-6 flex-wrap">
                            <label className="flex items-center gap-2 text-yellow-200">
                              <input
                                type="checkbox"
                                checked={form.isHot}
                                onChange={(e) =>
                                  setForm({ ...form, isHot: e.target.checked })
                                }
                                className="accent-yellow-500"
                              />
                              Hot
                            </label>
                            <label className="flex items-center gap-2 text-yellow-200">
                              <input
                                type="checkbox"
                                checked={form.isNew}
                                onChange={(e) =>
                                  setForm({ ...form, isNew: e.target.checked })
                                }
                                className="accent-yellow-500"
                              />
                              New
                            </label>

                            {/* ✅ NEW */}
                            <label className="flex items-center gap-2 text-yellow-200">
                              <input
                                type="checkbox"
                                checked={form.isJackpot}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    isJackpot: e.target.checked,
                                  })
                                }
                                className="accent-yellow-500"
                              />
                              Jackpot
                            </label>
                          </div>
                        </div>
                      )}

                      {selected && (
                        <button
                          onClick={() => openEditModal(selectedDoc)}
                          className="mt-4 w-full bg-gradient-to-r from-yellow-600/90 to-amber-600/90 hover:from-yellow-500 hover:to-amber-500 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                        >
                          Edit Image / Flags
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-black/70 border border-yellow-700/50 rounded-lg text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-900/40 transition"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-yellow-200 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 bg-black/70 border border-yellow-700/50 rounded-lg text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-900/40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${cardBg} border border-yellow-700/40 rounded-2xl shadow-2xl max-w-lg w-full p-8`}
          >
            <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center">
              Edit Game Settings
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-yellow-300/90 mb-2">
                  Replace Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className={fileInputBase}
                />
                {editPreview && (
                  <img
                    src={editPreview}
                    alt="preview"
                    className="mt-4 w-full h-56 object-cover rounded-xl border border-yellow-600/50 shadow-lg shadow-black/40"
                  />
                )}
                <div className="mt-2 text-xs text-yellow-400/70">
                  Upload করলে নতুন image path (&quot;/uploads/...&quot;) save
                  হবে।
                </div>
              </div>

              <div className="flex gap-8 justify-center flex-wrap">
                <label className="flex items-center gap-3 text-yellow-200 text-lg">
                  <input
                    type="checkbox"
                    checked={editForm.isHot}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isHot: e.target.checked })
                    }
                    className="w-6 h-6 accent-yellow-500"
                  />
                  Mark as Hot
                </label>

                <label className="flex items-center gap-3 text-yellow-200 text-lg">
                  <input
                    type="checkbox"
                    checked={editForm.isNew}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isNew: e.target.checked })
                    }
                    className="w-6 h-6 accent-yellow-500"
                  />
                  Mark as New
                </label>

                {/* ✅ NEW */}
                <label className="flex items-center gap-3 text-yellow-200 text-lg">
                  <input
                    type="checkbox"
                    checked={editForm.isJackpot}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        isJackpot: e.target.checked,
                      })
                    }
                    className="w-6 h-6 accent-yellow-500"
                  />
                  Mark as Jackpot
                </label>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className={`${btnPrimary} flex-1 text-lg`}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-black/70 hover:bg-black/50 border border-yellow-700/50 text-yellow-300 font-medium py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={closeModal}
              className={`${btnDanger} w-full mt-5`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGame;
