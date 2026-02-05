import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useLanguage } from "../../Context/LanguageProvider";

const STORAGE_KEY = "download_header_closed_v1";

const DownloadHeader = ({
  apkUrl = "/app-release.apk", // ✅ তোমার APK লিংক/পাথ
  appName = "APP", // ✅ only name part (text will be localized)
  buttonText, // optional override
}) => {
  const { isBangla } = useLanguage();
  const [visible, setVisible] = useState(false);

  const t = useMemo(
    () => ({
      title: isBangla
        ? `এখনই আমাদের ${appName} ডাউনলোড করুন`
        : `Download our ${appName} now`,
      download: isBangla ? "ডাউনলোড" : "Download",
      close: isBangla ? "বন্ধ করুন" : "Close",
    }),
    [isBangla, appName],
  );

  useEffect(() => {
    // ✅ আগে close করা থাকলে আর দেখাবে না
    const closed = localStorage.getItem(STORAGE_KEY) === "1";
    if (!closed) setVisible(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleDownload = () => {
    // ✅ Direct download trigger
    const a = document.createElement("a");
    a.href = apkUrl;
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
            {/* ✅ Container (ছবির মতো) */}
            <div className="w-full bg-[#F5F5F5] border-b-1px border-black/10">
              <div className="mx-auto max-w-[1500px] px-3 py-2 flex items-center gap-3">
                {/* Close */}
                <button
                  onClick={handleClose}
                  aria-label={t.close}
                  title={t.close}
                  className="shrink-0 w-8 h-8 grid place-items-center rounded-full hover:bg-black/10 active:scale-95 transition"
                >
                  <IoClose className="text-2xl text-black/80" />
                </button>

                {/* App Icon (B like your image) */}
                <div className="shrink-0 w-8 h-8 rounded-md bg-black grid place-items-center">
                  <span className="text-[#F5B400] font-black text-xl leading-none">
                    B
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 leading-tight">
                  <p className="text-[13px] font-extrabold text-black">
                    {t.title}
                  </p>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="shrink-0 bg-[#F5B400] text-black font-extrabold text-sm px-4 py-2 rounded-md shadow-sm border border-black/10 hover:brightness-95 active:scale-[0.98] transition"
                >
                  {buttonText ?? t.download}
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
