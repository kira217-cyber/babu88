// src/Components/PromotionModal/PromotionModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router";

const STORAGE_KEY = "promotion_modal_last_shown_v1";
// const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 0;

// ✅ Live image url
const PROMO_IMAGE_URL = "https://jiliwin.9terawolf.com/cms/h8/image/69342a1c86dab.jpg";

// ✅ Change this where you want to navigate on image click
const PROMO_NAVIGATE_TO = "/promotion"; // উদাহরণ: "/bonus" / "/offer" / "/register" etc.

const PromotionModal = ({
  title = "Important Announcement",
  imageUrl = PROMO_IMAGE_URL,
  navigateTo = PROMO_NAVIGATE_TO,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // ✅ 24 ঘন্টার মধ্যে একবারই দেখাবে
    const last = Number(localStorage.getItem(STORAGE_KEY) || "0");
    const now = Date.now();

    if (!last || now - last >= ONE_DAY_MS) {
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, String(now));
    }
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleGo = useCallback(() => {
    setOpen(false);
    navigate(navigateTo);
  }, [navigate, navigateTo]);

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
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[420px] rounded-md overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Header Bar (same vibe as screenshot) */}
            <div className="h-[44px] bg-[#4a4a4a] flex items-center justify-between px-4">
              <p className="text-white font-extrabold text-[14px] tracking-wide">
                {title}
              </p>

              {/* Close icon */}
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 cursor-pointer rounded-full bg-white/15 flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Close"
              >
                <IoClose className="text-white text-[18px]" />
              </button>
            </div>

            {/* Body: only image, clickable */}
            <div className="p-3">
              <button
                type="button"
                onClick={handleGo}
                className="w-full cursor-pointer overflow-hidden rounded-md border border-black/10 bg-white"
                aria-label="Open promotion"
              >
                <img
                  src={imageUrl}
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
