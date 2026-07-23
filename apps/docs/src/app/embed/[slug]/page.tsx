import { notFound } from "next/navigation";
import { registry } from "@/registry";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";

export default async function EmbedComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = registry.find((c) => c.slug === slug);
  if (!entry) notFound();

  const getScaleClass = (s: string, category?: string) => {
    if (s === "image-parallax") return "scale-[0.15]";
    if (s === "living-text") return "scale-[0.30]";
    if (s === "animated-beam") return "scale-[0.42]";
    if (s === "coverflow-carousel") return "scale-[0.35]";
    if (s === "metallic-form" || s === "pookie-form") return "scale-[0.25]";
    if (s === "anisotropic-knob") return "scale-[0.65]";
    if (s === "dot-matrix") return "scale-[0.40]";
    if (s === "mechanical-timer" || s === "laser-vault-password") return "scale-[0.40]";
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
    slug === "animated-beam"
      ? { variant: "monochrome", pathWidth: 3.5, pathOpacity: 0.9 }
      : slug === "dot-matrix"
      ? { animation: "rain", color: "#10b981", columns: 22 }
      : slug === "hero"
      ? { name: "ajinkya", iconVariant: "flower", iconPosition: "inline", introduction: "", hideFooter: true, hideNav: true }
      : slug === "premium-hero"
      ? { introduction: "", hideFooter: true, hideNav: true }
      : slug === "weapon-wheel"
      ? { variant: "wheel-4", hideText: true }
      : {};

  return (
    <div className="w-screen h-screen bg-[#070707] text-white overflow-hidden relative select-none flex items-center justify-center">
      {/* Per-component custom scaling & positioning */}
      <div className={`w-[1280px] h-[720px] shrink-0 transform ${scaleClass} origin-center flex items-center justify-center overflow-hidden pointer-events-none select-none`}>
        <PresentationRenderer entry={entry} liveProps={liveProps} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return registry.map((c) => ({
    slug: c.slug,
  }));
}
