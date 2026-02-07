import React, { useMemo, useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Controller } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "../../Context/LanguageProvider";

// ✅ YouTube embed helper (updated: add origin + api)
const toEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v") || "";
    if (!id && url.includes("embed/")) id = url.split("embed/")[1]?.split("?")[0] || "";

    const origin = encodeURIComponent(window.location.origin);
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;
  } catch {
    return url;
  }
};

const Banner = () => {
  const { isBangla } = useLanguage();

  const [active, setActive] = useState(0);
  const [shouldAutoplay, setShouldAutoplay] = useState(true);

  const bgSwiperRef = useRef(null);
  const videoSwiperRef = useRef(null);

  // ✅ keep track of youtube players for all iframes
  const ytPlayersRef = useRef(new Map());
  const ytApiReadyRef = useRef(false);

  // Translations – unchanged
  const t = useMemo(
    () => ({
      sports: isBangla ? "বাবু৮৮ স্পোর্টস" : "BABU88 SPORTS",
      partner: isBangla ? "অফিসিয়াল পার্টনার" : "OFFICIAL PARTNER",
      strikers: isBangla ? "কলম্বো স্ট্রাইকার্স" : "Colombo Strikers",
    }),
    [isBangla],
  );

  const slides = useMemo(
    () => [
      {
        id: 1,
        bannerImg:
          "https://jiliwin.9terawolf.com/cms/banner/image/bd-desktop-67c43f6590c1b.jpg",
        title: isBangla ? "বাবু৮৮ × কলম্বো স্ট্রাইকার্স" : "BABU88 X Colombo Strikers",
      },
      {
        id: 2,
        bannerImg:
          "https://jiliwin.9terawolf.com/cms/banner/image/bd-desktop-689c462a80042.jpg",
        youtube: "https://www.youtube.com/watch?v=aHkO3-0qgxI",
        title: isBangla ? "অফিসিয়াল পার্টনার" : "Official Partner",
      },
      {
        id: 3,
        bannerImg:
          "https://jiliwin.9terawolf.com/cms/banner/image/bd-desktop-6973429dc7447.jpg",
        youtube: "https://www.youtube.com/watch?v=gzLE4HAimek",
        title: isBangla ? "স্পোর্টস প্রমো" : "Sports Promo",
      },
      {
        id: 4,
        bannerImg:
          "https://jiliwin.9terawolf.com/cms/banner/image/bd-desktop-69803ffca296c.jpg",
        youtube: "https://www.youtube.com/watch?v=hcYiz1Q_yqI",
        title: isBangla ? "বড় ইভেন্ট" : "Big Event",
      },
    ],
    [isBangla],
  );

  // ✅ Load YouTube Iframe API once
  useEffect(() => {
    const ensureYTApi = () =>
      new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(true);

        // if script already added, wait for it
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

        // add script
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        // youtube calls global function when ready
        window.onYouTubeIframeAPIReady = () => resolve(true);
      });

    ensureYTApi().then(() => {
      ytApiReadyRef.current = true;
    });
  }, []);

  // ✅ create players after render (and whenever slides change language)
  useEffect(() => {
    if (!ytApiReadyRef.current) return;
    if (!window.YT || !window.YT.Player) return;

    const onStateChange = (e) => {
      // states: 1 playing, 2 paused, 0 ended
      if (e.data === 1) setShouldAutoplay(false);
      if (e.data === 2 || e.data === 0) setShouldAutoplay(true);
    };

    // create players for any iframe not registered yet
    slides.forEach((s) => {
      const iframeId = `yt-iframe-${s.id}`;

      if (ytPlayersRef.current.has(iframeId)) return;
      const el = document.getElementById(iframeId);
      if (!el) return;

      try {
        const player = new window.YT.Player(iframeId, {
          events: { onStateChange },
        });
        ytPlayersRef.current.set(iframeId, player);
      } catch {
        // ignore if player fails (rare)
      }
    });

    return () => {
      // cleanup players on unmount
      // (don’t destroy between language toggles; just let it be handled by React re-render)
    };
  }, [slides]);

  // ✅ helper: unique iframe id
  const iframeId = (slideId) => `yt-iframe-${slideId}`;

  return (
    <section className="w-full">
      {/* =================== MOBILE (video only) =================== */}
      <div className="lg:hidden w-full">
        <div className="mx-auto w-full max-w-[520px] px-2 py-3">
          <div className="relative w-full">
            <Swiper
              modules={[Autoplay, Pagination]}
              loop
              speed={650}
              autoplay={shouldAutoplay ? { delay: 3000, disableOnInteraction: false } : false}
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
                      <iframe
                        id={iframeId(s.id)}
                        className="w-full h-full"
                        src={toEmbedUrl(s.youtube)}
                        title={s.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-3 flex items-center justify-center gap-2 mobile-dots" />
          </div>
        </div>
      </div>

      {/* =================== DESKTOP/LAPTOP =================== */}
      <div className="hidden lg:block w-full mx-auto max-w-[1500px]">
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 ">
          {/* Background slider */}
          <Swiper
            modules={[Autoplay, Controller]}
            onSwiper={(s) => (bgSwiperRef.current = s)}
            controller={{ control: videoSwiperRef.current }}
            loop
            speed={650}
            autoplay={shouldAutoplay ? { delay: 3000, disableOnInteraction: false } : false}
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

          {/* Floating video */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[30] w-[520px] xl:w-[560px]">
            <Swiper
              modules={[Autoplay, Pagination, Controller]}
              onSwiper={(s) => (videoSwiperRef.current = s)}
              controller={{ control: bgSwiperRef.current }}
              loop
              speed={650}
              autoplay={shouldAutoplay ? { delay: 3000, disableOnInteraction: false } : false}
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
                      <iframe
                        id={iframeId(s.id)}
                        className="w-full h-full"
                        src={toEmbedUrl(s.youtube)}
                        title={s.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="mt-4 flex items-center justify-center gap-2 desktop-dots" />
          </div>

          {/* Left branding text – unchanged */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 z-[20] max-w-[42%]">
            <p className="text-white/90 font-extrabold tracking-widest text-sm">{t.sports}</p>
            <h2 className="mt-2 text-white font-extrabold text-4xl leading-tight">{t.partner}</h2>
            <p className="mt-2 text-white/85 font-bold text-lg">{t.strikers}</p>
          </div>

          {/* Slide counter */}
          <div className="absolute right-6 bottom-4 z-[25] text-white/70 text-xs font-bold">
            {active + 1}/{slides.length}
          </div>
        </div>
      </div>

      {/* Custom pagination bullets – unchanged */}
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
