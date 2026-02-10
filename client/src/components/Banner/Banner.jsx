import React, { useMemo, useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Controller } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const toEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v") || "";
    if (!id && url.includes("embed/"))
      id = url.split("embed/")[1]?.split("?")[0] || "";

    const origin = encodeURIComponent(window.location.origin);
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;
  } catch {
    return url;
  }
};

const fetchBanners = async () => {
  const { data } = await api.get("/api/banner-videos?active=true");
  return data;
};

const Banner = () => {
  const { isBangla } = useLanguage();

  const [active, setActive] = useState(0);
  const [shouldAutoplay, setShouldAutoplay] = useState(true);

  const bgSwiperRef = useRef(null);
  const videoSwiperRef = useRef(null);

  const ytPlayersRef = useRef(new Map());
  const ytApiReadyRef = useRef(false);

  const {
    data: banners = [],
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["banner-videos"],
    queryFn: fetchBanners,
    staleTime: 1000 * 60 * 5,
  });

  const t = useMemo(
    () => ({
      sports: isBangla ? "বাবু৮৮ স্পোর্টস" : "BABU88 SPORTS",
      partner: isBangla ? "অফিসিয়াল পার্টনার" : "OFFICIAL PARTNER",
      strikers: isBangla ? "কলম্বো স্ট্রাইকার্স" : "Colombo Strikers",
    }),
    [isBangla],
  );

  const slides = useMemo(() => {
    return banners.map((b) => ({
      id: b._id,
      bannerImg: `${api.defaults.baseURL}${b.bannerImg}`,
      youtube: b.youtube || "",
      title: isBangla ? b.titleBn : b.titleEn,
    }));
  }, [banners, isBangla]);

  // ✅ hooks ALWAYS run (no early return before this)
  useEffect(() => {
    const ensureYTApi = () =>
      new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(true);

        const existing = document.getElementById("yt-iframe-api");
        if (existing) {
          const check = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(check);
              resolve(true);
            }
          }, 50);
          return;
        }

        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => resolve(true);
      });

    ensureYTApi().then(() => {
      ytApiReadyRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!ytApiReadyRef.current) return;
    if (!window.YT || !window.YT.Player) return;

    const onStateChange = (e) => {
      if (e.data === 1) setShouldAutoplay(false);
      if (e.data === 2 || e.data === 0) setShouldAutoplay(true);
    };

    // ✅ only create players for slides that have youtube
    slides.forEach((s) => {
      if (!s.youtube) return;
      const iframeId = `yt-iframe-${s.id}`;
      if (ytPlayersRef.current.has(iframeId)) return;
      const el = document.getElementById(iframeId);
      if (!el) return;

      try {
        const player = new window.YT.Player(iframeId, {
          events: { onStateChange },
        });
        ytPlayersRef.current.set(iframeId, player);
      } catch {}
    });
  }, [slides]);

  // ✅ after all hooks, now safe to return conditionally
  if (isLoading || isFetching) {
    return (
      <section className="w-full">
        <div className="hidden lg:block w-full mx-auto max-w-[1500px]">
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10">
            <div className="h-[390px] w-full">
              <Skeleton height={"100%"} />
            </div>
          </div>
        </div>

        <div className="lg:hidden w-full">
          <div className="mx-auto w-full max-w-[520px] px-2 py-3">
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div className="aspect-[16/9] w-full">
                <Skeleton height={"100%"} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) return null;
  if (!slides.length) return null;

  const iframeId = (slideId) => `yt-iframe-${slideId}`;

  return (
    <section className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full">
        <div className="mx-auto w-full max-w-[520px] px-2 py-3">
          <div className="relative w-full">
            <Swiper
              modules={[Autoplay, Pagination]}
              loop
              speed={650}
              autoplay={
                shouldAutoplay
                  ? { delay: 3000, disableOnInteraction: false }
                  : false
              }
              pagination={{
                el: ".mobile-dots",
                clickable: true,
                bulletClass: "banner-bullet",
                bulletActiveClass: "banner-bullet-active",
              }}
              onSlideChange={(s) => setActive(s.realIndex)}
              className="w-full"
            >
              {slides.map((s) => (
                <SwiperSlide key={s.id}>
                  <div className="relative w-full rounded-xl overflow-hidden border border-white/10">
                    <div className="aspect-[16/9] w-full">
                      {s.youtube ? (
                        <iframe
                          id={iframeId(s.id)}
                          className="w-full h-full"
                          src={toEmbedUrl(s.youtube)}
                          title={s.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={s.bannerImg}
                          alt={s.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-3 flex items-center justify-center gap-2 mobile-dots" />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block w-full mx-auto max-w-[1500px]">
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 ">
          <Swiper
            modules={[Autoplay, Controller]}
            onSwiper={(s) => (bgSwiperRef.current = s)}
            controller={{ control: videoSwiperRef.current }}
            loop
            speed={650}
            autoplay={
              shouldAutoplay
                ? { delay: 3000, disableOnInteraction: false }
                : false
            }
            onSlideChange={(s) => setActive(s.realIndex)}
            className="w-full"
          >
            {slides.map((s) => (
              <SwiperSlide key={s.id}>
                <div className="relative h-[360px] xl:h-[390px]">
                  <img
                    src={s.bannerImg}
                    alt={s.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[30] w-[520px] xl:w-[560px]">
            <Swiper
              modules={[Autoplay, Pagination, Controller]}
              onSwiper={(s) => (videoSwiperRef.current = s)}
              controller={{ control: bgSwiperRef.current }}
              loop
              speed={650}
              autoplay={
                shouldAutoplay
                  ? { delay: 3000, disableOnInteraction: false }
                  : false
              }
              pagination={{
                el: ".desktop-dots",
                clickable: true,
                bulletClass: "banner-bullet",
                bulletActiveClass: "banner-bullet-active",
              }}
              onSlideChange={(s) => setActive(s.realIndex)}
              className="w-full"
            >
              {slides.map((s) => (
                <SwiperSlide key={s.id}>
                  <div className="relative rounded-3xl overflow-hidden bg-black border border-white/10">
                    <div className="aspect-[16/9] w-full">
                      {s.youtube ? (
                        <iframe
                          id={iframeId(s.id)}
                          className="w-full h-full"
                          src={toEmbedUrl(s.youtube)}
                          title={s.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={s.bannerImg}
                          alt={s.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-4 flex items-center justify-center gap-2 desktop-dots" />
          </div>

          <div className="absolute left-10 top-1/2 -translate-y-1/2 z-[20] max-w-[42%]">
            <p className="text-white/90 font-extrabold tracking-widest text-sm">
              {t.sports}
            </p>
            <h2 className="mt-2 text-white font-extrabold text-4xl leading-tight">
              {t.partner}
            </h2>
            <p className="mt-2 text-white/85 font-bold text-lg">{t.strikers}</p>
          </div>

          <div className="absolute right-6 bottom-4 z-[25] text-white/70 text-xs font-bold">
            {active + 1}/{slides.length}
          </div>
        </div>
      </div>

      <style>{`
        .banner-bullet{
          width:10px;
          height:10px;
          border-radius:999px;
          display:inline-block;
          background: #000000;
          cursor:pointer;
          transition: all .2s ease;
        }
        .banner-bullet-active{
          background: #f5b400;
          transform: scale(1.15);
          box-shadow: 0 0 0 3px rgba(245,180,0,0.22);
        }
      `}</style>
    </section>
  );
};

export default Banner;
