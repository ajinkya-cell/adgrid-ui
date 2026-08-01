"use client";

import { CurtainField } from "@/components/site/CurtainField";

export default function HomePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center select-none">
      {/* Dynamic Top-Right & Bottom-Left Curtain Field */}
      <CurtainField />

      {/* Ultra-Minimal Centered Logotype in Plus Jakarta Sans */}
      <div className="relative z-20 flex items-center justify-center">
        <h1
          className="font-plus-jakarta text-[clamp(4.5rem,15vw,11rem)] font-extrabold tracking-tighter text-white transition-all duration-700 hover:scale-[1.02] cursor-default"
          style={{ fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif' }}
        >
          VoidUI<span className="text-[#a78bfa] drop-shadow-[0_0_35px_rgba(167,139,250,0.7)]">.</span>
        </h1>
      </div>
    </main>
  );
}
