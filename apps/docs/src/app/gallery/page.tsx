"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  BellRing,
  ChartColumn,
  Compass,
  Ellipsis,
  Film,
  GalleryVerticalEnd,
  Layers,
  MousePointerClick,
  PanelsTopLeft,
  Sparkles,
  TextCursorInput,
  Type,
  type LucideIcon,
} from "lucide-react";
import { PreviewCard } from "@ui/primitives/PreviewCard";
import type { RegistryEntry } from "@/registry";
import { GalleryIframePreview } from "@/components/site/GalleryIframePreview";
import { presentationEntries } from "@/components/presentation/presentation-registry";
import { SHOWCASE_COUNT, SHOWCASE_SECTIONS, type ShowcaseSize } from "./showcase";

const SECTION_ICONS: Record<string, LucideIcon> = {
  inputs: TextCursorInput,
  buttons: MousePointerClick,
  feedback: BellRing,
  navigation: Compass,
  ai: Sparkles,
  data: ChartColumn,
  cards: GalleryVerticalEnd,
  text: Type,
  media: Film,
  backgrounds: Layers,
  pages: PanelsTopLeft,
  more: Ellipsis,
};

// Spans kick in from `sm`; on phones every card is one column wide and tall/lg keep their two rows.
const SIZE_SPANS: Record<ShowcaseSize, string> = {
  sm: "",
  wide: "sm:col-span-2",
  tall: "row-span-2",
  lg: "sm:col-span-2 row-span-2",
};

const STATIC_PREVIEWS: Record<string, string> = {
  "laser-vault-password": "/previews/vault.png",
  "datepicker": "/previews/date-picker.png",
};

// ── Card ──────────────────────────────────────────────────────────
function GalleryCard({ item, size, index }: { item: RegistryEntry; size: ShowcaseSize; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const staticPreview = STATIC_PREVIEWS[item.slug];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: (index % 3) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className={`h-full ${SIZE_SPANS[size]}`}
    >
      {/* Static images sit padded in the well; iframes fill it, since /embed?mode=gallery centres and scales itself */}
      <PreviewCard
        as={Link}
        href={`/present/${item.category}/${item.slug}`}
        title={item.name}
        padded={Boolean(staticPreview)}
        className="font-poppins"
      >
        {staticPreview ? (
          <img
            src={staticPreview}
            alt={item.name}
            className="w-full h-full object-contain select-none transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <GalleryIframePreview slug={item.slug} title={item.name} mode="gallery" />
        )}
      </PreviewCard>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-poppins">
      <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
        {/* ── Hero header ── */}
        <header className="pt-28 sm:pt-32 pb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Components
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            A curated selection of {SHOWCASE_COUNT} components. Open any card to play with it, or browse all{" "}
            <Link
              href="/present/buttons/void-button"
              className="text-white/80 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              {presentationEntries.length} in the navigator
            </Link>
            .
          </p>
        </header>

        {/* ── Sections ── */}
        <div className="space-y-16 pb-16">
          {SHOWCASE_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.id] ?? Ellipsis;
            return (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3 border-b border-white/[0.06] pb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] border-t-white/[0.12] bg-[#161616] text-white/70">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 id={`${section.id}-heading`} className="text-lg font-semibold tracking-tight text-white">
                    {section.label}
                  </h2>
                  <span className="font-mono text-xs text-white/30">{section.items.length}</span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[260px] grid-flow-dense">
                  {section.items.map(({ entry, size }, i) => (
                    <GalleryCard key={entry.slug} item={entry} size={size} index={i} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
