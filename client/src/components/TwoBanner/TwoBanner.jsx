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

const TwoBanner = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["two-banner"],
    queryFn: fetchTwoBanner,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ hooks-safe memo
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

    // external
    const isExternal = /^https?:\/\//i.test(link);

    if (isExternal) {
      if (view.openInNewTab) window.open(link, "_blank", "noopener,noreferrer");
      else window.location.href = link;
      return;
    }

    // internal route
    if (view.openInNewTab) {
      // internal route new tab (blank page)
      const url = `${window.location.origin}${link.startsWith("/") ? link : `/${link}`}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };

  // loading skeleton (transparent look)
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
            <div className="relative overflow-hidden rounded-2xl bg-[#2f2f2f] shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <img
                  src={view.LEFT_BANNER}
                  alt={isBangla ? "বন্ধু রেফার" : "Refer friends"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.35),rgba(0,0,0,0.08))]" />

              <div className="absolute inset-0 p-4 sm:p-6 flex">
                <div className="max-w-[75%] sm:max-w-[65%]">
                  <h3 className="text-white font-extrabold text-[16px] sm:text-[18px] lg:text-[24px]">
                    {view.title}
                  </h3>

                  <p
                    className="
                      mt-2 text-white/85
                      text-[12px] sm:text-[13px] lg:text-[18px]
                      leading-relaxed
                      line-clamp-2
                      sm:line-clamp-none
                    "
                  >
                    {view.description}
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
                  >
                    {view.buttonText}
                  </button>
                </div>
              </div>

              <div className="pointer-events-none absolute right-0 top-0 h-full w-[45%] bg-[radial-gradient(circle_at_70%_40%,rgba(245,180,0,0.25),transparent_55%)]" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-2xl bg-[#2f2f2f] shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
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

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.05),rgba(0,0,0,0.18))]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoBanner;
