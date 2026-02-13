import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FloatingSocial = () => {
  const { data: icons = [], isLoading } = useQuery({
    queryKey: ["aff-floating-social"],
    queryFn: async () => {
      const res = await api.get("/api/aff-floating-social");
      return res.data; // array of { _id, imageUrl, linkUrl }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  return (
    <div className="fixed right-4 md:right-18 bottom-22 md:bottom-22 z-[999] flex flex-col gap-3">
      {isLoading ? (
        // Skeleton during loading (same size & position as real icons)
        <>
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-lg"
            >
              <Skeleton
                circle
                width="100%"
                height="100%"
                baseColor="#2a2a2a"
                highlightColor="#3a3a3a"
              />
            </div>
          ))}
        </>
      ) : icons.length === 0 ? // No icons → nothing shown
      null : (
        // Real icons
        icons.map((item) => (
          <a
            key={item._id}
            href={item.linkUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Floating Social Link"
            className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <img
              src={item.imageUrl}
              alt="floating social"
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full"
            />
            <span className="sr-only">Social Link</span>
          </a>
        ))
      )}
    </div>
  );
};

export default FloatingSocial;
