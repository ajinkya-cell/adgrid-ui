"use client";

import { useState, useRef } from "react";
import { useInView } from "framer-motion";

export function GalleryIframePreview({
  slug,
  title,
  mode = "gallery",
  className = "",
}: {
  slug: string;
  title: string;
  mode?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Not `once`: the gallery holds ~100 previews, so frames far off screen unmount to free memory and WebGL contexts.
  const isInView = useInView(containerRef, { margin: "150px 0px" });
  const [loaded, setLoaded] = useState(false);
  if (!isInView && loaded) setLoaded(false);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
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
          src={`/embed/${slug}${mode ? `?mode=${mode}` : ""}`}
          title={`Live preview of ${title}`}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full border-0 pointer-events-none transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}
