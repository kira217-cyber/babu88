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

const DownloadHeader = () => {
  const { isBangla } = useLanguage();
  const [visible, setVisible] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["download-header"],
    queryFn: fetchDownloadHeader,
    staleTime: 1000 * 60 * 10,
  });

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
    a.setAttribute("download", ""); // hint only
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ✅ loading: optionally do nothing (or show skeleton)
  if (isLoading) return null;

  // ✅ inactive hide
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
            <div className="w-full bg-[#F5F5F5] border-b-1px border-black/10">
              <div className="mx-auto max-w-[1500px] px-3 py-2 flex items-center gap-3">
                <button
                  onClick={handleClose}
                  aria-label={view.closeText}
                  title={view.closeText}
                  className="shrink-0 w-8 h-8 grid place-items-center rounded-full hover:bg-black/10 active:scale-95 transition"
                >
                  <IoClose className="text-2xl text-black/80" />
                </button>

                {/* Icon */}
                <div className="shrink-0 w-8 h-8 rounded-md bg-black grid place-items-center overflow-hidden">
                  {view.iconUrl ? (
                    <img
                      src={view.iconUrl}
                      alt="App Icon"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-[#F5B400] font-black text-xl leading-none">
                      B
                    </span>
                  )}
                </div>

                <div className="flex-1 leading-tight">
                  <p className="text-[13px] font-extrabold text-black">
                    {view.title}
                  </p>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!view.apkUrl}
                  className="shrink-0 bg-[#F5B400] text-black font-extrabold text-sm px-4 py-2 rounded-md shadow-sm border border-black/10 hover:brightness-95 active:scale-[0.98] transition disabled:opacity-60"
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
