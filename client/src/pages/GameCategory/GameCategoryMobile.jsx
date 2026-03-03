import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

const PAGE_SIZE = 30;

const fetchCategories = async () => {
  const { data } = await api.get("/api/public/game-categories");
  return data?.data || [];
};

const fetchProviders = async (categoryId) => {
  const { data } = await api.get(
    `/api/public/game-categories/${categoryId}/providers`,
  );
  return data?.data || [];
};

const fetchGames = async ({ categoryId, providerDbId, q }) => {
  const qs = new URLSearchParams();
  qs.set("categoryId", categoryId);
  if (providerDbId) qs.set("providerDbId", providerDbId);
  if (q && q.trim()) qs.set("q", q.trim());
  const { data } = await api.get(`/api/public/games?${qs.toString()}`);
  return data?.data || [];
};

const GameCategoryMobile = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { isBangla } = useLanguage();

  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  const [activeCategoryId, setActiveCategoryId] = useState(categoryId || "");
  const [activeProviderDbId, setActiveProviderDbId] = useState("");
  const [q, setQ] = useState("");

  // ✅ Pagination state
  const [page, setPage] = useState(1);

  // Debounce search
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(timer);
  }, [q]);

  // ✅ Reset page when category/provider/search changes
  useEffect(() => {
    setPage(1);
  }, [activeCategoryId, activeProviderDbId, debouncedQ]);

  const resolveImg = (path) => {
    if (!path) return "/no-image.png";
    const p = String(path).trim();
    if (!p) return "/no-image.png";
    if (/^https?:\/\//i.test(p)) return p;

    const base = (API_URL || "").replace(/\/$/, "");
    if (!base) return p.startsWith("/") ? p : `/${p}`;

    const normalizedPath = p.startsWith("/") ? p : `/${p}`;
    return `${base}${normalizedPath}`;
  };

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["mob-categories"],
    queryFn: fetchCategories,
    staleTime: 60000,
    retry: 1,
  });

  useEffect(() => {
    if (categoryId) setActiveCategoryId(categoryId);
  }, [categoryId]);

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

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["mob-providers", activeCategoryId],
    queryFn: () => fetchProviders(activeCategoryId),
    enabled: !!activeCategoryId,
    staleTime: 60000,
    retry: 1,
  });

  const { data: games = [], isLoading: loadingGames } = useQuery({
    queryKey: ["mob-games", activeCategoryId, activeProviderDbId, debouncedQ],
    queryFn: () =>
      fetchGames({
        categoryId: activeCategoryId,
        providerDbId: activeProviderDbId,
        q: debouncedQ,
      }),
    enabled: !!activeCategoryId,
    staleTime: 15000,
    retry: 1,
  });

  // ✅ client-side sorting priority for search
  const shownGames = useMemo(() => {
    let list = [...(games || [])];

    const term = (debouncedQ || q).trim().toLowerCase();
    if (!term) return list;

    const getPriority = (str = "") => {
      const s = String(str || "").toLowerCase();
      if (!s) return 0;
      if (s === term) return 100;
      if (s.startsWith(term)) return 50;
      if (s.includes(term)) return 10;
      return 1;
    };

    list.sort((a, b) => {
      const aName = a.gameName || a.gameUuid || a.gameId || "";
      const bName = b.gameName || b.gameUuid || b.gameId || "";

      const aScore = getPriority(aName);
      const bScore = getPriority(bName);

      if (bScore !== aScore) return bScore - aScore;
      return String(aName).localeCompare(String(bName));
    });

    return list;
  }, [games, q, debouncedQ]);

  // ✅ Pagination computed
  const total = shownGames.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pagedGames = useMemo(
    () => shownGames.slice(start, end),
    [shownGames, start, end],
  );

  const pageButtons = useMemo(() => {
    const tp = totalPages;
    const p = safePage;
    const out = [];

    const push = (v) => out.push(v);

    if (tp <= 3) {
      for (let i = 1; i <= tp; i++) push(i);
      return out;
    }

    push(1);

    if (p > 3) push("...");

    const s = Math.max(2, p - 1);
    const e = Math.min(tp - 1, p + 1);
    for (let i = s; i <= e; i++) push(i);

    if (p < tp - 2) push("...");

    push(tp);
    return out;
  }, [safePage, totalPages]);

  const goPrev = () => {
    if (!categories.length) return;
    const prev = (activeIndex - 1 + categories.length) % categories.length;
    const id = categories[prev]._id;
    setActiveProviderDbId("");
    setQ("");
    navigate(`/games-mobile/${id}`, { replace: true });
  };

  const goNext = () => {
    if (!categories.length) return;
    const next = (activeIndex + 1) % categories.length;
    const id = categories[next]._id;
    setActiveProviderDbId("");
    setQ("");
    navigate(`/games-mobile/${id}`, { replace: true });
  };

  // Scroll indicator logic
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
    const gameId = g.gameId || g.gameUuid || g._id;
    if (!gameId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game ID not found");
      return;
    }
    navigate(`/playgame/${gameId}`, { state: { game: g } });
  };

  const goPage = (p) => setPage(() => Math.min(totalPages, Math.max(1, p)));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Loading
        open={loadingCats || loadingProviders || loadingGames}
        text={isBangla ? "লোড হচ্ছে..." : "Loading..."}
      />

      {/* Top header */}
      <div className="mx-3 mt-3 rounded-xl bg-black text-white h-[54px] flex items-center px-3">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-2xl font-black"
          onClick={goPrev}
        >
          ‹
        </button>

        <div className="flex-1 text-center font-extrabold text-[20px] text-[#f5b400]">
          {loadingCats ? "..." : titleText || ""}
        </div>

        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-2xl font-black"
          onClick={goNext}
        >
          ›
        </button>
      </div>

      {/* Providers + Search */}
      <div className="mx-3 mt-3 bg-white rounded-xl shadow-sm p-3">
        <div
          ref={provScrollerRef}
          onScroll={updateThumb}
          className="flex items-center gap-3 overflow-x-auto whitespace-nowrap hide-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <button
            type="button"
            onClick={() => setActiveProviderDbId("")}
            className={[
              "shrink-0 w-[64px] h-[64px] rounded-xl border flex flex-col items-center justify-center text-[12px] font-extrabold",
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
                const iconSrc = resolveImg(p.providerIcon);

                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setActiveProviderDbId(p._id)}
                    className={[
                      "shrink-0 w-[64px] h-[64px] rounded-xl border flex flex-col items-center justify-center",
                      active ? "border-[#f5b400]" : "border-black/15",
                    ].join(" ")}
                    title={p.providerName}
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={p.providerName}
                        className="w-9 h-9 object-contain"
                        loading="lazy"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-black/5" />
                    )}
                    <div className="mt-1 text-[10px] font-extrabold text-black/70 truncate w-[58px] text-center">
                      {p.providerName}
                    </div>
                  </button>
                );
              })}
        </div>

        <div className="mt-3 px-2">
          <div
            ref={trackRef}
            className="h-[6px] w-full rounded-full bg-black/10 overflow-hidden relative"
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-[#f5b400]"
              style={{
                width: `${thumb.width}px`,
                transform: `translateX(${thumb.x}px)`,
              }}
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="h-[42px] rounded-full border border-black/20 bg-white flex items-center px-4 gap-2">
            <span className="text-black/40">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                isBangla ? "গেমের নাম লিখুন..." : "Search game name..."
              }
              className="w-full bg-transparent outline-none text-[14px] font-semibold text-black/70"
            />
          </div>
        </div>
      </div>

      {/* Games */}
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
                const imgSrc = resolveImg(g.image);
                const label = g.gameName || g.gameUuid || g.gameId || "Game";

                return (
                  <button
                    key={g._id}
                    type="button"
                    onClick={() => onPlay(g)}
                    className="group"
                    title={label}
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-black/10">
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={label}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          loading="lazy"
                          onError={(e) =>
                            (e.currentTarget.src = "/no-image.png")
                          }
                        />
                      </div>

                      <div className="absolute top-0 right-0 flex flex-col gap-1 items-end">
                        {g.isHot === true && (
                          <img
                            src={HOT_ICON}
                            alt="hot"
                            className="h-8 w-auto drop-shadow"
                            loading="lazy"
                          />
                        )}
                        {g.isNew === true && (
                          <img
                            src={NEW_ICON}
                            alt="new"
                            className="h-8 w-auto drop-shadow"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-1 text-[12px] font-bold text-black/80 truncate text-center px-1">
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ✅ Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={safePage <= 1}
                  className="px-3 py-2 rounded-lg font-bold border border-black/10 bg-white hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`px-3 py-2 rounded-lg font-extrabold border border-black/10 ${
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
                  className="px-3 py-2 rounded-lg font-bold border border-black/10 bg-white hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBangla ? "পরের" : "Next"}
                </button>
              </div>
            )}

            {/* ✅ Page info */}
            <div className="mt-3 text-center text-[12px] font-bold text-black/45">
              {isBangla ? "পেজ" : "Page"} {safePage}/{totalPages} •{" "}
              {isBangla ? "মোট" : "Total"} {total}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameCategoryMobile;
