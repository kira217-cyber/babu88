// src/pages/Promotions.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const modalAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const panelAnim = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, y: 14, scale: 0.985, transition: { duration: 0.15 } },
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  if (!hex.startsWith("#")) return hex; // allow rgba string
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

const fetchPromotionsColors = async () => {
  const { data } = await api.get("/api/promotions-color");
  return data;
};

const Promotions = () => {
  const { isBangla } = useLanguage();

  const [activeCat, setActiveCat] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: colorDoc } = useQuery({
    queryKey: ["promotions-color"],
    queryFn: fetchPromotionsColors,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      pageBg: d.pageBg || "#f4f5f7",
      titleText: d.titleText || "#0f172a",

      chipsWrapBg: d.chipsWrapBg || "#f1f1f1",

      chipActiveBg: d.chipActiveBg || "#f6c400",
      chipActiveText: d.chipActiveText || "#000000",
      chipActiveShadowRgba: d.chipActiveShadowRgba || "rgba(246,196,0,0.25)",

      chipInactiveText: d.chipInactiveText || "#111827",
      chipInactiveHoverBg: d.chipInactiveHoverBg || "#ffffff",
      chipInactiveHoverOpacity: d.chipInactiveHoverOpacity ?? 0.7,
      chipTextSize: d.chipTextSize ?? 14,

      mobileBtnBg: d.mobileBtnBg || "#0b74ff",
      mobileBtnText: d.mobileBtnText || "#ffffff",
      mobileBtnShadowRgba: d.mobileBtnShadowRgba || "rgba(11,116,255,0.22)",

      mobileDropBg: d.mobileDropBg || "#ffffff",
      mobileDropBorder: d.mobileDropBorder || "#000000",
      mobileDropBorderOpacity: d.mobileDropBorderOpacity ?? 0.1,

      mobileItemActiveBg: d.mobileItemActiveBg || "#f6c400",
      mobileItemActiveText: d.mobileItemActiveText || "#000000",
      mobileItemBg: d.mobileItemBg || "#ffffff",
      mobileItemText: d.mobileItemText || "#111827",
      mobileItemHoverBg: d.mobileItemHoverBg || "#f4f5f7",

      cardBg: d.cardBg || "#ffffff",
      cardBorder: d.cardBorder || "#000000",
      cardBorderOpacity: d.cardBorderOpacity ?? 0.05,

      imgWrapBg: d.imgWrapBg || "#000000",
      imgWrapOpacity: d.imgWrapOpacity ?? 0.05,

      promoTitleText: d.promoTitleText || "#0f172a",
      promoDescText: d.promoDescText || "#475569",
      promoDescTextSize: d.promoDescTextSize ?? 14,

      moreBtnBg: d.moreBtnBg || "#0b74ff",
      moreBtnHoverBg: d.moreBtnHoverBg || "#0a66e0",
      moreBtnText: d.moreBtnText || "#ffffff",
      moreBtnTextSize: d.moreBtnTextSize ?? 14,

      boxBg: d.boxBg || "#ffffff",
      boxBorder: d.boxBorder || "#000000",
      boxBorderOpacity: d.boxBorderOpacity ?? 0.05,

      emptyTitleText: d.emptyTitleText || "#0f172a",
      emptyDescText: d.emptyDescText || "#475569",
      loadingText: d.loadingText || "#0f172a",

      modalOverlayOpacity: d.modalOverlayOpacity ?? 0.45,
      modalPanelBg: d.modalPanelBg || "#ffffff",
      modalCloseBg: d.modalCloseBg || "#f6c400",
      modalCloseIcon: d.modalCloseIcon || "#000000",
      modalHeadingText: d.modalHeadingText || "#111827",
      modalBodyText: d.modalBodyText || "#111827",
      modalBodyTextSize: d.modalBodyTextSize ?? 13,
    };
  }, [colorDoc]);

  const categories = useMemo(
    () => [
      { key: "all", bn: "সব", en: "All" },
      { key: "cricket", bn: "ক্রিকেট", en: "Cricket" },
      { key: "fast", bn: "ফাস্ট", en: "Fast" },
      { key: "sports", bn: "স্পোর্টস", en: "Sports" },
      { key: "livecasino", bn: "লাইভ ক্যাসিনো", en: "Live Casino" },
      { key: "slots", bn: "স্লটস", en: "Slots" },
      { key: "table", bn: "টেবিল গেমস", en: "Table Games" },
      { key: "vip", bn: "ভিআইপি", en: "VIP" },
      { key: "crash", bn: "ক্র্যাশ", en: "Crash" },
      { key: "tournament", bn: "টুর্নামেন্ট", en: "Tournament" },
    ],
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/promotions");
        setPromotions(data?.promotions || []);
      } catch (e) {
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeCat === "all") return promotions;
    return promotions.filter((p) => p.category === activeCat);
  }, [activeCat, promotions]);

  const activeLabel = useMemo(() => {
    const found = categories.find((c) => c.key === activeCat) || categories[0];
    return isBangla ? found.bn : found.en;
  }, [activeCat, categories, isBangla]);

  const t = useMemo(
    () => ({
      pageTitle: isBangla ? "প্রমোশন" : "Promotions",
      more: isBangla ? "আরো দেখুন" : "More Details",
      emptyTitle: isBangla ? "কোনো প্রমোশন নেই" : "No promotions found",
      emptyDesc: isBangla
        ? "এই ক্যাটাগরিতে এখন কোনো প্রমোশন পাওয়া যাচ্ছে না।"
        : "No promotions are available under this category right now.",
      close: isBangla ? "বন্ধ" : "Close",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    }),
    [isBangla],
  );

  const selectCat = (key) => {
    setActiveCat(key);
    setMobileOpen(false);
  };

  const openDetails = (item) => setSelected(item);
  const closeDetails = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeDetails();
    };

    if (selected) {
      document.addEventListener("keydown", onKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [selected, closeDetails]);

  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL}${img}`;
  };

  const getDetails = (item) => ({
    heading: isBangla ? item?.title?.bn : item?.title?.en,
    body: [isBangla ? item?.details?.bn : item?.details?.en].filter(Boolean),
  });

  return (
    <div className="w-full" style={{ backgroundColor: ui.pageBg }}>
      <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        {/* title */}
        <div className="mb-3 sm:mb-5">
          <h2
            className="text-[18px] sm:text-[22px] font-extrabold"
            style={{ color: ui.titleText }}
          >
            {t.pageTitle}
          </h2>
        </div>

        {/* desktop chips */}
        <div
          className="hidden sm:block w-full rounded-2xl p-2 sm:p-3 overflow-x-auto"
          style={{ backgroundColor: ui.chipsWrapBg }}
        >
          <div className="flex items-center gap-3 min-w-max">
            {categories.map((c) => {
              const active = activeCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className={[
                    "px-5 py-2 cursor-pointer rounded-full font-bold whitespace-nowrap transition",
                    active ? "" : "bg-transparent",
                  ].join(" ")}
                  style={{
                    fontSize: `${ui.chipTextSize}px`,
                    backgroundColor: active ? ui.chipActiveBg : "transparent",
                    color: active ? ui.chipActiveText : ui.chipInactiveText,
                    boxShadow: active
                      ? `0 10px 20px ${ui.chipActiveShadowRgba}`
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (active) return;
                    e.currentTarget.style.backgroundColor = hexToRgba(
                      ui.chipInactiveHoverBg,
                      ui.chipInactiveHoverOpacity,
                    );
                  }}
                  onMouseLeave={(e) => {
                    if (active) return;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {isBangla ? c.bn : c.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* mobile dropdown */}
        <div className="sm:hidden mt-1">
          <div className="relative inline-block">
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="font-extrabold text-sm px-5 py-2 rounded-md flex items-center gap-3"
              style={{
                backgroundColor: ui.mobileBtnBg,
                color: ui.mobileBtnText,
                boxShadow: `0 10px 20px ${ui.mobileBtnShadowRgba}`,
              }}
            >
              {activeLabel}
              <FaChevronDown className="text-white/90 text-xs" />
            </button>

            <AnimatePresence>
              {mobileOpen && (
                <>
                  <motion.button
                    type="button"
                    aria-label="close dropdown"
                    className="fixed inset-0 z-[50] bg-transparent"
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="absolute left-0 mt-2 z-[60] w-[220px] rounded-xl overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                    style={{
                      backgroundColor: ui.mobileDropBg,
                      border: `1px solid ${hexToRgba(ui.mobileDropBorder, ui.mobileDropBorderOpacity)}`,
                    }}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {categories.map((c) => {
                      const active = activeCat === c.key;
                      return (
                        <button
                          key={c.key}
                          onClick={() => selectCat(c.key)}
                          className="w-full text-left px-4 py-3 text-sm font-extrabold transition"
                          style={{
                            backgroundColor: active
                              ? ui.mobileItemActiveBg
                              : ui.mobileItemBg,
                            color: active
                              ? ui.mobileItemActiveText
                              : ui.mobileItemText,
                          }}
                          onMouseEnter={(e) => {
                            if (active) return;
                            e.currentTarget.style.backgroundColor =
                              ui.mobileItemHoverBg;
                          }}
                          onMouseLeave={(e) => {
                            if (active) return;
                            e.currentTarget.style.backgroundColor =
                              ui.mobileItemBg;
                          }}
                        >
                          {isBangla ? c.bn : c.en}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* cards */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                variants={fade}
                initial="hidden"
                animate="show"
                className="col-span-1 lg:col-span-2 rounded-2xl p-6"
                style={{
                  backgroundColor: ui.boxBg,
                  border: `1px solid ${hexToRgba(ui.boxBorder, ui.boxBorderOpacity)}`,
                }}
              >
                <p
                  className="text-sm font-extrabold"
                  style={{ color: ui.loadingText }}
                >
                  {t.loading}
                </p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                variants={fade}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="col-span-1 lg:col-span-2 rounded-2xl p-6"
                style={{
                  backgroundColor: ui.boxBg,
                  border: `1px solid ${hexToRgba(ui.boxBorder, ui.boxBorderOpacity)}`,
                }}
              >
                <p
                  className="text-lg font-extrabold"
                  style={{ color: ui.emptyTitleText }}
                >
                  {t.emptyTitle}
                </p>
                <p className="mt-1 text-sm" style={{ color: ui.emptyDescText }}>
                  {t.emptyDesc}
                </p>
              </motion.div>
            ) : (
              filtered.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  variants={fade}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-md overflow-hidden"
                  style={{
                    backgroundColor: ui.cardBg,
                    border: `1px solid ${hexToRgba(ui.cardBorder, ui.cardBorderOpacity)}`,
                  }}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <div className="p-4 sm:p-5">
                    <div
                      className="rounded-md overflow-hidden"
                      style={{
                        backgroundColor: hexToRgba(
                          ui.imgWrapBg,
                          ui.imgWrapOpacity,
                        ),
                      }}
                    >
                      <img
                        src={resolveImg(item.image)}
                        alt={isBangla ? item.title?.bn : item.title?.en}
                        className="w-full h-[180px] sm:h-[220px] md:h-[240px] object-cover"
                        loading="lazy"
                        draggable="false"
                      />
                    </div>

                    <h3
                      className="mt-4 text-[16px] sm:text-[17px] font-extrabold uppercase"
                      style={{ color: ui.promoTitleText }}
                    >
                      {isBangla ? item.title?.bn : item.title?.en}
                    </h3>

                    <p
                      className="mt-2 line-clamp-2"
                      style={{
                        color: ui.promoDescText,
                        fontSize: `${ui.promoDescTextSize}px`,
                      }}
                    >
                      {isBangla ? item.shortDesc?.bn : item.shortDesc?.en}
                    </p>

                    <div className="mt-5">
                      <button
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold transition"
                        style={{
                          backgroundColor: ui.moreBtnBg,
                          color: ui.moreBtnText,
                          fontSize: `${ui.moreBtnTextSize}px`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            ui.moreBtnHoverBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = ui.moreBtnBg;
                        }}
                        onClick={() => openDetails(item)}
                      >
                        {t.more}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-2 sm:px-6"
            variants={modalAnim}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* overlay */}
            <motion.button
              type="button"
              aria-label="Close modal"
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0,0,0,${ui.modalOverlayOpacity})`,
              }}
              onClick={closeDetails}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* panel */}
            <motion.div
              className="relative w-full max-w-[980px] rounded-sm overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: ui.modalPanelBg }}
              variants={panelAnim}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <button
                type="button"
                onClick={closeDetails}
                className="absolute top-0 right-0 z-20 w-10 h-10 flex items-center justify-center hover:brightness-95 transition"
                style={{ backgroundColor: ui.modalCloseBg }}
                aria-label={t.close}
                title={t.close}
              >
                <IoClose style={{ color: ui.modalCloseIcon, fontSize: 22 }} />
              </button>

              <div className="max-h-[85vh] overflow-y-auto">
                <div className="p-3 sm:p-4">
                  <div className="rounded-sm overflow-hidden">
                    <img
                      src={resolveImg(selected.image)}
                      alt={isBangla ? selected.title?.bn : selected.title?.en}
                      className="w-full  h-[200px] md:h-[400px] block"
                      draggable="false"
                    />
                  </div>

                  <div className="mt-4 px-1 sm:px-0">
                    <h3
                      className="text-[16px] sm:text-[18px] font-extrabold uppercase"
                      style={{ color: ui.modalHeadingText }}
                    >
                      {getDetails(selected).heading}
                    </h3>

                    <div className="mt-4 space-y-2">
                      {getDetails(selected).body.map((line, idx) => (
                        <p
                          key={idx}
                          style={{
                            color: ui.modalBodyText,
                            fontSize: `${ui.modalBodyTextSize}px`,
                          }}
                        >
                          • {line}
                        </p>
                      ))}
                    </div>

                    <div className="h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Promotions;
