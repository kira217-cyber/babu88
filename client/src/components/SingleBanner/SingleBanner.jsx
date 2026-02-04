import React from "react";

const SingleBanner = () => {
  // 🔁 এখানে তোমার আসল banner image URL বসাও
  const BANNER_IMG =
    "https://i.ibb.co/5c0d7c21-fedc-4662-90f2-6d7da4d910f3/banner.png"; // replace

  // ✅ Optional: banner click link (না চাইলে null রাখো)
  const CLICK_LINK = null; // e.g. "/register" or "https://example.com"

  const Wrapper = ({ children }) => {
    if (!CLICK_LINK) return children;
    return (
      <a href={CLICK_LINK} className="block" aria-label="Open banner link">
        {children}
      </a>
    );
  };

  return (
    <section className="w-full px-2 lg:px-0 mt-4">
      <div className="w-full mx-auto max-w-[1500px]">
        <Wrapper>
          <div className="overflow-hidden border border-black/10 bg-white">
            {/* Responsive image */}
            <img
              src={BANNER_IMG}
              alt="Banner"
              className="w-full h-52 object-center"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </Wrapper>
      </div>
    </section>
  );
};

export default SingleBanner;
