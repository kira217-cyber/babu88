// src/pages/GameCategoryMobile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import Jackpot from "../../components/Jackpot/Jackpot";

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

const UI_PAGE_SIZE = 30;
const SERVER_PAGE_SIZE = 50;

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;

const getSavedApiKey = async () => {
  const res = await api.get("/api/admin/game-api-key");
  const setting = res?.data?.data?.setting;

  if (!setting?.apiKey || !setting?.isActive || !setting?.isVerified) {
    return "";
  }

  return setting.apiKey;
};

const masterGet = async (url, params = {}) => {
  const apiKey = await getSavedApiKey();

  if (!apiKey || !MASTER_API_URL) return null;

  const { data } = await axios.get(`${MASTER_API_URL}${url}`, {
    params,
    headers: { "x-api-key": apiKey },
  });

  return data?.data;
};

const masterGetFull = async (url, params = {}) => {
  const apiKey = await getSavedApiKey();

  if (!apiKey || !MASTER_API_URL) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: SERVER_PAGE_SIZE,
        total: 0,
        totalPages: 1,
        hasMore: false,
        nextPage: null,
      },
    };
  }

  const { data } = await axios.get(`${MASTER_API_URL}${url}`, {
    params,
    headers: { "x-api-key": apiKey },
  });

  return {
    data: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination || {
      page: params.page || 1,
      limit: params.limit || SERVER_PAGE_SIZE,
      total: 0,
      totalPages: 1,
      hasMore: false,
      nextPage: null,
    },
  };
};

const fetchCategories = async () => {
  const data = await masterGet("/api/white-label/game-menu");
  return Array.isArray(data) ? data : [];
};

const fetchProviders = async (categoryId) => {
  const data = await masterGet(
    `/api/white-label/game-categories/${categoryId}`,
  );
  return Array.isArray(data?.providers) ? data.providers : [];
};

const fetchGamesPage = async ({ categoryId, providerDbId, pageParam = 1 }) => {
  return await masterGetFull("/api/white-label/games", {
    categoryId,
    providerDbId: providerDbId || "",
    page: pageParam,
    limit: SERVER_PAGE_SIZE,
    includeOracle: true,
  });
};

const masterFileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  const base = String(MASTER_API_URL || "").replace(/\/+$/, "");
  const cleanPath = String(path).startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

const getGameImage = (game) => {
  if (game?.image) return masterFileUrl(game.image);
  if (game?.oracleImage) return game.oracleImage;
  if (game?.oracleImages?.thumbnail) return game.oracleImages.thumbnail;
  if (game?.oracleImages?.height) return game.oracleImages.height;
  if (game?.oracleImages?.original) return game.oracleImages.original;
  return "/no-image.png";
};

const GameCategoryMobile = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [sp] = useSearchParams();
  const { isBangla } = useLanguage();

  const [activeCategoryId, setActiveCategoryId] = useState(categoryId || "");
  const [activeProviderDbId, setActiveProviderDbId] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const qp = sp.get("provider") || "";
    setActiveProviderDbId(qp);
  }, [categoryId, sp]);

  useEffect(() => {
    if (categoryId) setActiveCategoryId(categoryId);
  }, [categoryId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [activeCategoryId, activeProviderDbId, debouncedQ]);

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["white-label-mobile-categories"],
    queryFn: fetchCategories,
    staleTime: 60000,
    retry: false,
  });

  const activeIndex = useMemo(() => {
    const idx = categories.findIndex((c) => c._id === activeCategoryId);
    return idx >= 0 ? idx : 0;
  }, [categories, activeCategoryId]);

  const activeCategory = useMemo(
    () => categories[activeIndex] || null,
    [categories, activeIndex],
  );

  const titleText = useMemo(() => {
    if (!activeCategory) return "";
    return isBangla
      ? activeCategory.categoryName?.bn
      : activeCategory.categoryName?.en;
  }, [activeCategory, isBangla]);

  const showJackpot = useMemo(() => {
    return activeCategory?.jackpot === true || activeCategory?.badge === "hot";
  }, [activeCategory]);

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["white-label-mobile-providers", activeCategoryId],
    queryFn: () => fetchProviders(activeCategoryId),
    enabled: !!activeCategoryId,
    staleTime: 60000,
    retry: false,
  });

  const {
    data: gamesPages,
    isLoading: loadingGames,
    isFetching: fetchingGames,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "white-label-mobile-games-background-preload",
      activeCategoryId,
      activeProviderDbId,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchGamesPage({
        categoryId: activeCategoryId,
        providerDbId: activeProviderDbId,
        pageParam,
      }),
    enabled: !!activeCategoryId,
    staleTime: 30000,
    retry: 1,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.nextPage;
      }
      return undefined;
    },
  });

  useEffect(() => {
    if (!loadingGames && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [loadingGames, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const games = useMemo(() => {
    const pages = gamesPages?.pages || [];
    const merged = pages.flatMap((item) => item?.data || []);

    const map = new Map();

    for (const game of merged) {
      const key = String(game?._id || game?.gameId || game?.gameUId || "");
      if (key) map.set(key, game);
    }

    return Array.from(map.values());
  }, [gamesPages]);

  const totalFromServer = useMemo(() => {
    return gamesPages?.pages?.[0]?.pagination?.total || games.length;
  }, [gamesPages, games.length]);

  const shownGames = useMemo(() => {
    let list = Array.isArray(games) ? [...games] : [];

    list = list.filter((g) => g?.status === "active" || !g?.status);

    const term = String(debouncedQ || q || "")
      .trim()
      .toLowerCase();

    if (!term) return list;

    const getPriority = (str = "") => {
      const s = String(str || "").toLowerCase();
      if (!s) return 0;
      if (s === term) return 100;
      if (s.startsWith(term)) return 50;
      if (s.includes(term)) return 10;
      return 1;
    };

    list = list.filter((g) => {
      const name = String(g.gameName || g.name || "").toLowerCase();
      const gameUId = String(g.gameUId || g.gameId || "").toLowerCase();
      const provider = String(g.provider || "").toLowerCase();
      const category = String(g.category || "").toLowerCase();

      return (
        name.includes(term) ||
        gameUId.includes(term) ||
        provider.includes(term) ||
        category.includes(term)
      );
    });

    list.sort((a, b) => {
      const aName = a.gameName || a.gameUId || a.gameId || "";
      const bName = b.gameName || b.gameUId || b.gameId || "";

      const aScore = getPriority(aName);
      const bScore = getPriority(bName);

      if (bScore !== aScore) return bScore - aScore;
      return String(aName).localeCompare(String(bName));
    });

    return list;
  }, [games, q, debouncedQ]);

  const total = q.trim() ? shownGames.length : totalFromServer;
  const totalPages = Math.max(1, Math.ceil(total / UI_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * UI_PAGE_SIZE;
  const end = start + UI_PAGE_SIZE;

  const pagedGames = useMemo(
    () => shownGames.slice(start, end),
    [shownGames, start, end],
  );

  const pageButtons = useMemo(() => {
    const tp = totalPages;
    const p = safePage;
    const out = [];

    if (tp <= 3) {
      for (let i = 1; i <= tp; i += 1) out.push(i);
      return out;
    }

    out.push(1);

    if (p > 3) out.push("...");

    const s = Math.max(2, p - 1);
    const e = Math.min(tp - 1, p + 1);

    for (let i = s; i <= e; i += 1) out.push(i);

    if (p < tp - 2) out.push("...");

    out.push(tp);

    return out;
  }, [safePage, totalPages]);

  const goPrev = () => {
    if (!categories.length) return;

    const prev = (activeIndex - 1 + categories.length) % categories.length;
    const id = categories[prev]._id;

    setActiveProviderDbId("");
    setQ("");
    setPage(1);
    navigate(`/games-mobile/${id}`, { replace: true });
  };

  const goNext = () => {
    if (!categories.length) return;

    const next = (activeIndex + 1) % categories.length;
    const id = categories[next]._id;

    setActiveProviderDbId("");
    setQ("");
    setPage(1);
    navigate(`/games-mobile/${id}`, { replace: true });
  };

  const goPage = (p) => {
    const cleanPage = Math.min(totalPages, Math.max(1, p));
    setPage(cleanPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const prevPage = () => goPage(safePage - 1);
  const nextPage = () => goPage(safePage + 1);

  const provScrollerRef = useRef(null);
  const trackRef = useRef(null);
  const [thumb, setThumb] = useState({ width: 40, x: 0 });

  const updateThumb = () => {
    const scroller = provScrollerRef.current;
    const track = trackRef.current;

    if (!scroller || !track) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;

    if (scrollWidth <= clientWidth) {
      setThumb({ width: track.clientWidth, x: 0 });
      return;
    }

    const trackW = track.clientWidth;
    const thumbW = Math.max(28, (clientWidth / scrollWidth) * trackW);
    const maxScroll = scrollWidth - clientWidth;
    const maxX = trackW - thumbW;
    const x = (scrollLeft / maxScroll) * maxX;

    setThumb({ width: thumbW, x });
  };

  useEffect(() => {
    updateThumb();
    window.addEventListener("resize", updateThumb);
    return () => window.removeEventListener("resize", updateThumb);
  }, []);

  useEffect(() => {
    requestAnimationFrame(updateThumb);
  }, [activeCategoryId, providers]);

  const onPlay = (g) => {
    const gameId = g.gameId || g.gameUId || g.gameUuid || g._id;

    if (!gameId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game ID not found");
      return;
    }

    navigate(`/playgame/${gameId}`, { state: { game: g } });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Loading
        open={loadingCats || loadingProviders || loadingGames}
        text={isBangla ? "লোড হচ্ছে..." : "Loading..."}
      />

      <div className="mx-3 mt-3 flex h-[54px] items-center rounded-xl bg-black px-3 text-white">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-2xl font-black"
          onClick={goPrev}
        >
          ‹
        </button>

        <div className="flex-1 text-center text-[20px] font-extrabold text-[#f5b400]">
          {loadingCats ? "..." : titleText || ""}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-2xl font-black"
          onClick={goNext}
        >
          ›
        </button>
      </div>

      <div className="mx-3 mt-3 rounded-xl bg-white p-3 shadow-sm">
        <div
          ref={provScrollerRef}
          onScroll={updateThumb}
          className="hide-scrollbar flex items-center gap-3 overflow-x-auto whitespace-nowrap"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <button
            type="button"
            onClick={() => setActiveProviderDbId("")}
            className={[
              "flex h-[64px] w-[64px] shrink-0 flex-col items-center justify-center rounded-xl border text-[12px] font-extrabold",
              !activeProviderDbId
                ? "border-[#f5b400] text-[#f5b400]"
                : "border-black/15 text-black/80",
            ].join(" ")}
          >
            {isBangla ? "সব" : "All"}
          </button>

          {loadingProviders
            ? null
            : providers.map((p) => {
                const active = activeProviderDbId === p._id;
                const iconSrc = masterFileUrl(
                  p.providerIcon || p.providerImage || "",
                );

                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setActiveProviderDbId(p._id)}
                    className={[
                      "relative flex h-[64px] w-[64px] shrink-0 flex-col items-center justify-center rounded-xl border",
                      active ? "border-[#f5b400]" : "border-black/15",
                    ].join(" ")}
                    title={p.providerName}
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={p.providerName}
                        className="h-9 w-9 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded bg-black/5" />
                    )}

                    <div className="mt-1 w-[58px] truncate text-center text-[10px] font-extrabold text-black/70">
                      {p.providerName}
                    </div>
                  </button>
                );
              })}
        </div>

        <div className="mt-3 px-2">
          <div
            ref={trackRef}
            className="relative h-[6px] w-full overflow-hidden rounded-full bg-black/10"
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#f5b400]"
              style={{
                width: `${thumb.width}px`,
                transform: `translateX(${thumb.x}px)`,
              }}
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex h-[42px] items-center gap-2 rounded-full border border-black/20 bg-white px-4">
            <span className="text-black/40">🔎</span>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                isBangla ? "গেমের নাম লিখুন..." : "Search game name..."
              }
              className="w-full bg-transparent text-[14px] font-semibold text-black/70 outline-none"
            />
          </div>

          {/* <div className="mt-2 text-center text-[11px] font-bold text-black/40">
            {isBangla ? "লোড হয়েছে" : "Loaded"} {games.length}/{totalFromServer}
            {isFetchingNextPage ? (
              <span> {isBangla ? "লোড হচ্ছে..." : "Loading..."}</span>
            ) : null}
          </div> */}
        </div>
      </div>

      {showJackpot ? <Jackpot /> : null}

      <div className="mx-3 mt-3 pb-10">
        {loadingGames ? (
          <div className="py-10 text-center font-bold text-black/50">
            Loading...
          </div>
        ) : total === 0 ? (
          <div className="py-10 text-center font-bold text-black/50">
            {q.trim()
              ? isBangla
                ? "কোনো গেম মিলেনি"
                : "No matching games"
              : isBangla
                ? "কোনো গেম নেই"
                : "No games found"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {pagedGames.map((g) => {
                const imgSrc = getGameImage(g);
                const goId = g.gameId || g.gameUId || g.gameUuid || g._id;
                const label = g.gameName || g.name || goId || "Game";

                return (
                  <button
                    key={g._id || goId}
                    type="button"
                    onClick={() => onPlay(g)}
                    className="group"
                    title={label}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={label}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/no-image.png";
                          }}
                        />
                      </div>

                      <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
                        {(g.isHot === true || g.isHot === "true") && (
                          <img
                            src={HOT_ICON}
                            alt="hot"
                            className="h-8 w-auto drop-shadow"
                            loading="lazy"
                          />
                        )}

                        {(g.isNew === true || g.isNew === "true") && (
                          <img
                            src={NEW_ICON}
                            alt="new"
                            className="h-8 w-auto drop-shadow"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-1 truncate px-1 text-center text-[12px] font-bold text-black/80">
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={safePage <= 1}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 font-bold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBangla ? "পূর্বের" : "Prev"}
                </button>

                {pageButtons.map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-black/50">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goPage(p)}
                      className={`rounded-lg border border-black/10 px-3 py-2 font-extrabold ${
                        p === safePage
                          ? "bg-[#f5b400] text-black"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={safePage >= totalPages}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 font-bold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBangla ? "পরের" : "Next"}
                </button>
              </div>
            )}

            <div className="mt-3 text-center text-[12px] font-bold text-black/45">
              {isBangla ? "পেজ" : "Page"} {safePage}/{totalPages} •{" "}
              {isBangla ? "মোট" : "Total"} {total}
            </div>

            {fetchingGames && !isFetchingNextPage ? (
              <div className="py-3 text-center text-sm font-bold text-black/45">
                {isBangla ? "আপডেট হচ্ছে..." : "Updating..."}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default GameCategoryMobile;
