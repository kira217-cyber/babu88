import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const STORAGE_KEY = "download_header_closed_v1";

const fetchDownloadHeader = async () => {
  const { data } = await api.get("/api/download-header");
  return data;
};

const fetchDownloadHeaderColor = async () => {
  const { data } = await api.get("/api/download-header-color");
  return data;
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  if (!hex.startsWith("#")) return hex; // allow rgba
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

const DownloadHeader = () => {
  const { isBangla } = useLanguage();
  const [visible, setVisible] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["download-header"],
    queryFn: fetchDownloadHeader,
    staleTime: 1000 * 60 * 10,
  });

  const { data: colorDoc } = useQuery({
    queryKey: ["download-header-color"],
    queryFn: fetchDownloadHeaderColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      containerBg: d.containerBg || "#F5F5F5",
      borderColor: d.borderColor || "#000000",
      borderOpacity: d.borderOpacity ?? 0.1,

      closeHoverBg: d.closeHoverBg || "#000000",
      closeHoverOpacity: d.closeHoverOpacity ?? 0.1,
      closeIconColor: d.closeIconColor || "#000000",
      closeIconOpacity: d.closeIconOpacity ?? 0.8,
      closeIconSize: d.closeIconSize ?? 24,

      iconBoxBg: d.iconBoxBg || "#000000",
      fallbackLetter: (d.fallbackLetter || "B").slice(0, 2),
      fallbackLetterColor: d.fallbackLetterColor || "#F5B400",
      fallbackLetterSize: d.fallbackLetterSize ?? 20,

      titleColor: d.titleColor || "#000000",
      titleSize: d.titleSize ?? 13,

      btnBg: d.btnBg || "#F5B400",
      btnText: d.btnText || "#000000",
      btnTextSize: d.btnTextSize ?? 14,
      btnBorderColor: d.btnBorderColor || "#000000",
      btnBorderOpacity: d.btnBorderOpacity ?? 0.1,
      btnDisabledOpacity: d.btnDisabledOpacity ?? 0.6,
    };
  }, [colorDoc]);

  // ✅ closed state
  useEffect(() => {
    const closed = localStorage.getItem(STORAGE_KEY) === "1";
    if (!closed) setVisible(true);
  }, []);

  const view = useMemo(() => {
    const isActive = data?.isActive ?? true;

    const appName = isBangla ? data?.appNameBn : data?.appNameEn;

    const titleOverride = isBangla ? data?.titleBn : data?.titleEn;
    const btnText = isBangla ? data?.btnTextBn : data?.btnTextEn;

    const iconUrl = data?.iconUrl
      ? `${api.defaults.baseURL}${data.iconUrl}`
      : "";
    const apkUrl = data?.apkUrl ? `${api.defaults.baseURL}${data.apkUrl}` : "";

    const title =
      titleOverride?.trim() ||
      (isBangla
        ? `এখনই আমাদের ${appName || "APP"} ডাউনলোড করুন`
        : `Download our ${appName || "APP"} now`);

    return {
      isActive,
      title,
      btnText: btnText?.trim() || (isBangla ? "ডাউনলোড" : "Download"),
      closeText: isBangla ? "বন্ধ করুন" : "Close",
      iconUrl,
      apkUrl,
    };
  }, [data, isBangla]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleDownload = () => {
    if (!view.apkUrl) return;
    const a = document.createElement("a");
    a.href = view.apkUrl;
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (isLoading) return null;
  if (!view.isActive) return null;

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <div
              className="w-full"
              style={{
                backgroundColor: ui.containerBg,
                borderBottom: `1px solid ${hexToRgba(ui.borderColor, ui.borderOpacity)}`,
              }}
            >
              <div className="mx-auto max-w-[1500px] px-3 py-2 flex items-center gap-3">
                <button
                  onClick={handleClose}
                  aria-label={view.closeText}
                  title={view.closeText}
                  className="shrink-0 w-8 h-8 grid place-items-center rounded-full active:scale-95 transition"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hexToRgba(
                      ui.closeHoverBg,
                      ui.closeHoverOpacity,
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <IoClose
                    style={{
                      fontSize: ui.closeIconSize,
                      color: hexToRgba(ui.closeIconColor, ui.closeIconOpacity),
                    }}
                  />
                </button>

                {/* Icon */}
                <div
                  className="shrink-0 w-8 h-8 rounded-md grid place-items-center overflow-hidden"
                  style={{ backgroundColor: ui.iconBoxBg }}
                >
                  {view.iconUrl ? (
                    <img
                      src={view.iconUrl}
                      alt="App Icon"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span
                      className="font-black leading-none"
                      style={{
                        color: ui.fallbackLetterColor,
                        fontSize: ui.fallbackLetterSize,
                      }}
                    >
                      {ui.fallbackLetter}
                    </span>
                  )}
                </div>

                <div className="flex-1 leading-tight">
                  <p
                    className="font-extrabold"
                    style={{
                      color: ui.titleColor,
                      fontSize: ui.titleSize,
                    }}
                  >
                    {view.title}
                  </p>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!view.apkUrl}
                  className="shrink-0 font-extrabold px-4 py-2 rounded-md shadow-sm hover:brightness-95 active:scale-[0.98] transition disabled:opacity-60"
                  style={{
                    backgroundColor: ui.btnBg,
                    color: ui.btnText,
                    fontSize: ui.btnTextSize,
                    border: `1px solid ${hexToRgba(ui.btnBorderColor, ui.btnBorderOpacity)}`,
                    opacity: !view.apkUrl ? ui.btnDisabledOpacity : 1,
                  }}
                >
                  {view.btnText}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DownloadHeader;
