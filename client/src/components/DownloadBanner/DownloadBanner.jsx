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

const DownloadBanner = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["download-banner"],
    queryFn: fetchDownloadBanner,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ URLs (data না থাকলেও safe)
  const APK_URL = data?.apkUrl ? `${api.defaults.baseURL}${data.apkUrl}` : "";
  const RIGHT_IMAGE = data?.rightImageUrl
    ? `${api.defaults.baseURL}${data.rightImageUrl}`
    : "";

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
      <section className="w-full bg-white">
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
                <div className="absolute -inset-6 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_60%)] blur-xl" />
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
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div>
            <h2 className="text-[22px] sm:text-[28px] lg:text-[34px] font-extrabold text-black leading-snug whitespace-pre-line">
              {t.title}
            </h2>

            <p className="mt-3 text-black/60 font-semibold text-[14px] sm:text-[16px]">
              {t.sub}
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
              >
                <FaAndroid className="text-[20px]" />
                <span className="font-extrabold">{t.btnAndroid}</span>
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_60%)] blur-xl" />

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
