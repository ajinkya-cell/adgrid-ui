import { notFound } from "next/navigation";
import { registry } from "@/registry";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";

export default async function EmbedComponentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ mode?: string; hideIntro?: string }>;
}) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : {};
  const isGallery = search?.mode === "gallery";
  const hideIntro = isGallery || search?.hideIntro === "true";

  const entry = registry.find((c) => c.slug === slug);
  if (!entry) notFound();

  const isBackground =
    entry.category === "backgrounds" ||
    slug.includes("flickering-grid") ||
    slug.includes("dot-pattern") ||
    slug === "matrix-rain";

  const getScaleClass = (s: string, category?: string) => {
    if (isGallery) {
      if (isBackground) return "w-full h-full scale-100";
      if (category === "buttons" || s.includes("button")) return "scale-100";
      if (s === "living-text") return "scale-[0.85] sm:scale-100";
      if (s === "spotlight-text") return "scale-[0.9] sm:scale-100";
      if (s === "text-shuffle") return "scale-[0.9] sm:scale-100";
      if (s === "anisotropic-knob") return "scale-[0.95] sm:scale-100";
      if (s === "coverflow-carousel") return "scale-[0.60] sm:scale-[0.75]";
      if (s === "image-parallax") return "scale-[0.55] sm:scale-[0.65]";
      if (s === "cards-two") return "scale-[0.65] sm:scale-[0.80]";
      if (s === "cards" || s === "simple-card" || s === "sticker-card") return "scale-[0.65] sm:scale-[0.75]";
      if (s === "laser-vault-password") return "scale-[0.65] sm:scale-[0.75]";
      if (s === "morphing-nav") return "scale-[0.75] sm:scale-[0.85]";
      if (s === "now-playing-card") return "scale-[0.85] sm:scale-100";
      if (s === "github-heatmap") return "scale-[0.80] sm:scale-[0.92] lg:scale-100";
      if (s === "breathing-scale-card") return "scale-[0.85] sm:scale-100";
      if (s === "meter") return "scale-[0.85] sm:scale-100";
      if (s === "dashed-marquee") return "scale-[0.85] sm:scale-100";
      if (s === "wheel-picker" || s === "weapon-wheel") return "scale-[0.65] sm:scale-[0.75]";
      if (s === "hero" || s === "premium-hero") return "scale-[0.35] sm:scale-[0.42]";
      if (s === "infinite-scroll") return "scale-[0.45] sm:scale-[0.55]";
      return "scale-[0.75] sm:scale-[0.85]";
    }

    if (s === "image-parallax") return "scale-[0.15]";
    if (s === "living-text") return "scale-[0.30]";
    if (s === "coverflow-carousel") return "scale-[0.35]";
    if (s === "anisotropic-knob") return "scale-[0.65]";
    if (s === "dot-matrix") return "scale-[0.40]";
    if (s === "laser-vault-password") return "scale-[0.40]";
    if (s === "morphing-nav") return "scale-[0.42]";
    if (s === "text-shuffle") return "scale-[0.55]";
    if (s === "hero") return "scale-[0.35]";
    if (s === "premium-hero") return "scale-[0.22]";
    if (s === "weapon-wheel") return "scale-[0.35]";
    if (s === "wheel-picker") return "scale-[0.55]";
    if (s === "now-playing-card") return "scale-[0.45]";
    if (s === "dashed-feature-card") return "scale-[0.55]";
    if (s === "dashed-marquee") return "scale-[0.40]";
    if (s === "datepicker") return "scale-[0.50]";
    if (s === "animated-icons-1") return "scale-[0.55]";
    if (s === "cards") return "scale-[0.38]";
    if (s === "simple-card") return "scale-[0.65]";
    if (s === "sticker-card") return "scale-[0.55]";
    if (s === "bevel-alert-dialog") return "scale-[0.60]";
    if (s.includes("flickering-grid") || s.includes("dot-pattern") || s === "matrix-rain") return "scale-100 w-full h-full";
    if (category === "buttons" || s.includes("button")) return "scale-[0.70]";
    return "scale-[0.5] sm:scale-[0.55]";
  };

  const scaleClass = getScaleClass(slug, entry.category);
  const liveProps =
    slug === "dot-matrix"
      ? { animation: "rain", color: "#10b981", columns: 22 }
      : slug === "hero"
      ? { name: "ajinkya", iconVariant: "flower", iconPosition: "inline", introduction: "", hideFooter: true, hideNav: true }
      : slug === "premium-hero"
      ? { introduction: "", hideFooter: true, hideNav: true }
      : slug === "weapon-wheel"
      ? { variant: "wheel-4", hideText: true }
      : {};

  if (isBackground) {
    return (
      <div className="w-screen h-screen bg-[#070707] text-white overflow-hidden relative select-none">
        <PresentationRenderer entry={entry} liveProps={liveProps} hideIntro={hideIntro} mode={isGallery ? "gallery" : "present"} />
      </div>
    );
  }

  if (isGallery && slug === "coverflow-carousel") {
    return (
      <div className="w-screen h-screen bg-[#070707] text-white overflow-hidden relative select-none flex items-center justify-center">
        <div className="w-[860px] h-[480px] shrink-0 transform scale-[0.78] sm:scale-[0.88] lg:scale-[0.92] origin-center flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <PresentationRenderer entry={entry} liveProps={liveProps} hideIntro={hideIntro} mode="gallery" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#070707] text-white overflow-hidden relative select-none flex items-center justify-center">
      {isGallery ? (
        <div className={`w-full h-full flex items-center justify-center shrink-0 transform ${scaleClass} origin-center overflow-hidden pointer-events-none select-none`}>
          <PresentationRenderer entry={entry} liveProps={liveProps} hideIntro={hideIntro} mode="gallery" />
        </div>
      ) : (
        <div className={`w-[1280px] h-[720px] shrink-0 transform ${scaleClass} origin-center flex items-center justify-center overflow-hidden pointer-events-none select-none`}>
          <PresentationRenderer entry={entry} liveProps={liveProps} hideIntro={hideIntro} mode="present" />
        </div>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return registry.map((c) => ({
    slug: c.slug,
  }));
}
