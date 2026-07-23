"use client";

import { useState, useRef } from "react";
import { useInView } from "framer-motion";

export function GalleryIframePreview({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px 0px" });
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[170px] bg-[#070707] flex items-center justify-center overflow-hidden"
    >
      {/* Loading Skeleton Pulse */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-white/[0.07] to-white/[0.03] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-white/10 border-t-white/40 animate-spin opacity-40" />
        </div>
      )}

      {/* Lazy Loaded Iframe */}
      {isInView && (
        <iframe
          src={`/embed/${slug}`}
          title={`Live preview of ${title}`}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full min-h-[170px] border-0 pointer-events-none transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}
