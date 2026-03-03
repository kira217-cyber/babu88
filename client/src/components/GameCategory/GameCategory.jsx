import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";

// ✅ NEW: use your overlay loading component
import Loading from "../../components/Loading/Loading";

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

const PAGE_SIZE = 21;

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
};

const fetchGameCategoryColor = async () => {
  const { data } = await api.get("/api/gamecategory-color");
  return data;
};

const fetchCategories = async () => {
  const { data } = await api.get("/api/public/game-categories");
  return data?.data || [];
};

// ✅ Fetch games (supports server pagination if backend honors it; otherwise slices client-side safely)
const fetchGamesByCategory = async (categoryId, page, limit) => {
  const qs = new URLSearchParams();
  qs.set("categoryId", categoryId);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const { data } = await api.get(`/api/public/all-games?${qs.toString()}`);

  const raw = data?.data;

  // pattern: { data: { items: [], total, page, limit } }
  if (raw && typeof raw === "object" && Array.isArray(raw.items)) {
    const items = raw.items || [];
    const total = Number(raw.total) || items.length || 0;
    const pg = Number(raw.page) || page;
    const lim = Number(raw.limit) || limit;
    return { items, total, page: pg, limit: lim };
  }

  // pattern: { data: [...] }
  const list = Array.isArray(raw) ? raw : [];

  const totalFromApi = Number(data?.total) || Number(data?.pagination?.total);

  const total =
    Number.isFinite(totalFromApi) && totalFromApi > 0
      ? totalFromApi
      : list.length;

  // If backend returns full list, do client-side slice (safe even if backend already paginates)
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  return { items, total, page, limit };
};

const GameCard = ({ game, onClick, ui, apiBase }) => {
  const imgSrc =
    game?.image && String(game.image).trim()
      ? /^https?:\/\//i.test(String(game.image).trim())
        ? String(game.image).trim()
        : `${apiBase}${String(game.image).trim()}`
      : "/no-image.png";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl ring-1 shadow-md"
      style={{
        backgroundColor: hexToRgba(ui.cardBg, ui.cardBgOpacity),
        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
        border: `1px solid ${hexToRgba(ui.cardRing, ui.cardRingOpacity)}`,
      }}
      title={game?.gameName || game?.gameUuid || game?.gameId || "Game"}
      type="button"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={imgSrc}
          alt={game?.gameName || "game"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/no-image.png")}
        />
      </div>

      <div className="absolute top-0 right-0 flex flex-col gap-1 items-end">
        {game?.isHot === true && (
          <img
            src={HOT_ICON}
            alt="hot"
            className="h-8 w-auto drop-shadow"
            loading="lazy"
          />
        )}
        {game?.isNew === true && (
          <img
            src={NEW_ICON}
            alt="new"
            className="h-8 w-auto drop-shadow"
            loading="lazy"
          />
        )}
      </div>
    </motion.button>
  );
};

const GameCategory = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL;

  const { data: colorDoc, isLoading: loadingUi } = useQuery({
    queryKey: ["gamecategory-color"],
    queryFn: fetchGameCategoryColor,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      wrapBg: d.wrapBg || "#ffffff",
      wrapOpacity: d.wrapOpacity ?? 0.9,
      scrollerBg: d.scrollerBg || "#F5F5F5",

      btnActiveBg: d.btnActiveBg || "#F5B400",
      btnActiveText: d.btnActiveText || "#000000",

      btnInactiveBg: d.btnInactiveBg || "#ffffff",
      btnInactiveTextRgba: hexToRgba(
        d.btnInactiveText || "#000000",
        d.btnInactiveTextOpacity ?? 0.8,
      ),

      btnTextSize: d.btnTextSize ?? 14,

      trackBgRgba: hexToRgba(d.trackBg || "#000000", d.trackOpacity ?? 0.1),
      thumbBg: d.thumbBg || "#C49A00",

      emptyTextRgba: hexToRgba(
        d.emptyText || "#000000",
        d.emptyTextOpacity ?? 0.6,
      ),
      emptyTextSize: d.emptyTextSize ?? 14,

      cardBg: d.cardBg || "#ffffff",
      cardBgOpacity: d.cardBgOpacity ?? 0.05,

      cardRing: d.cardRing || "#000000",
      cardRingOpacity: d.cardRingOpacity ?? 0.1,
    };
  }, [colorDoc]);

  const { data: categoriesRaw = [], isLoading: loadingCats } = useQuery({
    queryKey: ["public-mobile-categories"],
    queryFn: fetchCategories,
    staleTime: 60000,
    retry: 1,
  });

  // ✅ sort categories by order ASC (1 first)
  const categories = useMemo(() => {
    const arr = Array.isArray(categoriesRaw) ? [...categoriesRaw] : [];
    arr.sort((a, b) => {
      const aRaw = parseInt(a?.order, 10);
      const bRaw = parseInt(b?.order, 10);

      const aHas = Number.isFinite(aRaw) && aRaw > 0;
      const bHas = Number.isFinite(bRaw) && bRaw > 0;

      if (aHas && bHas) {
        if (aRaw !== bRaw) return aRaw - bRaw; // ASC
      } else if (aHas && !bHas) return -1;
      else if (!aHas && bHas) return 1;

      // fallback stable
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return at - bt;
    });
    return arr;
  }, [categoriesRaw]);

  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);

  // ✅ initial active = first category (after sorting)
  useEffect(() => {
    if (!active && categories?.length) {
      setActive(categories[0]._id);
      setPage(1);
    }
  }, [categories, active]);

  // ✅ when active category changes => reset page = 1
  useEffect(() => {
    if (active) setPage(1);
  }, [active]);

  const {
    data: gameResp,
    isLoading: loadingGames,
    isFetching: fetchingGames,
  } = useQuery({
    queryKey: ["public-mobile-games", active, page],
    queryFn: () => fetchGamesByCategory(active, page, PAGE_SIZE),
    enabled: !!active,
    staleTime: 30000,
    retry: 1,
    keepPreviousData: true,
  });

  const games = gameResp?.items || [];
  const totalGames = Number(gameResp?.total) || 0;
  const totalPages = Math.max(1, Math.ceil(totalGames / PAGE_SIZE));

  const scrollerRef = useRef(null);
  const trackRef = useRef(null);
  const btnRefs = useRef({});

  const [thumb, setThumb] = useState({ width: 40, x: 0 });

  const updateThumb = useCallback(() => {
    const scroller = scrollerRef.current;
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
  }, []);

  useEffect(() => {
    updateThumb();
    window.addEventListener("resize", updateThumb);
    return () => window.removeEventListener("resize", updateThumb);
  }, [updateThumb]);

  useEffect(() => {
    requestAnimationFrame(() => updateThumb());
  }, [active, categories, updateThumb]);

  const scrollToButtonCenter = (id) => {
    const scroller = scrollerRef.current;
    const btn = btnRefs.current[id];
    if (!scroller || !btn) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const currentLeft = scroller.scrollLeft;
    const btnCenter =
      btnRect.left - scrollerRect.left + btnRect.width / 2 + currentLeft;
    const target = btnCenter - scroller.clientWidth / 2;

    scroller.scrollTo({ left: target, behavior: "smooth" });
  };

  const handleCategoryClick = (id) => {
    setActive(id);
    setPage(1);
    scrollToButtonCenter(id);
  };

  const handlePlay = (game) => {
    const gameId = game?.gameId;

    if (!gameId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game ID not found");
      return;
    }

    navigate(`/playgame/${gameId}`, { state: { game } });
  };

  // ✅ pagination controls
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p) => setPage(() => Math.min(totalPages, Math.max(1, p)));

  const pageButtons = useMemo(() => {
    const p = page;
    const tp = totalPages;
    const out = [];

    const push = (v) => out.push(v);

    if (tp <= 5) {
      for (let i = 1; i <= tp; i++) push(i);
      return out;
    }

    push(1);

    if (p > 3) push("...");

    const start = Math.max(2, p - 1);
    const end = Math.min(tp - 1, p + 1);
    for (let i = start; i <= end; i++) push(i);

    if (p < tp - 2) push("...");

    push(tp);

    return out;
  }, [page, totalPages]);

  // ✅ show loading overlay until games are ready
  const overlayLoading =
    loadingUi || loadingCats || loadingGames || fetchingGames;

  return (
    <div className="w-full">
      {/* ✅ Your Loading Overlay (shows until games load) */}
      <Loading open={overlayLoading} />

      {/* Category Bar */}
      <div
        className="w-full rounded-md px-2 mt-4"
        style={{ backgroundColor: hexToRgba(ui.wrapBg, ui.wrapOpacity) }}
      >
        <div
          ref={scrollerRef}
          onScroll={updateThumb}
          className="
            flex items-center gap-3 py-2
            overflow-x-auto whitespace-nowrap
            scroll-smooth
            [scrollbar-width:none]
            rounded-md mb-2
          "
          style={{
            WebkitOverflowScrolling: "touch",
            backgroundColor: ui.scrollerBg,
          }}
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

          {loadingCats ? (
            <div className="px-4 py-2 font-bold text-black/60">Loading...</div>
          ) : (
            categories.map((c) => {
              const isActive = active === c._id;
              const label = isBangla ? c.categoryName?.bn : c.categoryName?.en;

              return (
                <button
                  key={c._id}
                  ref={(el) => {
                    if (el) btnRefs.current[c._id] = el;
                  }}
                  onClick={() => handleCategoryClick(c._id)}
                  type="button"
                  className={`
                    hide-scrollbar
                    shrink-0 inline-flex items-center gap-2
                    px-4 py-2 rounded-full
                    font-extrabold
                    transition
                    ${isActive ? "shadow-sm" : "hover:bg-black/5"}
                  `}
                  style={{
                    fontSize: `${ui.btnTextSize}px`,
                    backgroundColor: isActive
                      ? ui.btnActiveBg
                      : ui.btnInactiveBg,
                    color: isActive ? ui.btnActiveText : ui.btnInactiveTextRgba,
                  }}
                >
                  {c.iconImage ? (
                    <img
                      src={`${API_URL}${c.iconImage}`}
                      alt={label}
                      className="w-5 h-5 object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="w-5 h-5 inline-block" />
                  )}
                  <span>{label}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-3 pb-2">
          <div
            ref={trackRef}
            className="h-[6px] w-full rounded-full overflow-hidden relative"
            style={{ backgroundColor: ui.trackBgRgba }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ backgroundColor: ui.thumbBg }}
              animate={{ width: thumb.width, x: thumb.x }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="mt-4">
        {loadingGames && !games.length ? (
          <div
            className="text-center py-10 font-semibold"
            style={{
              color: ui.emptyTextRgba,
              fontSize: `${ui.emptyTextSize}px`,
            }}
          >
            {isBangla ? "গেম লোড হচ্ছে..." : "Loading games..."}
          </div>
        ) : games.length === 0 ? (
          <div
            className="text-center py-10 font-semibold"
            style={{
              color: ui.emptyTextRgba,
              fontSize: `${ui.emptyTextSize}px`,
            }}
          >
            {isBangla
              ? "এই ক্যাটাগরিতে কোনো গেম নেই"
              : "No games in this category"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 px-2">
              {games.map((game) => (
                <GameCard
                  key={game._id}
                  game={game}
                  onClick={() => handlePlay(game)}
                  ui={ui}
                  apiBase={API_URL}
                />
              ))}
            </div>

            {/* ✅ Pagination */}
            {totalPages > 1 && (
              <>
                <div className="mt-5 px-2 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={page <= 1}
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
                          p === page
                            ? "bg-[#F5B400] text-black"
                            : "bg-white hover:bg-black/5"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={page >= totalPages}
                    className="px-3 py-2 rounded-lg font-bold border border-black/10 bg-white hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBangla ? "পরের" : "Next"}
                  </button>
                </div>

                <div className="mt-2 text-center text-[12px] text-black/50">
                  {`${isBangla ? "মোট" : "Total"} ${totalGames} ${
                    isBangla ? "গেম" : "games"
                  } • ${isBangla ? "পেজ" : "Page"} ${page}/${totalPages}`}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameCategory;
