import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

// ✅ তোমার 4টা banner image এখানে দাও (যেগুলো চাও সেগুলো রিপ্লেস করো)
const Slider = () => {
  const slides = useMemo(
    () => [
      {
        id: 1,
        img: "https://i.ibb.co/9Z2yGQy/banner1.jpg", // 🔁 replace with your real banner
        alt: "Banner 1",
      },
      {
        id: 2,
        img: "https://i.ibb.co/QcQnK9W/banner2.jpg", // 🔁 replace
        alt: "Banner 2",
      },
      {
        id: 3,
        img: "https://i.ibb.co/rQYk6sF/banner3.jpg", // 🔁 replace
        alt: "Banner 3",
      },
      {
        id: 4,
        img: "https://i.ibb.co/5Yy0QzW/banner4.jpg", // 🔁 replace
        alt: "Banner 4",
      },
    ],
    [],
  );

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
          navigation={{
            nextEl: ".babu-next",
            prevEl: ".babu-prev",
          }}
          className="w-full"
        >
          {slides.map((s) => (
            <SwiperSlide key={s.id}>
              <div className="relative w-full">
                {/* Responsive height – same as before */}
                <div className="w-full h-[160px] sm:h-[200px] md:h-[260px] lg:h-[400px]">
                  <img
                    src={s.img}
                    alt={s.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>

                {/* Golden overlays (optional – যদি চাও তাহলে রাখতে পারো, না হলে কমেন্ট করে দিতে পারো) */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" /> */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Updated arrows – now using react-icons instead of text */}
        <button
          type="button"
          aria-label="Previous slide"
          className="
            babu-prev
            group absolute cursor-pointer left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 sm:h-11 sm:w-11
            rounded-full
            bg-white/80 backdrop-blur-md
            border border-black/10
            shadow-md
            flex items-center justify-center
            hover:bg-white
            active:scale-95
            transition-all duration-200
          "
        >
          <FaChevronLeft
            className="
              text-[20px] sm:text-[24px] 
              text-black/75 
              group-hover:text-black 
              transition-colors
            "
          />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="
            babu-next
            group absolute cursor-pointer right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 sm:h-11 sm:w-11
            rounded-full
            bg-white/80 backdrop-blur-md
            border border-black/10
            shadow-md
            flex items-center justify-center
            hover:bg-white
            active:scale-95
            transition-all duration-200
          "
        >
          <FaChevronRight
            className="
              text-[20px] sm:text-[24px] 
              text-black/75 
              group-hover:text-black 
              transition-colors
            "
          />
        </button>

        {/* Optional inner border glow */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-[22px] ring-1 ring-white/20" />
      </div>
    </div>
  );
};

export default Slider;
