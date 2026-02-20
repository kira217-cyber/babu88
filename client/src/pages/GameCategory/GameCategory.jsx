// src/pages/GameCategory/GameCategory.jsx
import React, { useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

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

  const [sortKey, setSortKey] = useState("default"); // default | new | hot | latest
  const [q, setQ] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const { data: cat, isLoading: loadingCat } = useQuery({
    queryKey: ["public-category", categoryId],
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 60_000,
  });

  const { data: games = [], isLoading: loadingGames } = useQuery({
    queryKey: ["public-games", categoryId, providerDbId],
    queryFn: () => fetchGames({ categoryId, providerDbId }),
    enabled: !!categoryId,
    staleTime: 30_000,
  });

  const providers = cat?.providers || [];

  const categoryTitle = useMemo(() => {
    if (!cat) return "";
    return isBangla ? cat.categoryTitle?.bn : cat.categoryTitle?.en;
  }, [cat, isBangla]);

  const categoryName = useMemo(() => {
    if (!cat) return "";
    return isBangla ? cat.categoryName?.bn : cat.categoryName?.en;
  }, [cat, isBangla]);

  const setProvider = (id) => {
    if (!id) {
      sp.delete("provider");
      setSp(sp, { replace: true });
      return;
    }
    sp.set("provider", id);
    setSp(sp, { replace: true });
  };

  const shownGames = useMemo(() => {
    let list = [...games];

    // search (gameUuid or gameId)
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((g) => {
        const a = String(g.gameUuid || "").toLowerCase();
        const b = String(g.gameId || "").toLowerCase();
        return a.includes(query) || b.includes(query);
      });
    }

    // sort (client side)
    if (sortKey === "hot") {
      list.sort((a, b) => Number(b.isHot) - Number(a.isHot));
    } else if (sortKey === "new") {
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    } else if (sortKey === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return list;
  }, [games, q, sortKey]);

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
      {/* ✅ Banner */}
      <div className="relative w-full h-[240px] md:h-[320px] overflow-hidden">
        {cat.bannerImage ? (
          <img
            src={`${API_URL}${cat.bannerImage}`}
            alt={categoryName}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#0b0b2b] to-[#001a5a]" />
        )}

        <div className="absolute inset-0 bg-black/40" />

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

      {/* ✅ Provider pills */}
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
              const active = providerDbId === p._id;
              return (
                <button
                  key={p._id}
                  onClick={() => setProvider(p._id)}
                  className={[
                    "h-[42px] rounded-full border-2 px-4 font-extrabold text-[12px]",
                    "flex items-center justify-center gap-2 transition",
                    active
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

        {/* ✅ Filter bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-extrabold text-black/70">
              {isBangla ? "গেমগুলি সাজান:" : "Sort Games:"}
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-[38px] px-4 rounded-full border border-black/20 bg-white text-sm font-bold outline-none"
            >
              <option value="default">
                {isBangla ? "অনুসন্ধান বিভাগ" : "Default"}
              </option>
              <option value="latest">{isBangla ? "সর্বশেষ" : "Latest"}</option>
              <option value="hot">{isBangla ? "হট" : "Hot"}</option>
              <option value="new">{isBangla ? "নতুন" : "New"}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="h-[38px] px-4 rounded-full border border-black/20 bg-white flex items-center gap-2">
              <span className="text-black/40">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isBangla ? "খেলা অনুসন্ধান করুন" : "Search games"}
                className="bg-transparent outline-none text-sm font-semibold w-[220px]"
              />
            </div>
          </div>
        </div>

        {/* ✅ Games section (UPDATED like screenshot) */}
        <div className="mt-5 pb-10">
          {loadingGames ? (
            <div className="py-16 text-center text-black/60 font-bold">
              Loading games...
            </div>
          ) : shownGames.length === 0 ? (
            <div className="py-16 text-center text-black/60 font-bold">
              {isBangla ? "কোন গেম পাওয়া যায়নি" : "No games found"}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
              {shownGames.map((g) => {
                const imgSrc = g.image
                  ? `${API_URL}${g.image}`
                  : "/no-image.png";
                const goId = g.gameUuid || g.gameId; // click navigate with gameUuid

                return (
                  <button
                    key={g._id}
                    type="button"
                    onClick={() => navigate(`/play/${goId}`)}
                    className="group text-left"
                    title={goId}
                  >
                    {/* card */}
                    <div className="relative rounded-[14px] overflow-hidden border border-black/10 bg-white shadow-sm">
                      {/* top right badges like icon */}
                      <div className="absolute top-0 right-0 z-999 flex flex-col gap-1 items-end">
                        {g.isHot ? (
                          <img
                            src={HOT_ICON}
                            alt="hot"
                            className="h-8 w-auto drop-shadow"
                            loading="lazy"
                          />
                        ) : null}
                        {g.isNew ? (
                          <img
                            src={NEW_ICON}
                            alt="new"
                            className="h-8 w-auto drop-shadow"
                            loading="lazy"
                          />
                        ) : null}
                      </div>

                      {/* image */}
                      <div className="aspect-square bg-gray-100 relative cursor-pointer">
                        <img
                          src={imgSrc}
                          alt={goId}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.08]"
                          onError={(e) =>
                            (e.currentTarget.src = "/no-image.png")
                          }
                        />

                        {/* hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition duration-300" />

                        {/* play button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                          <div className="w-[44px] h-[44px] rounded-full bg-gray-500/80 shadow-lg flex items-center justify-center">
                            <svg
                              width="18"
                              height="18"
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

                    {/* title under image */}
                    <div className="mt-2 text-[14px] font-extrabold text-black text-center line-clamp-1">
                      {g.gameName || goId}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCategory;
