import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const fetchSingleBanner = async () => {
  const { data } = await api.get("/api/single-banner");
  return data;
};

const SingleBanner = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["single-banner"],
    queryFn: fetchSingleBanner,
    staleTime: 1000 * 60 * 5,
  });

  const view = useMemo(() => {
    const bannerUrl = data?.bannerUrl
      ? `${api.defaults.baseURL}${data.bannerUrl}`
      : "";
    const clickLink = (data?.clickLink || "").trim();
    const openInNewTab = data?.openInNewTab ?? false;
    const isActive = data?.isActive ?? true;

    return { bannerUrl, clickLink, openInNewTab, isActive };
  }, [data]);

  const openLinkProps = useMemo(() => {
    if (!view.clickLink) return null;
    const isExternal = /^https?:\/\//i.test(view.clickLink);

    if (isExternal) {
      return {
        href: view.clickLink,
        target: view.openInNewTab ? "_blank" : undefined,
        rel: view.openInNewTab ? "noopener noreferrer" : undefined,
      };
    }

    // internal route
    const href = view.clickLink.startsWith("/")
      ? view.clickLink
      : `/${view.clickLink}`;
    return {
      href,
      target: view.openInNewTab ? "_blank" : undefined,
      rel: view.openInNewTab ? "noopener noreferrer" : undefined,
    };
  }, [view.clickLink, view.openInNewTab]);

  // loading skeleton
  if (isLoading || isFetching) {
    return (
      <section className="w-full px-2 lg:px-0 mt-4">
        <div className="w-full mx-auto max-w-[1500px]">
          <div className="overflow-hidden border border-black/10 bg-white/40 backdrop-blur-md rounded-none">
            <div className="h-32 md:h-52">
              <Skeleton height={"100%"} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (view.isActive === false) return null;
  if (!view.bannerUrl) return null;

  const BannerContent = (
    <div className="overflow-hidden border border-black/10 bg-white">
      <img
        src={view.bannerUrl}
        alt="Banner"
        className="w-full h-32 object-cover md:h-52 md:object-center"
        loading="lazy"
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );

  return (
    <section className="w-full px-2 lg:px-0 mt-4">
      <div className="w-full mx-auto max-w-[1500px]">
        {openLinkProps ? (
          <a {...openLinkProps} className="block" aria-label="Open banner link">
            {BannerContent}
          </a>
        ) : (
          BannerContent
        )}
      </div>
    </section>
  );
};

export default SingleBanner;
