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
    queryFn: async () => {
      const res = await api.get("/api/aff-slider");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

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

  // Skeleton theme
  const sk = {
    baseColor: "rgba(255,255,255,0.06)",
    highlightColor: "rgba(255,255,255,0.12)",
  };

  return (
    <div className="w-full bg-[#2b2b2b] py-2 md:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Outer frame like screenshot */}
        <div
          className="
            relative rounded-sm overflow-hidden
            border border-[#2aa6a6]/60
            bg-white/5 backdrop-blur-xl
          "
        >
          {isLoading ? (
            <div className="w-full h-[120px] sm:h-[260px] md:h-[320px] lg:h-[320px] xl:h-[320px]">
              <Skeleton {...sk} height="100%" />
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              slidesPerView={1}
              loop={loop}
              speed={600}
              autoplay={{
                delay: delay,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              className="babuSwiper"
            >
              {slides.map((src, idx) => (
                <SwiperSlide key={src + idx}>
                  <div className="w-full h-[120px] sm:h-[260px] md:h-[320px] lg:h-[320px] xl:h-[320px]">
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

      {/* ✅ Swiper style to match screenshot controls */}
      <style>{`
        .babuSwiper .swiper-pagination{
          bottom: 10px !important;
        }
        .babuSwiper .swiper-pagination-bullet{
          width: 4px;
          height: 4px;
          opacity: .6;
        }
        .babuSwiper .swiper-pagination-bullet-active{
          opacity: 1;
        }

        .babuSwiper .swiper-button-next,
        .babuSwiper .swiper-button-prev{
          color: #ffffff;
          width: 24px;
          height: 24px;
        }
        .babuSwiper .swiper-button-next:after,
        .babuSwiper .swiper-button-prev:after{
          font-size: 12px;
          font-weight: 700;
        }

        @media (max-width: 360px){
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
