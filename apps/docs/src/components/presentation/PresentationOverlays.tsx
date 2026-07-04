"use client";

import { usePresentationSettings } from "./hooks/usePresentationSettings";

export function SafeAreaOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-6 z-40 border border-dashed border-white/18 md:inset-10">
      <div className="absolute -top-5 left-0 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Safe Area</div>
    </div>
  );
}

export function RulerOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 opacity-30">
      <div className="absolute left-0 top-0 h-6 w-full border-b border-white/12 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.4)_0_1px,transparent_1px_40px)]" />
      <div className="absolute left-0 top-0 h-full w-6 border-r border-white/12 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.4)_0_1px,transparent_1px_40px)]" />
    </div>
  );
}

export function GuideOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
    </div>
  );
}

export function PresentationOverlays() {
  const { settings } = usePresentationSettings();

  return (
    <>
      {settings.showSafeArea && <SafeAreaOverlay />}
      {settings.showRulers && <RulerOverlay />}
      {settings.showGuides && <GuideOverlay />}
    </>
  );
}

