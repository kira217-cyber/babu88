import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const fetchFloatingSocial = async () => {
  const { data } = await api.get("/api/floating-social");
  return data;
};

const FloatingSocial = () => {
  const { data } = useQuery({
    queryKey: ["floating-social"],
    queryFn: fetchFloatingSocial,
    staleTime: 1000 * 60 * 10,
  });

  const items = useMemo(() => {
    const list = (data?.items || [])
      .filter((x) => x?.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((x) => ({
        ...x,
        iconFull: x.iconUrl ? `${api.defaults.baseURL}${x.iconUrl}` : "",
      }));

    return list;
  }, [data]);

  if (!items.length) return null;

  return (
    <div className="fixed right-4 md:right-18 bottom-22 md:bottom-22 z-[999] flex flex-col gap-3">
      {items.map((item, idx) => (
        <a
          key={`${item.url}-${idx}`}
          href={item.url || "#"}
          target="_blank"
          rel="noreferrer"
          aria-label="Social Link"
          className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
        >
          {item.iconFull ? (
            <img
              src={item.iconFull}
              alt="social"
              className="w-12 h-12 sm:w-12 sm:h-12 object-contain"
              draggable={false}
              loading="lazy"
            />
          ) : (
            <span className="text-white text-xs font-bold">IMG</span>
          )}
        </a>
      ))}
    </div>
  );
};

export default FloatingSocial;
