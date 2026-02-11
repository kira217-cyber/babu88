import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const fetchBranding = async () => {
  const { data } = await api.get("/api/site-branding");
  return data;
};

const FavIconAndLogo = () => {
  const { isBangla } = useLanguage();

  const { data } = useQuery({
    queryKey: ["site-branding"],
    queryFn: fetchBranding,
    staleTime: 1000 * 60 * 10,
  });

  const view = useMemo(() => {
    const title = isBangla ? data?.titleBn : data?.titleEn;
    const faviconUrl = data?.faviconUrl ? `${api.defaults.baseURL}${data.faviconUrl}` : "";
    const logoUrl = data?.logoUrl ? `${api.defaults.baseURL}${data.logoUrl}` : "";
    const isActive = data?.isActive ?? true;

    return { title: title || "", faviconUrl, logoUrl, isActive };
  }, [data, isBangla]);

  // ✅ Set document title
  useEffect(() => {
    if (!view.isActive) return;
    if (!view.title) return;
    document.title = view.title;
  }, [view.isActive, view.title]);

  // ✅ Set favicon dynamically
  useEffect(() => {
    if (!view.isActive) return;
    if (!view.faviconUrl) return;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = view.faviconUrl;
  }, [view.isActive, view.faviconUrl]);

  // ✅ Optional: show logo somewhere (you said logo component)
  if (!view.isActive) return null;

  return (
    <div className="w-full flex items-center gap-3">
      {/* {view.logoUrl ? (
        <img
          src={view.logoUrl}
          alt="Site Logo"
          className="h-10 w-auto object-contain"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="h-10 px-3 rounded-lg bg-black/5 flex items-center text-black/60 font-bold">
          No Logo
        </div>
      )} */}
    </div>
  );
};

export default FavIconAndLogo;
