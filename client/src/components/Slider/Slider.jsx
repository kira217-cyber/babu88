import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import { api } from "../../api/axios";

const fetchSliders = async () => {
  const { data } = await api.get("/api/sliders");
  return data.sliders || [];
};

const Slider = () => {
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["sliders-public"],
    queryFn: fetchSliders,
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <div className="w-full mt-4 px-2 md:px-0">
        <div className="w-full h-[160px] sm:h-[200px] md:h-[260px] lg:h-[400px] bg-white/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!slides.length) return null;

  return (
    <div className="w-full mt-4 px-2 md:mt-0 md:px-0">
      <div className="relative w-full overflow-hidden rounded-2xl md:rounded-none">
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1}
          loop
          speed={650}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{ nextEl: ".babu-next", prevEl: ".babu-prev" }}
          className="w-full"
        >
          {slides.map((s) => (
            <SwiperSlide key={s._id}>
              <div className="relative w-full">
                <div className="w-full h-[160px] sm:h-[200px] md:h-[260px] lg:h-[400px]">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${s.imageUrl}`}
                    alt="Slider"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          aria-label="Previous slide"
          className="babu-prev group absolute cursor-pointer left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20
          h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/40 border border-black/10 shadow-md
          flex items-center justify-center hover:bg-white active:scale-95 transition-all duration-200"
        >
          <FaChevronLeft className="text-[20px] sm:text-[24px] text-black/75 group-hover:text-black transition-colors" />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="babu-next group absolute cursor-pointer right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20
          h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/40 border border-black/10 shadow-md
          flex items-center justify-center hover:bg-white active:scale-95 transition-all duration-200"
        >
          <FaChevronRight className="text-[20px] sm:text-[24px] text-black/75 group-hover:text-black transition-colors" />
        </button>

        <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-[22px] ring-1 ring-white/20" />
      </div>
    </div>
  );
};

export default Slider;
