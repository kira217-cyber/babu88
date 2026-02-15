import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { FaAndroid, FaDownload } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const fetchDownloadBanner = async () => {
  const { data } = await api.get("/api/download-banner");
  return data;
};

const fetchDownloadBannerColor = async () => {
  const { data } = await api.get("/api/download-banner-color");
  return data;
};

const shadowFrom = (s) => (s ? String(s).replaceAll("_", " ") : "");

const DownloadBanner = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["download-banner"],
    queryFn: fetchDownloadBanner,
    staleTime: 1000 * 60 * 5,
  });

  const { data: colorDoc } = useQuery({
    queryKey: ["download-banner-color"],
    queryFn: fetchDownloadBannerColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // ✅ URLs (data না থাকলেও safe)
  const APK_URL = data?.apkUrl ? `${api.defaults.baseURL}${data.apkUrl}` : "";
  const RIGHT_IMAGE = data?.rightImageUrl
    ? `${api.defaults.baseURL}${data.rightImageUrl}`
    : "";

  // ✅ styles from admin (fallback = current design)
  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      sectionBg: d.sectionBg || "#ffffff",

      titleColor: d.titleColor || "#000000",
      titleSizeMobile: d.titleSizeMobile ?? 22,
      titleSizeSm: d.titleSizeSm ?? 28,
      titleSizeLg: d.titleSizeLg ?? 34,
      titleWeight: d.titleWeight ?? 800,

      subColor: d.subColor || "#000000",
      subOpacity: d.subOpacity ?? 0.6,
      subSizeMobile: d.subSizeMobile ?? 14,
      subSizeSm: d.subSizeSm ?? 16,
      subWeight: d.subWeight ?? 600,

      downloadBtnBg: d.downloadBtnBg || "#f5b400",
      downloadBtnText: d.downloadBtnText || "#000000",
      downloadBtnHeight: d.downloadBtnHeight ?? 48,
      downloadBtnRadius: d.downloadBtnRadius ?? 12,
      downloadBtnTextSize: d.downloadBtnTextSize ?? 14,
      downloadBtnWeight: d.downloadBtnWeight ?? 800,
      downloadBtnShadow: shadowFrom(
        d.downloadBtnShadow || "0_8px_18px_rgba(245,180,0,0.35)",
      ),

      androidBtnBg: d.androidBtnBg || "#ffffff",
      androidBtnText: d.androidBtnText || "#6ac259",
      androidBtnBorderColor: d.androidBtnBorderColor || "#000000",
      androidBtnBorderOpacity: d.androidBtnBorderOpacity ?? 0.1,
      androidBtnHeight: d.androidBtnHeight ?? 48,
      androidBtnRadius: d.androidBtnRadius ?? 12,
      androidBtnTextSize: d.androidBtnTextSize ?? 14,
      androidBtnWeight: d.androidBtnWeight ?? 800,
      androidBtnShadow: shadowFrom(
        d.androidBtnShadow || "0_10px_25px_rgba(0,0,0,0.08)",
      ),

      rightRadialOpacity: d.rightRadialOpacity ?? 0.06,
    };
  }, [colorDoc]);

  // ✅ useMemo ALWAYS runs (no early return before this)
  const t = useMemo(() => {
    const title = isBangla ? data?.titleBn : data?.titleEn;
    const sub = isBangla ? data?.subBn : data?.subEn;
    const btnDownload = isBangla ? data?.btnDownloadBn : data?.btnDownloadEn;
    const btnAndroid = isBangla ? data?.btnAndroidBn : data?.btnAndroidEn;

    return {
      title:
        title ||
        (isBangla
          ? "অফিসিয়াল BABU88 মোবাইল অ্যাপ চালু হতে যাচ্ছে।\nযেতে যেতে নির্দিষ্ট গেম উপভোগ করুন!"
          : "Official BABU88 mobile app is coming soon.\nEnjoy your favorite games on the go!"),
      sub:
        sub ||
        (isBangla
          ? "ডাউনলোড করুন এবং ইউজারের মধ্যে দূর দিন!"
          : "Download now and get started in seconds!"),
      btnDownload:
        btnDownload || (isBangla ? "এখনই ডাউনলোড করুন" : "Download Now"),
      btnAndroid:
        btnAndroid || (isBangla ? "Android এ উপলব্ধ" : "Available on Android"),
    };
  }, [isBangla, data]);

  // ✅ NOW you can early return safely
  if (isLoading || isFetching) {
    return (
      <section
        className="w-full bg-white"
        style={{ backgroundColor: ui.sectionBg }}
      >
        <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* LEFT skeleton */}
            <div className="rounded-2xl border border-black/5 bg-white/40 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="space-y-3">
                <Skeleton height={26} width={"85%"} />
                <Skeleton height={26} width={"72%"} />
              </div>
              <div className="mt-4">
                <Skeleton height={16} width={"70%"} />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="h-12 w-full sm:w-[220px] rounded-xl overflow-hidden border border-black/5 bg-white/50 backdrop-blur-md">
                  <Skeleton height={"100%"} />
                </div>
                <div className="h-12 w-full sm:w-[220px] rounded-xl overflow-hidden border border-black/5 bg-white/50 backdrop-blur-md">
                  <Skeleton height={"100%"} />
                </div>
              </div>
            </div>

            {/* RIGHT skeleton */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div
                  className="absolute -inset-6 blur-xl"
                  style={{
                    backgroundImage: `radial-gradient(circle_at_center,rgba(0,0,0,${ui.rightRadialOpacity}),transparent_60%)`,
                  }}
                />
                <div className="relative w-[320px] sm:w-[420px] lg:w-[560px] h-[260px] sm:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden border border-black/5 bg-white/40 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                  <Skeleton height={"100%"} />
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .react-loading-skeleton{ opacity: 0.7; }
          `}</style>
        </div>
      </section>
    );
  }

  if (isError) return null;

  // inactive হলে hide
  if (data?.isActive === false) return null;

  const handleDownload = () => {
    if (!APK_URL) return;
    const link = document.createElement("a");
    link.href = APK_URL;
    link.setAttribute("download", "APP.apk");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <section
      className="w-full bg-white"
      style={{ backgroundColor: ui.sectionBg }}
    >
      <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div>
            <h2
              className="text-[22px] sm:text-[28px] lg:text-[34px] font-extrabold text-black leading-snug whitespace-pre-line"
              style={{ color: ui.titleColor, fontWeight: ui.titleWeight }}
            >
              <span
                className="block sm:hidden"
                style={{ fontSize: ui.titleSizeMobile }}
              >
                {t.title}
              </span>
              <span
                className="hidden sm:block lg:hidden"
                style={{ fontSize: ui.titleSizeSm }}
              >
                {t.title}
              </span>
              <span
                className="hidden lg:block"
                style={{ fontSize: ui.titleSizeLg }}
              >
                {t.title}
              </span>
            </h2>

            <p
              className="mt-3 text-black/60 font-semibold text-[14px] sm:text-[16px]"
              style={{
                color: ui.subColor,
                opacity: ui.subOpacity,
                fontWeight: ui.subWeight,
              }}
            >
              <span
                className="block sm:hidden"
                style={{ fontSize: ui.subSizeMobile }}
              >
                {t.sub}
              </span>
              <span
                className="hidden sm:block"
                style={{ fontSize: ui.subSizeSm }}
              >
                {t.sub}
              </span>
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!APK_URL}
                className="
                  inline-flex cursor-pointer items-center justify-center gap-2
                  h-12 px-5 rounded-xl
                  bg-[#f5b400] text-black font-extrabold
                  shadow-[0_8px_18px_rgba(245,180,0,0.35)]
                  hover:brightness-95 active:scale-[0.99]
                  transition disabled:opacity-60
                "
                style={{
                  height: ui.downloadBtnHeight,
                  borderRadius: ui.downloadBtnRadius,
                  backgroundColor: ui.downloadBtnBg,
                  color: ui.downloadBtnText,
                  fontWeight: ui.downloadBtnWeight,
                  fontSize: ui.downloadBtnTextSize,
                  boxShadow: ui.downloadBtnShadow,
                }}
              >
                <FaDownload />
                {t.btnDownload}
              </button>

              <a
                href={APK_URL || "#"}
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload();
                }}
                className="
                  inline-flex cursor-pointer items-center justify-center gap-2
                  h-12 px-5 rounded-xl
                  bg-white text-[#6ac259]
                  border border-black/10
                  shadow-[0_10px_25px_rgba(0,0,0,0.08)]
                  hover:bg-black/5 active:scale-[0.99]
                  transition
                "
                style={{
                  height: ui.androidBtnHeight,
                  borderRadius: ui.androidBtnRadius,
                  backgroundColor: ui.androidBtnBg,
                  color: ui.androidBtnText,
                  borderColor: `rgba(0,0,0,${ui.androidBtnBorderOpacity})`,
                  boxShadow: ui.androidBtnShadow,
                }}
              >
                <FaAndroid className="text-[20px]" />
                <span
                  style={{
                    fontWeight: ui.androidBtnWeight,
                    fontSize: ui.androidBtnTextSize,
                  }}
                >
                  {t.btnAndroid}
                </span>
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div
                className="absolute -inset-6 blur-xl"
                style={{
                  backgroundImage: `radial-gradient(circle_at_center,rgba(0,0,0,${ui.rightRadialOpacity}),transparent_60%)`,
                }}
              />

              {RIGHT_IMAGE ? (
                <img
                  src={RIGHT_IMAGE}
                  alt="Download App"
                  className="relative w-[320px] sm:w-[420px] lg:w-[560px] h-auto object-contain"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div className="relative w-[320px] sm:w-[420px] lg:w-[560px] h-[260px] bg-black/5 rounded-xl flex items-center justify-center text-black/50 font-bold">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadBanner;
