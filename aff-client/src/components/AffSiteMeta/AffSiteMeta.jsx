import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";


const AffSiteMeta = ({ showLogo = false, className = "" }) => {
  const { isBangla } = useLanguage();

  const { data } = useQuery({
    queryKey: ["aff-site-meta"],
    queryFn: async () => {
      const res = await api.get("/api/aff-site-meta");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const meta = useMemo(() => {
    const fallback = {
      title: isBangla ? "BABU88" : "BABU88",
      faviconUrl: "",
      logoUrl: "",
    };

    if (!data?._id) return fallback;

    return {
      title: isBangla
        ? data.titleBn || fallback.title
        : data.titleEn || fallback.title,
      faviconUrl: data.faviconUrl || "",
      logoUrl: data.logoUrl || "",
    };
  }, [data, isBangla]);

  useEffect(() => {
    // ✅ Title set
    if (meta.title) document.title = meta.title;

    // ✅ Favicon set
    if (meta.faviconUrl) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "icon");
        document.head.appendChild(link);
      }
      link.setAttribute("href", meta.faviconUrl);
    }
  }, [meta.title, meta.faviconUrl]);
};

export default AffSiteMeta;
