"use client";

import { useEffect, useState } from "react";

export function FPSMonitor() {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let raf = 0;

    function tick(now: number) {
      frame += 1;
      if (now - last >= 1000) {
        setFps(frame);
        frame = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 backdrop-blur-md">
      {fps} FPS
    </div>
  );
}

