
import { ExpandItem } from "../../types";

interface CardContentProps {
  item: ExpandItem;
  imageParallaxStyle?: any; // Dynamics for pointer parallax shifts
  index: number;
  borderRadius?: number;
}

export function CardContent({ item }: CardContentProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-[inherit] select-none">
      {/* Inject DotGothic16 Google Font */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');` }} />

      {/* Background Anime Poster Image */}
      <div className="absolute inset-0 w-full h-full bg-neutral-950 overflow-hidden rounded-[inherit]">
        <img
          src={item.image}
          alt={item.title}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] contrast-110 rounded-[inherit]"
        />
        {/* Soft Dark Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/30 rounded-[inherit]" />
      </div>

      {/* Render ONLY the Year Number in bottom-left in DotGothic16 Font */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-7 md:p-8 text-left z-10"
        style={{ fontFamily: "'DotGothic16', sans-serif" }}
      >
        <div
          className="text-2xl md:text-3xl font-normal tracking-widest text-white drop-shadow-md"
          style={{ fontFamily: "'DotGothic16', sans-serif" }}
        >
          {item.year || item.title}
        </div>
      </div>
    </div>
  );
}
