"use client";

import { useEffect } from "react";
import { Caveat } from "next/font/google";
import { PremiumHero } from "@adgrid-ui/ui";
import { FeatureCard, StatItem, FooterLight } from "./LandingComponents";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const features = [
  {
    id: "ai-editing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "AI-Powered Editing",
    description: "Retention-first algorithms that analyze viral patterns and auto-generate hooks, cuts, and captions tailored to each platform."
  },
  {
    id: "multi-platform",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="2" width="8" height="8" rx="2" />
        <rect x="14" y="2" width="8" height="8" rx="2" />
        <rect x="2" y="14" width="8" height="8" rx="2" />
        <rect x="14" y="14" width="8" height="8" rx="2" />
      </svg>
    ),
    title: "One-Click Distribution",
    description: "Publish to TikTok, Reels, Shorts, and Twitter simultaneously. Platform-specific aspect ratios, hashtags, and timing handled automatically."
  },
  {
    id: "analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Growth Analytics",
    description: "Daily audience insights, retention curves, and revenue attribution. Know exactly which content drives followers and revenue."
  }
];

const stats = [
  { id: "creators", number: "12.5K", label: "Active Creators" },
  { id: "videos", number: "2.3M", label: "Videos Generated" },
  { id: "views", number: "847M", label: "Total Views" }
];

export default function LandingPage() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const hasDark = html.classList.contains("dark");
    
    html.classList.remove("dark");
    
    return () => {
      if (hasDark) {
        html.classList.add("dark");
      }
    };
  }, []);

  return (
    <main className={`${caveat.variable} w-full min-h-screen relative font-body`}>
      <style dangerouslySetInnerHTML={{ __html: `
        header { display: none !important; }
        body > div.pt-16 { padding-top: 0px !important; }
        html, body { background-color: #ffffff !important; color: #171717 !important; }
      `}} />

      {/* ─── 1. Premium Hero ─── */}
      <PremiumHero 
        title="What's your growth goal?"
        subtitle="Turn views into velocity"
        ctaText="Start Your Engine"
      />

      {/* ─── 2. Feature Grid ─── */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto bg-white border-t border-neutral-200">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </section>

      {/* ─── 3. Social Proof / Stats Bar ─── */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto bg-neutral-50 border-t border-neutral-200 border-b border-neutral-200">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <StatItem key={stat.id} {...stat} />
          ))}
        </div>
      </section>

      {/* ─── 4. Bottom CTA ─── */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto bg-white border-t border-neutral-200 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-handwritten text-3xl md:text-4xl font-normal text-neutral-900 mb-6 tracking-wide">
            Ready to grow on autopilot?
          </h2>
          <p className="font-body text-neutral-600 mb-8 text-lg leading-relaxed">
            Join 12,000+ creators who've automated their content engine. 
            First month free — no credit card required.
          </p>
          <div className="flex justify-center">
            <button className="flex items-center gap-4 bg-neutral-900 text-white hover:bg-black px-8 py-4 rounded-full font-body text-sm font-semibold tracking-tight shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)] transition-all duration-300 cursor-pointer select-none group outline-none focus-visible:ring-4 focus-visible:ring-neutral-400">
              <span>Start Your Engine</span>
              <div className="relative w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-white/20">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 5. Footer ─── */}
      <FooterLight />
    </main>
  );
}