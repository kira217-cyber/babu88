import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

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

// ✅ DB categories (active)
const fetchCategories = async () => {
  const { data } = await api.get("/api/public/game-categories");
  return data?.data || [];
};

// ✅ DB games by categoryId
const fetchGamesByCategory = async (categoryId) => {
  const qs = new URLSearchParams();
  qs.set("categoryId", categoryId);
  const { data } = await api.get(`/api/public/all-games?${qs.toString()}`);
  return data?.data || [];
};

const GameCard = ({ game, onClick, ui, apiBase }) => {
  const imgSrc = game?.image ? `${apiBase}${game.image}` : "/no-image.png";

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

      {/* ✅ HOT/NEW icon badges (same position, just image instead of text) */}
      <div className="absolute top-0 right-0 flex flex-col gap-1 items-end">
        {game?.isHot ? (
          <img
            src={HOT_ICON}
            alt="hot"
            className="h-8 w-auto drop-shadow"
            loading="lazy"
          />
        ) : null}
        {game?.isNew ? (
          <img
            src={NEW_ICON}
            alt="new"
            className="h-8 w-auto drop-shadow"
            loading="lazy"
          />
        ) : null}
      </div>
    </motion.button>
  );
};

const GameCategory = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;

  // 🎨 UI color config (unchanged)
  const { data: colorDoc } = useQuery({
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

  // ✅ categories from DB
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["public-mobile-categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ active categoryId
  const [active, setActive] = useState("");

  // set default active to first category
  useEffect(() => {
    if (!active && categories?.length) {
      setActive(categories[0]._id);
    }
  }, [categories, active]);

  // ✅ games for active category
  const { data: games = [], isLoading: loadingGames } = useQuery({
    queryKey: ["public-mobile-games", active],
    queryFn: () => fetchGamesByCategory(active),
    enabled: !!active,
    staleTime: 30_000,
    retry: 1,
  });

  // ✅ category scroll refs (unchanged)
  const scrollerRef = useRef(null);
  const trackRef = useRef(null);
  const btnRefs = useRef({}); // key -> element

  // ✅ underline thumb state (unchanged)
  const [thumb, setThumb] = useState({ width: 40, x: 0 });

  const updateThumb = () => {
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
  };

  useEffect(() => {
    updateThumb();
    const onResize = () => updateThumb();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => updateThumb());
  }, [active]);

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
    scrollToButtonCenter(id);
  };

  const handlePlay = (game) => {
    const id = game?.gameUuid || game?.gameId || game?._id;
    navigate(`/playgame/${id}`, { state: { game } });
  };

  return (
    <div className="w-full">
      {/* ✅ Category Bar (unchanged structure/design) */}
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
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}
          </style>

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
                  {/* ✅ category icon from DB (iconImage) */}
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

        {/* ✅ Underline thumb (unchanged) */}
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

      {/* ✅ Games Grid (unchanged layout) */}
      <div className="mt-4">
        {loadingGames ? (
          <div
            className="text-center py-10 font-semibold"
            style={{
              color: ui.emptyTextRgba,
              fontSize: `${ui.emptyTextSize}px`,
            }}
          >
            Loading...
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
        )}
      </div>
    </div>
  );
};

export default GameCategory;
