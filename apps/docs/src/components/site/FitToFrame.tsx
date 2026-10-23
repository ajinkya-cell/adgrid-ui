"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Lays the component out at its natural size (as wide as the frame allows, wider only if it must be),
// then scales it down to fit the frame with some breathing room. Used by gallery-mode embeds, where the
// frame is a card well, so every preview fits whatever card size the bento gives it.
export function FitToFrame({
  children,
  padding = 16,
  maxScale = 1,
}: {
  children: React.ReactNode;
  padding?: number;
  maxScale?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const fit = () => {
      const roomWidth = Math.max(frame.clientWidth - padding * 2, 1);
      const roomHeight = Math.max(frame.clientHeight - padding * 2, 1);
      // At least the frame's width, so fluid components (charts, w-full) don't collapse to nothing.
      content.style.minWidth = `${roomWidth}px`;
      // offset/scroll sizes ignore the transform, so this is the unscaled footprint.
      const width = Math.max(content.offsetWidth, content.scrollWidth);
      const height = Math.max(content.offsetHeight, content.scrollHeight);
      if (!width || !height) return;
      setScale(Math.min(maxScale, roomWidth / width, roomHeight / height));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    observer.observe(content);
    return () => observer.disconnect();
  }, [padding, maxScale]);

  return (
    <div ref={frameRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={contentRef}
        className="flex w-fit shrink-0 origin-center flex-col items-center justify-center"
        style={{ transform: `scale(${scale ?? 1})`, opacity: scale === null ? 0 : 1 }}
      >
        {children}
      </div>
    </div>
  );
}
