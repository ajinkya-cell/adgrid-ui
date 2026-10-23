import { notFound } from "next/navigation";
import { registry } from "@/registry";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { FitToFrame } from "@/components/site/FitToFrame";

export default async function EmbedComponentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ mode?: string; hideIntro?: string; [key: string]: string | undefined }>;
}) {
  const { slug } = await params;
  const search = (searchParams ? await searchParams : {}) as Record<string, string | undefined>;
  const isGallery = search?.mode === "gallery";
  const hideIntro = isGallery || search?.hideIntro === "true";

  const entry = registry.find((c) => c.slug === slug);
  if (!entry) notFound();

  const isBackground =
    entry.category === "backgrounds" ||
    slug.includes("flickering-grid") ||
    slug.includes("dot-pattern") ||
    slug === "matrix-rain";

  // Present-mode scales; gallery mode measures and fits instead (FitToFrame).
  const getScaleClass = (s: string, category?: string) => {
    if (s === "image-parallax") return "scale-[0.15]";
    if (s === "living-text") return "scale-[0.30]";
    if (s === "coverflow-carousel") return "scale-[0.35]";
    if (s === "anisotropic-knob") return "scale-[0.65]";
    if (s === "dot-matrix") return "scale-[0.40]";
    if (s === "laser-vault-password") return "scale-[0.40]";
    if (s === "text-shuffle") return "scale-[0.55]";
    if (s === "hero") return "scale-[0.35]";
    if (s === "premium-hero") return "scale-[0.22]";
    if (s === "weapon-wheel") return "scale-[0.35]";
    if (s === "wheel-picker") return "scale-[0.55]";
    if (s === "now-playing-card") return "scale-[0.45]";
    if (s === "dashed-marquee" || s === "marquee") return "scale-[0.40]";
    if (s === "datepicker") return "scale-[0.50]";
    if (s === "animated-icons-1") return "scale-[0.55]";
    if (s === "cards") return "scale-[0.38]";
    if (s === "simple-card") return "scale-[0.65]";
    if (s === "sticker-card") return "scale-[0.55]";
    if (s.includes("flickering-grid") || s.includes("dot-pattern") || s === "matrix-rain") return "scale-100 w-full h-full";
    if (category === "buttons" || s.includes("button")) return "scale-[0.70]";
    return "scale-[0.5] sm:scale-[0.55]";
  };

  const scaleClass = getScaleClass(slug, entry.category);
  const liveProps =
    slug === "dot-matrix"
      ? {
          animation: (search?.animation as any) || "ripple",
          rows: Number(search?.rows) || 20,
          columns: Number(search?.cols || search?.columns) || 20,
          glow: search?.glow !== "false",
          color: (search?.color as string) || "#e7e5df",
        }
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
      <div className="w-screen h-screen bg-[#1c1c1c] text-white overflow-hidden relative select-none flex items-center justify-center">
        <FitToFrame padding={0}>
          <div className="w-[860px] h-[480px] flex items-center justify-center overflow-hidden pointer-events-none select-none">
            <PresentationRenderer entry={entry} liveProps={liveProps} hideIntro={hideIntro} mode="gallery" />
          </div>
        </FitToFrame>
      </div>
    );
  }

  // Gallery mode matches the PreviewCard well colour (#1c1c1c) so the iframe blends in.
  return (
    <div className={`w-screen h-screen ${isGallery ? "bg-[#1c1c1c]" : "bg-[#070707]"} text-white overflow-hidden relative select-none flex items-center justify-center`}>
      {isGallery ? (
        <div className="w-full h-full pointer-events-none select-none">
          <FitToFrame>
            <PresentationRenderer entry={entry} liveProps={liveProps} hideIntro={hideIntro} mode="gallery" />
          </FitToFrame>
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
