// src/components/GameCategory/GameCategory.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import Loading from "../../components/Loading/Loading";

const PAGE_SIZE = 30;

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  const base = String(MASTER_API_URL || "").replace(/\/+$/, "");
  const cleanPath = String(path).startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

const getSavedApiKey = async () => {
  const res = await api.get("/api/admin/game-api-key");
  const setting = res.data?.data?.setting;

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

const fetchCategory = async (categoryId) => {
  return await masterGet(`/api/white-label/game-categories/${categoryId}`);
};

const fetchGames = async ({ categoryId, providerDbId }) => {
  const data = await masterGet("/api/white-label/games", {
    categoryId,
    providerDbId: providerDbId || "",
  });

  return Array.isArray(data) ? data : [];
};

const getGameImage = (game) => {
  const customImage = String(game?.image || "").trim();

  // ✅ DB custom image: /uploads/... হলে master server URL add হবে
  if (customImage) {
    return fileUrl(customImage);
  }

  // ✅ Oracle image: already full https URL, direct show হবে
  const oracleImage = String(game?.oracleImage || "").trim();

  if (oracleImage) {
    return oracleImage;
  }

  return "/no-image.png";
};

const GameCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const { isBangla } = useLanguage();

  const providerDbId = sp.get("provider") || "";

  const [sortKey, setSortKey] = useState("default");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: cat,
    isLoading: loadingCat,
    isFetching: fetchingCat,
  } = useQuery({
    queryKey: ["white-label-category", categoryId],
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 60000,
    retry: false,
  });

  const {
    data: games = [],
    isLoading: loadingGames,
    isFetching: fetchingGames,
  } = useQuery({
    queryKey: ["white-label-games", categoryId, providerDbId],
    queryFn: () => fetchGames({ categoryId, providerDbId }),
    enabled: !!categoryId,
    staleTime: 30000,
    retry: false,
  });

  const providers = useMemo(() => {
    return Array.isArray(cat?.providers)
      ? cat.providers.filter((p) => p?.status === "active" || !p?.status)
      : [];
  }, [cat]);

  const categoryTitle = useMemo(
    () =>
      cat ? (isBangla ? cat.categoryTitle?.bn : cat.categoryTitle?.en) : "",
    [cat, isBangla],
  );

  const categoryName = useMemo(
    () => (cat ? (isBangla ? cat.categoryName?.bn : cat.categoryName?.en) : ""),
    [cat, isBangla],
  );

  const setProvider = (id) => {
    const next = new URLSearchParams(sp);

    if (!id) {
      next.delete("provider");
    } else {
      next.set("provider", id);
    }

    setSp(next, { replace: true });
  };

  useEffect(() => {
    setPage(1);
  }, [categoryId, providerDbId, sortKey, q]);

  const filteredSortedGames = useMemo(() => {
    let list = Array.isArray(games) ? [...games] : [];

    list = list.filter((g) => g?.status === "active" || !g?.status);

    const query = q.trim().toLowerCase();

    if (query) {
      list = list.filter((g) => {
        const name = String(g.gameName || g.name || "").toLowerCase();
        const id = String(g.gameId || "").toLowerCase();
        const code = String(g.game_code || "").toLowerCase();
        const uuid = String(g.gameUuid || g._id || "").toLowerCase();

        return (
          name.includes(query) ||
          id.includes(query) ||
          code.includes(query) ||
          uuid.includes(query)
        );
      });
    }

    if (sortKey === "hot") {
      list.sort((a, b) => Boolean(b.isHot) - Boolean(a.isHot));
    } else if (sortKey === "new") {
      list.sort((a, b) => Boolean(b.isNew) - Boolean(a.isNew));
    } else if (sortKey === "latest") {
      list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    return list;
  }, [games, q, sortKey]);

  const total = filteredSortedGames.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pagedGames = useMemo(() => {
    return filteredSortedGames.slice(start, end);
  }, [filteredSortedGames, start, end]);

  const pageButtons = useMemo(() => {
    const p = safePage;
    const tp = totalPages;
    const out = [];

    if (tp <= 7) {
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

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p) => setPage(() => Math.min(totalPages, Math.max(1, p)));

  if (loadingCat) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-bold text-black/70">
        Loading...
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-bold text-black/70">
        {isBangla
          ? "ক্যাটাগরি পাওয়া যায়নি অথবা API key inactive"
          : "Category not found or API key inactive"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Loading
        open={loadingCat || loadingGames || fetchingCat || fetchingGames}
        text={isBangla ? "লোড হচ্ছে..." : "Loading..."}
      />

      <div className="relative h-[240px] w-full overflow-hidden md:h-[320px]">
        {cat.bannerImage ? (
          <img
            src={fileUrl(cat.bannerImage)}
            alt={categoryName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-[#0b0b2b] to-[#001a5a]" />
        )}

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-xl">
              <div className="text-2xl font-extrabold text-white md:text-4xl">
                {categoryName}
              </div>

              <div className="mt-2 text-sm font-semibold text-white/85 md:text-base">
                {categoryTitle}
              </div>

              <div className="mt-2 text-xs text-white/70 md:text-sm">
                {isBangla
                  ? "প্রোভাইডার বেছে নিন এবং আপনার পছন্দের গেম খেলুন"
                  : "Pick a provider and play your favorite games"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4">
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <button
              type="button"
              onClick={() => setProvider("")}
              className={[
                "flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4 text-[13px] font-extrabold transition",
                !providerDbId
                  ? "border-[#f5b400] bg-[#f5b400] text-black"
                  : "border-[#f5b400] bg-white text-black hover:bg-yellow-50",
              ].join(" ")}
            >
              {isBangla ? "সব" : "All"}
            </button>

            {providers.map((p) => {
              const activeP = providerDbId === p._id;

              return (
                <button
                  type="button"
                  key={p._id}
                  onClick={() => setProvider(p._id)}
                  className={[
                    "flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4 text-[12px] font-extrabold transition",
                    activeP
                      ? "border-[#f5b400] bg-[#f5b400] text-black"
                      : "border-[#f5b400] bg-white text-black hover:bg-yellow-50",
                  ].join(" ")}
                  title={p.providerName}
                >
                  {p.providerIcon ? (
                    <img
                      src={fileUrl(p.providerIcon)}
                      alt={p.providerName}
                      className="h-10 w-10 rounded-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}

                  <span className="max-w-[130px] truncate">
                    {p.providerName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="whitespace-nowrap text-sm font-extrabold text-black/70">
              {isBangla ? "গেমগুলি সাজান:" : "Sort Games:"}
            </div>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-[38px] cursor-pointer rounded-full border border-black/20 bg-white px-4 text-sm font-bold outline-none"
            >
              <option value="default">{isBangla ? "ডিফল্ট" : "Default"}</option>
              <option value="latest">{isBangla ? "সর্বশেষ" : "Latest"}</option>
              <option value="hot">{isBangla ? "হট" : "Hot"}</option>
              <option value="new">{isBangla ? "নতুন" : "New"}</option>
            </select>
          </div>

          <div className="flex w-full items-center justify-end gap-2 md:w-auto">
            <div className="flex h-[38px] min-w-[240px] items-center gap-2 rounded-full border border-black/20 bg-white px-4 md:min-w-[300px]">
              <span className="text-black/40">🔍</span>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  isBangla ? "খেলা অনুসন্ধান করুন" : "Search games..."
                }
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pb-10">
          {loadingGames ? (
            <div className="py-16 text-center font-bold text-black/60">
              Loading games...
            </div>
          ) : filteredSortedGames.length === 0 ? (
            <div className="py-16 text-center font-bold text-black/60">
              {q.trim()
                ? isBangla
                  ? "কোনো মিল পাওয়া যায়নি"
                  : "No matching games found"
                : isBangla
                  ? "কোন গেম পাওয়া যায়নি"
                  : "No games found"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-8 lg:grid-cols-6 xl:grid-cols-8">
                {pagedGames.map((g) => {
                  const imgSrc = getGameImage(g);
                  const goId = g.gameId;
                  const gameName = g.gameName || g.name || goId;

                  return (
                    <button
                      key={g._id || goId}
                      type="button"
                      onClick={() => navigate(`/playgame/${goId}`)}
                      className="group cursor-pointer text-left"
                      title={gameName}
                    >
                      <div className="relative overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-sm">
                        <div className="absolute right-0 top-0 z-10 flex flex-col items-end gap-1">
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

                        <div className="relative aspect-square cursor-pointer bg-gray-100">
                          <img
                            src={imgSrc}
                            alt={gameName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.08]"
                            loading="lazy"
                            // onError={(e) => {
                            //   e.currentTarget.src = "/no-image.png";
                            // }}
                          />

                          <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25" />

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-yellow-500 shadow-lg hover:bg-blue-700">
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9 7V17L17 12L9 7Z" fill="white" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 line-clamp-1 px-1 text-center text-[14px] font-extrabold text-black">
                        {gameName}
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={safePage <= 1}
                    className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 font-bold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
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
                        className={`cursor-pointer rounded-lg border border-black/10 px-3 py-2 font-extrabold ${
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
                    onClick={goNext}
                    disabled={safePage >= totalPages}
                    className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 font-bold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBangla ? "পরের" : "Next"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCategory;
