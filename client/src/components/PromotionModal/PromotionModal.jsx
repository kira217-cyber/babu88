// src/Components/PromotionModal/PromotionModal.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const fetchPromotionModal = async () => {
  const { data } = await api.get("/api/promotion-modal");
  return data;
};

const rgba = (hex, a = 1) => {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
};

const safeShadow = (raw) => {
  // admin saves "0_20px_60px_rgba(0,0,0,0.35)" → convert to valid css
  if (!raw) return "0 20px 60px rgba(0,0,0,0.35)";
  return String(raw).replaceAll("_", " ");
};

const PromotionModal = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const { data } = useQuery({
    queryKey: ["promotion-modal"],
    queryFn: fetchPromotionModal,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const [open, setOpen] = useState(false);

  const view = useMemo(() => {
    const d = data || {};

    const isActive = d?.isActive ?? true;
    const storageKey = d?.storageKey || "promotion_modal_last_shown_v1";
    const showOncePerMs = d?.showOncePerMs ?? 0;

    const title =
      (isBangla ? d?.titleBn : d?.titleEn) || "Important Announcement";

    const imageUrlRaw = d?.imageUrl || "";
    const imageUrl = /^https?:\/\//i.test(imageUrlRaw)
      ? imageUrlRaw
      : imageUrlRaw
        ? `${api.defaults.baseURL}${imageUrlRaw}`
        : "";

    const navigateTo = d?.navigateTo || "/promotion";

    // styles (keep your design; only values become dynamic)
    const backdrop = rgba(
      d?.backdropColor || "#000000",
      d?.backdropOpacity ?? 0.55,
    );

    return {
      isActive,
      storageKey,
      showOncePerMs,
      title,
      imageUrl,
      navigateTo,

      backdrop,

      modalBg: d?.modalBg || "#ffffff",
      modalRadiusPx: d?.modalRadiusPx ?? 6,
      modalShadow: safeShadow(d?.modalShadow),
      maxWidthPx: d?.maxWidthPx ?? 420,

      headerBg: d?.headerBg || "#4a4a4a",
      headerHeightPx: d?.headerHeightPx ?? 44,

      titleColor: d?.titleColor || "#ffffff",
      titleSizePx: d?.titleSizePx ?? 14,
      titleWeight: d?.titleWeight ?? 800,
      titleLetterSpacing: d?.titleLetterSpacing ?? 0.02,

      closeBtnBg: rgba(
        d?.closeBtnBg || "#ffffff",
        d?.closeBtnBgOpacity ?? 0.15,
      ),
      closeIconColor: d?.closeIconColor || "#ffffff",
      closeIconSizePx: d?.closeIconSizePx ?? 18,

      bodyPaddingPx: d?.bodyPaddingPx ?? 12,

      imageBorderColor: rgba(
        d?.imageBorderColor || "#000000",
        d?.imageBorderOpacity ?? 0.1,
      ),
      imageRadiusPx: d?.imageRadiusPx ?? 6,
    };
  }, [data, isBangla]);

  useEffect(() => {
    if (!view.isActive) return;

    const last = Number(localStorage.getItem(view.storageKey) || "0");
    const now = Date.now();

    const ok =
      view.showOncePerMs === 0
        ? true
        : !last || now - last >= view.showOncePerMs;

    if (ok) {
      setOpen(true);
      localStorage.setItem(view.storageKey, String(now));
    }
  }, [view.isActive, view.storageKey, view.showOncePerMs]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleGo = useCallback(() => {
    setOpen(false);

    const link = view.navigateTo || "/";
    const isExternal = /^https?:\/\//i.test(link);

    if (isExternal) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(link);
  }, [navigate, view.navigateTo]);

  if (!view.isActive) return null;
  if (!view.imageUrl) return null; // image না থাকলে modal না দেখানো (optional)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close promotion modal"
            onClick={handleClose}
            className="absolute inset-0"
            style={{ background: view.backdrop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full rounded-md overflow-hidden bg-white"
            style={{
              maxWidth: view.maxWidthPx,
              backgroundColor: view.modalBg,
              borderRadius: view.modalRadiusPx,
              boxShadow: view.modalShadow,
            }}
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4"
              style={{
                height: view.headerHeightPx,
                backgroundColor: view.headerBg,
              }}
            >
              <p
                className="text-white font-extrabold text-[14px] tracking-wide"
                style={{
                  color: view.titleColor,
                  fontSize: view.titleSizePx,
                  fontWeight: view.titleWeight,
                  letterSpacing: `${view.titleLetterSpacing}em`,
                }}
              >
                {view.title}
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 cursor-pointer rounded-full flex items-center justify-center hover:brightness-110 transition"
                aria-label="Close"
                style={{ background: view.closeBtnBg }}
              >
                <IoClose
                  className="text-white"
                  style={{
                    color: view.closeIconColor,
                    fontSize: view.closeIconSizePx,
                  }}
                />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: view.bodyPaddingPx }}>
              <button
                type="button"
                onClick={handleGo}
                className="w-full cursor-pointer overflow-hidden rounded-md border border-black/10 bg-white"
                style={{
                  borderColor: view.imageBorderColor,
                  borderRadius: view.imageRadiusPx,
                }}
                aria-label="Open promotion"
              >
                <img
                  src={view.imageUrl}
                  alt="Promotion"
                  className="w-full h-auto block select-none"
                  draggable="false"
                  loading="eager"
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionModal;
