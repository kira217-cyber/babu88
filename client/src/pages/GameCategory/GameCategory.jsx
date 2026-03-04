// src/components/GameCategory/GameCategory.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import Loading from "../../components/Loading/Loading";

const PAGE_SIZE = 30;

const fetchCategory = async (categoryId) => {
  const { data } = await api.get(`/api/public/game-categories/${categoryId}`);
  return data?.data;
};

const fetchGames = async ({ categoryId, providerDbId }) => {
  const qs = new URLSearchParams();
  qs.set("categoryId", categoryId);
  if (providerDbId) qs.set("providerDbId", providerDbId);
  const { data } = await api.get(`/api/public/games?${qs.toString()}`);
  return data?.data || [];
};

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";
const NEW_ICON = "https://babu88.gold/static/svg/game-icon-new.svg";

const GameCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const { isBangla } = useLanguage();

  const providerDbId = sp.get("provider") || "";

  const [sortKey, setSortKey] = useState("default");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL;

  const { data: cat, isLoading: loadingCat } = useQuery({
    queryKey: ["public-category", categoryId],
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 60000,
  });

  const { data: games = [], isLoading: loadingGames } = useQuery({
    queryKey: ["public-games", categoryId, providerDbId],
    queryFn: () => fetchGames({ categoryId, providerDbId }),
    enabled: !!categoryId,
    staleTime: 30000,
  });

  const providers = cat?.providers || [];

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
    if (!id) next.delete("provider");
    else next.set("provider", id);
    setSp(next, { replace: true });
  };

  // ✅ Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryId, providerDbId, sortKey, q]);

  const filteredSortedGames = useMemo(() => {
    let list = [...games];

    // Search filter
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((g) => {
        const name = String(g.gameName || "").toLowerCase();
        const id = String(g.gameId || "").toLowerCase();
        const uuid = String(g.gameUuid || "").toLowerCase();
        return (
          name.includes(query) || id.includes(query) || uuid.includes(query)
        );
      });
    }

    // Sort
    if (sortKey === "hot") {
      list.sort((a, b) => {
        const aHot = a.isHot === true || a.isHot === "true" || !!a.isHot;
        const bHot = b.isHot === true || b.isHot === "true" || !!b.isHot;
        return bHot - aHot;
      });
    } else if (sortKey === "new") {
      list.sort((a, b) => {
        const aNew = a.isNew === true || a.isNew === "true" || !!a.isNew;
        const bNew = b.isNew === true || b.isNew === "true" || !!b.isNew;
        return bNew - aNew;
      });
    } else if (sortKey === "latest") {
      list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    // default -> API order

    return list;
  }, [games, q, sortKey]);

  // ✅ Pagination computed
  const total = filteredSortedGames.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pagedGames = useMemo(() => {
    return filteredSortedGames.slice(start, end);
  }, [filteredSortedGames, start, end]);

  // ✅ compact page buttons
  const pageButtons = useMemo(() => {
    const p = safePage;
    const tp = totalPages;
    const out = [];

    const push = (v) => out.push(v);

    if (tp <= 7) {
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

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p) => setPage(() => Math.min(totalPages, Math.max(1, p)));

  if (loadingCat) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-black/70 font-bold">
        Loading...
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-black/70 font-bold">
        Category not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* ✅ Global Loading Overlay */}
      <Loading
        open={loadingCat || loadingGames}
        text={isBangla ? "লোড হচ্ছে..." : "Loading..."}
      />

      {/* Banner */}
      <div className="relative w-full h-[240px] md:h-[320px] overflow-hidden">
        {cat.bannerImage ? (
          <img
            src={`${API_URL}${cat.bannerImage}`}
            alt={categoryName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#0b0b2b] to-[#001a5a]" />
        )}

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-xl">
              <div className="text-white font-extrabold text-2xl md:text-4xl">
                {categoryName}
              </div>
              <div className="mt-2 text-white/85 text-sm md:text-base font-semibold">
                {categoryTitle}
              </div>
              <div className="mt-2 text-white/70 text-xs md:text-sm">
                {isBangla
                  ? "প্রোভাইডার বেছে নিন এবং আপনার পছন্দের গেম খেলুন"
                  : "Pick a provider and play your favorite games"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider pills */}
      <div className="max-w-[1500px] mx-auto px-4">
        <div className="mt-6 bg-white rounded-2xl border border-black/10 shadow-sm p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setProvider("")}
              className={[
                "h-[42px] rounded-full border-2 px-4 font-extrabold text-[13px]",
                "flex items-center justify-center gap-2 transition",
                !providerDbId
                  ? "bg-[#f5b400] border-[#f5b400] text-black"
                  : "bg-white border-[#f5b400] text-black hover:bg-yellow-50",
              ].join(" ")}
            >
              {isBangla ? "সব" : "All"}
            </button>

            {providers.map((p) => {
              const activeP = providerDbId === p._id;
              return (
                <button
                  key={p._id}
                  onClick={() => setProvider(p._id)}
                  className={[
                    "h-[42px] rounded-full border-2 px-4 font-extrabold text-[12px]",
                    "flex items-center justify-center gap-2 transition",
                    activeP
                      ? "bg-[#f5b400] border-[#f5b400] text-black"
                      : "bg-white border-[#f5b400] text-black hover:bg-yellow-50",
                  ].join(" ")}
                  title={p.providerName}
                >
                  {p.providerIcon ? (
                    <img
                      src={`${API_URL}${p.providerIcon}`}
                      alt={p.providerName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}
                  <span className="truncate max-w-[130px]">
                    {p.providerName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-extrabold text-black/70 whitespace-nowrap">
              {isBangla ? "গেমগুলি সাজান:" : "Sort Games:"}
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-[38px] px-4 rounded-full border border-black/20 bg-white text-sm font-bold outline-none"
            >
              <option value="default">{isBangla ? "ডিফল্ট" : "Default"}</option>
              <option value="latest">{isBangla ? "সর্বশেষ" : "Latest"}</option>
              <option value="hot">{isBangla ? "হট" : "Hot"}</option>
              <option value="new">{isBangla ? "নতুন" : "New"}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-end w-full md:w-auto">
            <div className="h-[38px] px-4 rounded-full border border-black/20 bg-white flex items-center gap-2 min-w-[240px] md:min-w-[300px]">
              <span className="text-black/40">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  isBangla ? "খেলা অনুসন্ধান করুন" : "Search games..."
                }
                className="bg-transparent outline-none text-sm font-semibold flex-1"
              />
            </div>
          </div>
        </div>

        {/* Count info */}
        {/* <div className="mt-3 text-sm font-bold text-black/50">
          {total > 0
            ? `${isBangla ? "মোট গেম" : "Total games"}: ${total} • ${
                isBangla ? "পেজ" : "Page"
              } ${safePage}/${totalPages}`
            : ""}
        </div> */}

        {/* Games grid */}
        <div className="mt-5 pb-10">
          {loadingGames ? (
            <div className="py-16 text-center text-black/60 font-bold">
              Loading games...
            </div>
          ) : filteredSortedGames.length === 0 ? (
            <div className="py-16 text-center text-black/60 font-bold">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 md:gap-8">
                {pagedGames.map((g) => {
                  const imgSrc =
                    g.image && String(g.image).trim()
                      ? /^https?:\/\//i.test(String(g.image).trim())
                        ? String(g.image).trim()
                        : `${API_URL}${String(g.image).trim()}`
                      : "/no-image.png";

                  const goId = g.gameId;

                  return (
                    <button
                      key={g._id}
                      type="button"
                      onClick={() => navigate(`/playgame/${goId}`)}
                      className="group text-left"
                      title={g.gameName || goId}
                    >
                      <div className="relative rounded-[14px] overflow-hidden border border-black/10 bg-white shadow-sm">
                        {/* Badges */}
                        <div className="absolute top-0 right-0 z-10 flex flex-col gap-1 items-end">
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

                        {/* Image + hover play */}
                        <div className="aspect-square bg-gray-100 relative cursor-pointer">
                          <img
                            src={imgSrc}
                            alt={g.gameName || goId}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.08]"
                            onError={(e) =>
                              (e.currentTarget.src = "/no-image.png")
                            }
                          />

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition duration-300" />

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <div className="w-[48px] h-[48px] rounded-full bg-yellow-500 hover:bg-blue-700 shadow-lg flex items-center justify-center">
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

                      <div className="mt-2 text-[14px] font-extrabold text-black text-center line-clamp-1 px-1">
                        {g.gameName || goId}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ✅ Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={goPrev}
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
                    onClick={goNext}
                    disabled={safePage >= totalPages}
                    className="px-3 py-2 rounded-lg font-bold border border-black/10 bg-white hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
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
