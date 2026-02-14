import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const fetchNotice = async () => {
  const { data } = await api.get("/api/notice");
  return data;
};

const fetchNoticeColor = async () => {
  const { data } = await api.get("/api/notice-color");
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

const Notice = () => {
  const { isBangla } = useLanguage();

  const { data: noticeData } = useQuery({
    queryKey: ["notice"],
    queryFn: fetchNotice,
    staleTime: 1000 * 60 * 5,
  });

  const { data: colorDoc } = useQuery({
    queryKey: ["notice-color"],
    queryFn: fetchNoticeColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // ✅ fallback
  const fallbackBn =
    "পেমেন্ট কদই, বা OTP কারো সাথে শেয়ার করবেন না। এছাড়াও, তুমি প্যাকের রেটিং লিংকে ক্লিক করবেন না। সহায়তার জন্য, নিচে উল্লেখিত লাইভ চ্যাটের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।";
  const fallbackEn =
    "Never share your payment code or OTP with anyone. Also, do not click on any suspicious rating or recharge links. For support, contact us via the live chat below.";

  const noticeText = useMemo(() => {
    const isActive = noticeData?.isActive ?? true;
    if (!isActive) return "";

    if (isBangla) return noticeData?.noticeBn || fallbackBn;
    return noticeData?.noticeEn || fallbackEn;
  }, [isBangla, noticeData]);

  if (!noticeText) return null;

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      containerBg: d.containerBg || "#3c3c3c",
      borderColor: d.borderColor || "#000000",
      borderOpacity: d.borderOpacity ?? 0.2,
      radiusPx: d.radiusPx ?? 6,

      textColor: d.textColor || "#ffffff",
      textOpacity: d.textOpacity ?? 0.92,
      textWeight: d.textWeight ?? 800,
      textSizeMobile: d.textSizeMobile ?? 14,
      textSizeSm: d.textSizeSm ?? 14,
      textSizeLg: d.textSizeLg ?? 14,

      sepColor: d.sepColor || "#ffffff",
      sepOpacity: d.sepOpacity ?? 0.35,
      sepWeight: d.sepWeight ?? 900,

      gapMobile: d.gapMobile ?? 18,
      gapSm: d.gapSm ?? 22,
      durationSec: d.durationSec ?? 30,
    };
  }, [colorDoc]);

  return (
    <section className="w-full mt-4 px-2 lg:px-0">
      <div
        className="w-full mx-auto max-w-[1500px] rounded-md overflow-hidden"
        style={{
          backgroundColor: ui.containerBg,
          border: `1px solid ${hexToRgba(ui.borderColor, ui.borderOpacity)}`,
          borderRadius: ui.radiusPx,
        }}
      >
        <div className="flex items-center">
          <div className="relative flex-1 overflow-hidden py-2 sm:py-2.5">
            <div className="marquee-track">
              <div className="marquee-content">
                <span className="marquee-text">{noticeText}</span>
                <span className="marquee-sep">•</span>
                <span className="marquee-text">{noticeText}</span>
                <span className="marquee-sep">•</span>
                <span className="marquee-text">{noticeText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track{
          width: 100%;
          overflow: hidden;
        }
        .marquee-content{
          display: inline-flex;
          align-items: center;
          gap: ${ui.gapMobile}px;
          white-space: nowrap;
          will-change: transform;
          animation: marqueeMove ${ui.durationSec}s linear infinite;
        }
        .marquee-text{
          color: ${hexToRgba(ui.textColor, ui.textOpacity)};
          font-weight: ${ui.textWeight};
          font-size: ${ui.textSizeMobile}px;
        }
        @media (min-width: 640px){
          .marquee-text{ font-size: ${ui.textSizeSm}px; }
          .marquee-content{ gap: ${ui.gapSm}px; }
        }
        @media (min-width: 1024px){
          .marquee-text{ font-size: ${ui.textSizeLg}px; }
        }
        .marquee-sep{
          color: ${hexToRgba(ui.sepColor, ui.sepOpacity)};
          font-weight: ${ui.sepWeight};
        }

        @keyframes marqueeMove{
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }

        @media (prefers-reduced-motion: reduce){
          .marquee-content{ animation: none; }
        }
      `}</style>
    </section>
  );
};

export default Notice;
