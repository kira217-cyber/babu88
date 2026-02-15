import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const fetchTwoBanner = async () => {
  const { data } = await api.get("/api/two-banner");
  return data;
};

const fetchTwoBannerColor = async () => {
  const { data } = await api.get("/api/two-banner-color");
  return data;
};

const rgbaBlack = (a) => `rgba(0,0,0,${a})`;

const shadowFrom = (s) => (s ? String(s).replaceAll("_", " ") : "");

const TwoBanner = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["two-banner"],
    queryFn: fetchTwoBanner,
    staleTime: 1000 * 60 * 5,
  });

  const { data: colorDoc } = useQuery({
    queryKey: ["two-banner-color"],
    queryFn: fetchTwoBannerColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      leftCardBg: d.leftCardBg || "#2f2f2f",
      leftCardShadow: shadowFrom(
        d.leftCardShadow || "0_18px_45px_rgba(0,0,0,0.25)",
      ),
      leftCardRadius: d.leftCardRadius ?? 16,

      leftOverlayStart: d.leftOverlayStart ?? 0.72,
      leftOverlayMid: d.leftOverlayMid ?? 0.35,
      leftOverlayEnd: d.leftOverlayEnd ?? 0.08,

      titleColor: d.titleColor || "#ffffff",
      titleSizeMobile: d.titleSizeMobile ?? 16,
      titleSizeSm: d.titleSizeSm ?? 18,
      titleSizeLg: d.titleSizeLg ?? 24,
      titleWeight: d.titleWeight ?? 800,

      descColor: d.descColor || "#ffffff",
      descOpacity: d.descOpacity ?? 0.85,
      descSizeMobile: d.descSizeMobile ?? 12,
      descSizeSm: d.descSizeSm ?? 13,
      descSizeLg: d.descSizeLg ?? 18,
      descWeight: d.descWeight ?? 500,

      buttonBg: d.buttonBg || "#f5b400",
      buttonText: d.buttonText || "#000000",
      buttonTextSize: d.buttonTextSize ?? 14,
      buttonWeight: d.buttonWeight ?? 800,
      buttonShadow: shadowFrom(
        d.buttonShadow || "0_10px_18px_rgba(245,180,0,0.35)",
      ),

      rightCardBg: d.rightCardBg || "#2f2f2f",
      rightCardShadow: shadowFrom(
        d.rightCardShadow || "0_18px_45px_rgba(0,0,0,0.25)",
      ),
      rightCardRadius: d.rightCardRadius ?? 16,

      rightOverlayA: d.rightOverlayA ?? 0.18,
      rightOverlayB: d.rightOverlayB ?? 0.05,
      rightOverlayC: d.rightOverlayC ?? 0.18,

      glowColor: d.glowColor || "#f5b400",
      glowOpacity: d.glowOpacity ?? 0.25,
    };
  }, [colorDoc]);

  const view = useMemo(() => {
    const isActive = data?.isActive ?? true;

    const title = isBangla ? data?.titleBn : data?.titleEn;
    const description = isBangla ? data?.descriptionBn : data?.descriptionEn;
    const buttonText = isBangla ? data?.buttonTextBn : data?.buttonTextEn;

    const LEFT_BANNER = data?.leftBannerUrl
      ? `${api.defaults.baseURL}${data.leftBannerUrl}`
      : "https://babu88.gold/static/image/homepage/refer_banner.jpg";

    const RIGHT_BANNER = data?.rightBannerUrl
      ? `${api.defaults.baseURL}${data.rightBannerUrl}`
      : "https://babu88.gold/static/image/homepage/bb88_bp_1400_560.jpg";

    const buttonLink = data?.buttonLink || "/refer";
    const openInNewTab = data?.openInNewTab ?? true;

    return {
      isActive,
      title:
        title ||
        (isBangla
          ? "বন্ধুদের রেফার করে আয় শুরু করুন"
          : "Refer friends and start earning"),
      description:
        description ||
        (isBangla
          ? "বাংলাদেশের নং ১ ফ্রেন্ড রেফারেল প্রোগ্রাম এখন এখানে! একজন বন্ধুকে রেফার করে ফ্রি ৳৫০০ উপভোগ করুন এবং আপনার বন্ধু প্রতিবার জমা দিলে আনলিমিটেড সর্বোচ্চ % কমিশন পান!"
          : "Bangladesh's No.1 Friend Referral Program is here! Refer a friend and enjoy free ৳500, plus earn unlimited maximum % commission every time your friend deposits!"),
      buttonText: buttonText || (isBangla ? "এখনই রেফার করুন" : "Refer Now"),
      LEFT_BANNER,
      RIGHT_BANNER,
      buttonLink,
      openInNewTab,
    };
  }, [data, isBangla]);

  const handleButton = () => {
    const link = view.buttonLink;
    const isExternal = /^https?:\/\//i.test(link);

    if (isExternal) {
      if (view.openInNewTab) window.open(link, "_blank", "noopener,noreferrer");
      else window.location.href = link;
      return;
    }

    if (view.openInNewTab) {
      const url = `${window.location.origin}${link.startsWith("/") ? link : `/${link}`}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };

  if (isLoading || isFetching) {
    return (
      <section className="w-full mt-4">
        <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-black/5 bg-white/40 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <Skeleton height={"100%"} />
              </div>
            </div>
            <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-black/5 bg-white/40 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <Skeleton height={"100%"} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (view.isActive === false) return null;

  return (
    <section className="w-full mt-4">
      <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT */}
          <div className="lg:col-span-8">
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: ui.leftCardRadius,
                backgroundColor: ui.leftCardBg,
                boxShadow: ui.leftCardShadow,
              }}
            >
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <img
                  src={view.LEFT_BANNER}
                  alt={isBangla ? "বন্ধু রেফার" : "Refer friends"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(90deg,${rgbaBlack(ui.leftOverlayStart)},${rgbaBlack(
                    ui.leftOverlayMid,
                  )},${rgbaBlack(ui.leftOverlayEnd)})`,
                }}
              />

              <div className="absolute inset-0 p-4 sm:p-6 flex">
                <div className="max-w-[75%] sm:max-w-[65%]">
                  <h3
                    className="text-white font-extrabold text-[16px] sm:text-[18px] lg:text-[24px]"
                    style={{ color: ui.titleColor, fontWeight: ui.titleWeight }}
                  >
                    {/* keep original responsive sizes (no class change) but override via inline */}
                    <span
                      className="block sm:hidden"
                      style={{ fontSize: ui.titleSizeMobile }}
                    >
                      {view.title}
                    </span>
                    <span
                      className="hidden sm:block lg:hidden"
                      style={{ fontSize: ui.titleSizeSm }}
                    >
                      {view.title}
                    </span>
                    <span
                      className="hidden lg:block"
                      style={{ fontSize: ui.titleSizeLg }}
                    >
                      {view.title}
                    </span>
                  </h3>

                  <p
                    className="
                      mt-2 text-white/85
                      text-[12px] sm:text-[13px] lg:text-[18px]
                      leading-relaxed
                      line-clamp-2
                      sm:line-clamp-none
                    "
                    style={{
                      color: ui.descColor,
                      opacity: ui.descOpacity,
                      fontWeight: ui.descWeight,
                    }}
                  >
                    <span
                      className="block sm:hidden"
                      style={{ fontSize: ui.descSizeMobile }}
                    >
                      {view.description}
                    </span>
                    <span
                      className="hidden sm:block lg:hidden"
                      style={{ fontSize: ui.descSizeSm }}
                    >
                      {view.description}
                    </span>
                    <span
                      className="hidden lg:block"
                      style={{ fontSize: ui.descSizeLg }}
                    >
                      {view.description}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={handleButton}
                    className="
                      mt-4 inline-flex cursor-pointer items-center justify-center
                      h-10 px-5 rounded-full
                      bg-[#f5b400] text-black font-extrabold text-sm
                      shadow-[0_10px_18px_rgba(245,180,0,0.35)]
                      hover:brightness-95 active:scale-[0.99]
                      transition
                    "
                    style={{
                      backgroundColor: ui.buttonBg,
                      color: ui.buttonText,
                      fontWeight: ui.buttonWeight,
                      fontSize: ui.buttonTextSize,
                      boxShadow: ui.buttonShadow,
                    }}
                  >
                    {view.buttonText}
                  </button>
                </div>
              </div>

              <div
                className="pointer-events-none absolute right-0 top-0 h-full w-[45%]"
                style={{
                  backgroundImage: `radial-gradient(circle_at_70%_40%, rgba(245,180,0,${ui.glowOpacity}), transparent 55%)`,
                }}
              />

              {/* if you want glowColor dynamic too */}
              <style>{`
                /* override glow color dynamically while keeping design */
              `}</style>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: ui.rightCardRadius,
                backgroundColor: ui.rightCardBg,
                boxShadow: ui.rightCardShadow,
              }}
            >
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <img
                  src={view.RIGHT_BANNER}
                  alt={
                    isBangla
                      ? "এক্সক্লুসিভ বেটিং পাস"
                      : "Exclusive betting pass"
                  }
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${rgbaBlack(ui.rightOverlayA)}, ${rgbaBlack(
                    ui.rightOverlayB,
                  )}, ${rgbaBlack(ui.rightOverlayC)})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Make glow color truly dynamic (without changing structure) */}
      <style>{`
        /* overwrite LEFT glow using CSS var-like injection */
      `}</style>
    </section>
  );
};

export default TwoBanner;
