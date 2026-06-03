// src/components/GameCategory/GameCategory.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";

import Loading from "../../components/Loading/Loading";
import Jackpot from "../Jackpot/Jackpot";

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

const JACKPOT_CATEGORY_ICON =
  "https://babu88.gold/static/svg/mobileMenu/icon_rng.svg";
const HOT_CATEGORY_ICON =
  "https://babu88.gold/static/svg/gameTabHolder/homepageHot.svg";

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

  if (!apiKey || !MASTER_API_URL) {
    return null;
  }

  const { data } = await axios.get(`${MASTER_API_URL}${url}`, {
    params,
    headers: {
      "x-api-key": apiKey,
    },
  });

  return data?.data;
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

const fetchGamesByCategory = async ({ categoryId, providerDbId = "" }) => {
  const data = await masterGet("/api/white-label/games", {
    categoryId,
    providerDbId,
  });

  return Array.isArray(data) ? data : [];
};

const fetchAllGamesAcrossCategories = async (categoryIds = []) => {
  const ids = Array.isArray(categoryIds) ? categoryIds.filter(Boolean) : [];

  if (!ids.length) return [];

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await fetchGamesByCategory({ categoryId: id });
      } catch {
        return [];
      }
    }),
  );

  const merged = results.flat();

  const map = new Map();

  for (const g of merged) {
    const key = String(g?._id || g?.gameUId || g?.gameId || "");

    if (key) {
      map.set(key, g);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const at = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bt - at;
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

  return "/no-image.png";
};

const GameCard = ({ game, onClick, ui }) => {
  const imgSrc = getGameImage(game);
  const gameName =
    game?.gameName || game?.name || game?.gameUId || game?.gameId || "Game";

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
      title={gameName}
      type="button"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={imgSrc}
          alt={gameName}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/no-image.png";
          }}
        />
      </div>

      <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
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

const ProviderCard = ({ provider, onClick }) => {
  const img = provider?.providerImage || provider?.providerIcon || "";
  const imgSrc = img ? masterFileUrl(img) : "/no-image.png";
  const name = provider?.providerName || "";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      type="button"
      className="relative overflow-hidden rounded-2xl shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#fff",
      }}
      title={name}
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-black/5">
        <img
          src={imgSrc}
          alt={name || "provider"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/no-image.png";
          }}
        />
      </div>

      {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/65 via-black/15 to-transparent" /> */}

      {/* {name ? (
        <div className="absolute inset-x-0 bottom-2 px-2 text-center">
          <div className="line-clamp-1 text-[12px] font-extrabold text-white drop-shadow">
            {name}
          </div>
        </div>
      ) : null} */}

      <div className="absolute right-1 top-1 flex flex-col items-end gap-1">
        {provider?.isHot === true && (
          <img
            src={HOT_ICON}
            alt="hot"
            className="h-7 w-auto drop-shadow"
            loading="lazy"
          />
        )}

        {provider?.isNew === true && (
          <img
            src={NEW_ICON}
            alt="new"
            className="h-7 w-auto drop-shadow"
            loading="lazy"
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition hover:opacity-100">
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(245,180,0,0.18),transparent_60%)]" />
      </div>
    </motion.button>
  );
};

const GameCategory = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

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
    queryKey: ["white-label-home-categories"],
    queryFn: fetchCategories,
    staleTime: 60000,
    retry: false,
  });

  const dbCategories = useMemo(() => {
    const arr = Array.isArray(categoriesRaw) ? [...categoriesRaw] : [];

    arr.sort((a, b) => {
      const aRaw = parseInt(a?.order, 10);
      const bRaw = parseInt(b?.order, 10);

      const aHas = Number.isFinite(aRaw) && aRaw > 0;
      const bHas = Number.isFinite(bRaw) && bRaw > 0;

      if (aHas && bHas) {
        if (aRaw !== bRaw) return aRaw - bRaw;
      } else if (aHas && !bHas) {
        return -1;
      } else if (!aHas && bHas) {
        return 1;
      }

      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();

      return at - bt;
    });

    return arr;
  }, [categoriesRaw]);

  const virtualCats = useMemo(() => {
    return [
      {
        _id: "jackpot",
        isVirtual: true,
        iconUrl: JACKPOT_CATEGORY_ICON,
        categoryName: { bn: "জ্যাকপট", en: "Jackpot" },
      },
      {
        _id: "hot",
        isVirtual: true,
        iconUrl: HOT_CATEGORY_ICON,
        categoryName: { bn: "হট", en: "Hot" },
      },
    ];
  }, []);

  const categories = useMemo(() => {
    return [...virtualCats, ...(dbCategories || [])];
  }, [virtualCats, dbCategories]);

  const [active, setActive] = useState("jackpot");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [active]);

  const dbCategoryIds = useMemo(
    () => (dbCategories || []).map((c) => c._id).filter(Boolean),
    [dbCategories],
  );

  const isVirtual = active === "jackpot" || active === "hot";
  const isDbCategory = !!active && !isVirtual;

  const {
    data: allGames = [],
    isLoading: loadingAllGames,
    isFetching: fetchingAllGames,
  } = useQuery({
    queryKey: ["white-label-all-games-across-cats", dbCategoryIds],
    queryFn: () => fetchAllGamesAcrossCategories(dbCategoryIds),
    enabled: isVirtual && dbCategoryIds.length > 0,
    staleTime: 30_000,
    retry: false,
  });

  const virtualGames = useMemo(() => {
    const list = Array.isArray(allGames) ? allGames : [];

    if (active === "jackpot") {
      return list.filter((g) => g?.isJackpot === true);
    }

    if (active === "hot") {
      return list.filter((g) => g?.isHot === true);
    }

    return [];
  }, [allGames, active]);

  const totalVirtual = virtualGames.length;
  const totalPages = Math.max(1, Math.ceil(totalVirtual / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  const pagedVirtualGames = useMemo(
    () => virtualGames.slice(start, start + PAGE_SIZE),
    [virtualGames, start],
  );

  const {
    data: providers = [],
    isLoading: loadingProviders,
    isFetching: fetchingProviders,
  } = useQuery({
    queryKey: ["white-label-category-providers-home", active],
    queryFn: () => fetchProviders(active),
    enabled: isDbCategory,
    staleTime: 60_000,
    retry: false,
  });

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
    const gameId = game?.gameId || game?.gameUId;

    if (!gameId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game ID not found");
      return;
    }

    navigate(`/playgame/${gameId}`, { state: { game } });
  };

  const handleProviderOpen = (categoryId, providerDbId) => {
    if (!categoryId || !providerDbId) return;
    navigate(`/games-mobile/${categoryId}?provider=${providerDbId}`);
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p) => setPage(() => Math.min(totalPages, Math.max(1, p)));

  const pageButtons = useMemo(() => {
    const p = safePage;
    const tp = totalPages;
    const out = [];

    if (tp <= 5) {
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

  const overlayLoading =
    loadingUi ||
    loadingCats ||
    (isVirtual ? loadingAllGames || fetchingAllGames : false) ||
    (isDbCategory ? loadingProviders || fetchingProviders : false);

  return (
    <div className="w-full">
      <Loading open={overlayLoading} />

      <div
        className="mt-4 w-full rounded-md px-2"
        style={{ backgroundColor: hexToRgba(ui.wrapBg, ui.wrapOpacity) }}
      >
        <div
          ref={scrollerRef}
          onScroll={updateThumb}
          className="hide-scrollbar mb-2 flex items-center gap-3 overflow-x-auto whitespace-nowrap rounded-md py-2 scroll-smooth [scrollbar-width:none]"
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

              const iconSrc = c?.isVirtual
                ? c.iconUrl
                : c.iconImage
                  ? masterFileUrl(c.iconImage)
                  : "";

              return (
                <button
                  key={c._id}
                  ref={(el) => {
                    if (el) btnRefs.current[c._id] = el;
                  }}
                  onClick={() => handleCategoryClick(c._id)}
                  type="button"
                  className={`hide-scrollbar inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-extrabold transition ${
                    isActive ? "shadow-sm" : "hover:bg-black/5"
                  }`}
                  style={{
                    fontSize: `${ui.btnTextSize}px`,
                    backgroundColor: isActive
                      ? ui.btnActiveBg
                      : ui.btnInactiveBg,
                    color: isActive ? ui.btnActiveText : ui.btnInactiveTextRgba,
                  }}
                >
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt={label}
                      className="h-5 w-5 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="inline-block h-5 w-5" />
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
            className="relative h-[6px] w-full overflow-hidden rounded-full"
            style={{ backgroundColor: ui.trackBgRgba }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ backgroundColor: ui.thumbBg }}
              animate={{ width: thumb.width, x: thumb.x }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {active === "jackpot" ? <Jackpot /> : null}

      <div className="mt-4">
        {isVirtual ? (
          totalVirtual === 0 ? (
            <div
              className="py-10 text-center font-semibold"
              style={{
                color: ui.emptyTextRgba,
                fontSize: `${ui.emptyTextSize}px`,
              }}
            >
              {active === "jackpot"
                ? isBangla
                  ? "জ্যাকপট গেম নেই"
                  : "No jackpot games"
                : isBangla
                  ? "হট গেম নেই"
                  : "No hot games"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 px-2">
                {pagedVirtualGames.map((game) => (
                  <GameCard
                    key={game._id || game.gameUId || game.gameId}
                    game={game}
                    onClick={() => handlePlay(game)}
                    ui={ui}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 px-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={page <= 1}
                      className="rounded-lg border border-black/10 bg-white px-3 py-2 font-bold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBangla ? "পূর্বের" : "Prev"}
                    </button>

                    {pageButtons.map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-2 text-black/50"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => goPage(p)}
                          className={`rounded-lg border border-black/10 px-3 py-2 font-extrabold ${
                            p === safePage
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
                      className="rounded-lg border border-black/10 bg-white px-3 py-2 font-bold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBangla ? "পরের" : "Next"}
                    </button>
                  </div>

                  <div className="mt-2 text-center text-[12px] text-black/50">
                    {`${isBangla ? "মোট" : "Total"} ${totalVirtual} ${
                      isBangla ? "গেম" : "games"
                    } • ${isBangla ? "পেজ" : "Page"} ${safePage}/${totalPages}`}
                  </div>
                </>
              )}
            </>
          )
        ) : providers.length === 0 ? (
          <div
            className="py-10 text-center font-semibold"
            style={{
              color: ui.emptyTextRgba,
              fontSize: `${ui.emptyTextSize}px`,
            }}
          >
            {isBangla ? "কোনো প্রোভাইডার নেই" : "No providers"}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 px-1">
            {providers.map((p) => (
              <ProviderCard
                key={p._id}
                provider={p}
                onClick={() => handleProviderOpen(active, p._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCategory;
