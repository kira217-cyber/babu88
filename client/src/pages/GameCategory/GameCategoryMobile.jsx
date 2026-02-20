import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

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

  // ✅ helper: absolute vs relative path
  const resolveImg = (path) => {
    if (!path) return "";
    const p = String(path).trim();
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p; // absolute URL
    if (!API_URL) return p; // if env missing, try relative
    return `${API_URL}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  // categories
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["mob-categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
    retry: 1,
  });

  // keep in sync with route param
  useEffect(() => {
    if (categoryId) setActiveCategoryId(categoryId);
  }, [categoryId]);

  // active index for arrows
  const activeIndex = useMemo(() => {
    const idx = categories.findIndex((c) => c._id === activeCategoryId);
    return idx >= 0 ? idx : 0;
  }, [categories, activeCategoryId]);

  const activeCategory = useMemo(() => {
    return categories[activeIndex] || null;
  }, [categories, activeIndex]);

  const titleText = useMemo(() => {
    if (!activeCategory) return "";
    return isBangla
      ? activeCategory.categoryName?.bn
      : activeCategory.categoryName?.en;
  }, [activeCategory, isBangla]);

  // providers for category
  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["mob-providers", activeCategoryId],
    queryFn: () => fetchProviders(activeCategoryId),
    enabled: !!activeCategoryId,
    staleTime: 60_000,
    retry: 1,
  });

  // games (server search)
  const { data: games = [], isLoading: loadingGames } = useQuery({
    queryKey: ["mob-games", activeCategoryId, activeProviderDbId, q],
    queryFn: () =>
      fetchGames({
        categoryId: activeCategoryId,
        providerDbId: activeProviderDbId,
        q,
      }),
    enabled: !!activeCategoryId,
    staleTime: 15_000,
    retry: 1,
  });

  // ✅ client-side priority: searched game first
  const shownGames = useMemo(() => {
    const list = [...games];
    const s = q.trim().toLowerCase();
    if (!s) return list;

    const score = (name) => {
      const n = String(name || "").toLowerCase();
      if (!n) return 0;
      if (n.startsWith(s)) return 3;
      if (n.includes(s)) return 2;
      return 1;
    };

    list.sort((a, b) => {
      const an = a.gameName || a.gameUuid || a.gameId;
      const bn = b.gameName || b.gameUuid || b.gameId;
      return score(bn) - score(an);
    });

    return list;
  }, [games, q]);

  // arrows change category
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

  // provider scroller underline like screenshot
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
    const onResize = () => updateThumb();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => updateThumb());
  }, [activeCategoryId, providers]);

  const onPlay = (g) => {
    const id = g.gameUuid || g.gameId || g._id;
    navigate(`/playgame/${id}`, { state: { game: g } });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ✅ Top black header */}
      <div className="mx-3 mt-3 rounded-xl bg-black text-white h-[54px] flex items-center px-3">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-2xl font-black"
          onClick={goPrev}
          aria-label="Prev category"
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
          aria-label="Next category"
        >
          ›
        </button>
      </div>

      {/* ✅ Provider row (icons) */}
      <div className="mx-3 mt-3 bg-white rounded-xl shadow-sm p-3">
        <div
          ref={provScrollerRef}
          onScroll={updateThumb}
          className="
            flex items-center gap-3
            overflow-x-auto whitespace-nowrap
            [scrollbar-width:none]
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar{display:none;}`}</style>

          {/* All */}
          <button
            type="button"
            onClick={() => setActiveProviderDbId("")}
            className={[
              "shrink-0 w-[64px] h-[64px] rounded-xl border flex flex-col items-center justify-center",
              !activeProviderDbId ? "border-[#f5b400]" : "border-black/15",
            ].join(" ")}
          >
            <div className="text-[12px] font-extrabold text-black/80">
              {isBangla ? "All" : "All"}
            </div>
          </button>

          {loadingProviders
            ? null
            : providers.map((p) => {
                const active = activeProviderDbId === p._id;

                // ✅ FIX: correct URL (absolute/relative)
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
                        onError={(e) => {
                          // fallback box only (design same)
                          e.currentTarget.style.display = "none";
                        }}
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

        {/* ✅ Yellow underline indicator */}
        <div className="mt-3 px-2">
          <div
            ref={trackRef}
            className="h-[6px] w-full rounded-full bg-black/10 overflow-hidden relative"
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-[#f5b400]"
              style={{
                width: thumb.width,
                transform: `translateX(${thumb.x}px)`,
              }}
            />
          </div>
        </div>

        {/* ✅ Search bar */}
        <div className="mt-3">
          <div className="h-[42px] rounded-full border border-black/20 bg-white flex items-center px-4 gap-2">
            <span className="text-black/40">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search games"
              className="w-full bg-transparent outline-none text-[14px] font-semibold text-black/70"
            />
          </div>
        </div>
      </div>

      {/* ✅ Games grid 3 cols */}
      <div className="mx-3 mt-3 pb-10">
        {loadingGames ? (
          <div className="py-10 text-center font-bold text-black/50">
            Loading...
          </div>
        ) : shownGames.length === 0 ? (
          <div className="py-10 text-center font-bold text-black/50">
            No games
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {shownGames.map((g) => {
              const imgSrc = g.image ? resolveImg(g.image) : "/no-image.png";
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
                        onError={(e) => (e.currentTarget.src = "/no-image.png")}
                      />
                    </div>

                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      {g.isHot ? (
                        <img
                          src={HOT_ICON}
                          alt="hot"
                          className="h-5 w-auto drop-shadow"
                          loading="lazy"
                        />
                      ) : null}
                      {g.isNew ? (
                        <img
                          src={NEW_ICON}
                          alt="new"
                          className="h-5 w-auto drop-shadow"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-1 text-[12px] font-bold text-black/80 truncate text-center">
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCategoryMobile;