import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { api } from "../../api/axios";

const Slider = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["aff-slider"],
    queryFn: async () => (await api.get("/api/aff-slider")).data,
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ UI Config
  const { data: cfg } = useQuery({
    queryKey: ["aff-slider-color"],
    queryFn: async () => (await api.get("/api/aff-slider-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const c = cfg || {};
  const cssVars = {
    "--s-bg": c.sectionBg || "#2b2b2b",
    "--s-py-m": `${c.padYMobile ?? 8}px`,
    "--s-py-md": `${c.padYMd ?? 24}px`,

    "--s-radius": `${c.frameRadius ?? 2}px`,
    "--s-border": c.frameBorderColor || "rgba(42,166,166,0.60)",
    "--s-bw": `${c.frameBorderWidth ?? 1}px`,
    "--s-frame": c.frameBg || "rgba(255,255,255,0.05)",

    "--s-h-m": `${c.hMobile ?? 120}px`,
    "--s-h-sm": `${c.hSm ?? 260}px`,
    "--s-h-md": `${c.hMd ?? 320}px`,

    "--s-pag-bottom": `${c.paginationBottom ?? 10}px`,
    "--s-bw1": `${c.bulletW ?? 4}px`,
    "--s-bh1": `${c.bulletH ?? 4}px`,
    "--s-bop": `${c.bulletOpacity ?? 0.6}`,
    "--s-bop-a": `${c.bulletActiveOpacity ?? 1}`,

    "--s-nav-color": c.navColor || "#ffffff",
    "--s-nav-box": `${c.navBox ?? 24}px`,
    "--s-nav-icon": `${c.navIconSize ?? 12}px`,
    "--s-nav-fw": `${c.navFontWeight ?? 700}`,

    "--s-hide-below": `${c.hideNavBelow ?? 360}px`,
  };

  const fallbackSlides = useMemo(
    () => [
      "https://i.ibb.co.com/6cH71jbY/online-sport-bet-3d-banner-600nw-2635613707.webp",
      "https://i.ibb.co.com/6R5c5S4H/sports-betting-purple-banner-smartphone-champion-cups-falling-gold-coins-sport-balls-button-24633419.webp",
      "https://i.ibb.co.com/zHh2TpVY/istockphoto-1410370133-612x612.jpg",
      "https://i.ibb.co.com/sDyZRZq/sports-betting-banner-smartphone-soccer-600nw-2664078705.webp",
    ],
    [],
  );

  const slides =
    (data?.slides?.length ? data.slides : fallbackSlides) || fallbackSlides;

  const delay = data?.autoPlayDelay ?? 2000;
  const loop = data?.loop ?? true;

  const sk = {
    baseColor: "rgba(255,255,255,0.06)",
    highlightColor: "rgba(255,255,255,0.12)",
  };

  return (
    <div
      style={cssVars}
      className="w-full bg-[color:var(--s-bg)]"
    >
      <div
        className="max-w-7xl mx-auto px-3 sm:px-6"
        style={{ paddingTop: "var(--s-py-m)", paddingBottom: "var(--s-py-m)" }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "var(--s-radius)",
            border: "var(--s-bw) solid var(--s-border)",
            background: "var(--s-frame)",
          }}
        >
          {isLoading ? (
            <div className="w-full slider-h">
              <Skeleton {...sk} height="100%" />
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              slidesPerView={1}
              loop={loop}
              speed={600}
              autoplay={{
                delay,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              className="babuSwiper"
            >
              {slides.map((src, idx) => (
                <SwiperSlide key={src + idx}>
                  <div className="w-full slider-h">
                    <img
                      src={src}
                      alt={`slide-${idx + 1}`}
                      className="w-full h-full object-cover"
                      draggable="false"
                      loading="lazy"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      <style>{`
        /* responsive section padding like md:py-6 */
        @media (min-width: 768px){
          .max-w-7xl { padding-top: var(--s-py-md) !important; padding-bottom: var(--s-py-md) !important; }
        }

        /* slider height responsive */
        .slider-h{ height: var(--s-h-m); }
        @media (min-width: 640px){ .slider-h{ height: var(--s-h-sm); } }
        @media (min-width: 768px){ .slider-h{ height: var(--s-h-md); } }

        /* pagination */
        .babuSwiper .swiper-pagination{
          bottom: var(--s-pag-bottom) !important;
        }
        .babuSwiper .swiper-pagination-bullet{
          width: var(--s-bw1);
          height: var(--s-bh1);
          opacity: var(--s-bop);
        }
        .babuSwiper .swiper-pagination-bullet-active{
          opacity: var(--s-bop-a);
        }

        /* nav arrows */
        .babuSwiper .swiper-button-next,
        .babuSwiper .swiper-button-prev{
          color: var(--s-nav-color);
          width: var(--s-nav-box);
          height: var(--s-nav-box);
        }
        .babuSwiper .swiper-button-next:after,
        .babuSwiper .swiper-button-prev:after{
          font-size: var(--s-nav-icon);
          font-weight: var(--s-nav-fw);
        }

        /* hide nav below configured width */
        @media (max-width: 360px){
          .babuSwiper .swiper-button-next,
          .babuSwiper .swiper-button-prev{
            display: none;
          }
        }
        @media (max-width: ${c.hideNavBelow ?? 360}px){
          .babuSwiper .swiper-button-next,
          .babuSwiper .swiper-button-prev{
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Slider;
