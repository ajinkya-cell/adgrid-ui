import type { CSSProperties } from "react";
import { MOUNT, TILTS } from "./PaperTile";

export type MarqueePhoto = { src: string; width: number; height: number; alt: string };

// Angle of the strip of tape holding each page down.
const TAPE_TILTS = [-4, 3, -2, 5, -5, 2];

// Layered over the tape colour: a soft sheen down the strip and faint fibres across it.
const TAPE_TEXTURE = [
  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.07) 100%)",
  "repeating-linear-gradient(90deg, rgba(120,100,70,0.06) 0 1px, transparent 1px 3px)",
].join(", ");

// Slides a track holding its content twice by one copy's width, so the loop has no seam. Kept here
// (not in global CSS) so the component works on its own; pausing and reduced motion live here too,
// so nothing inline can override them.
const STYLES = `
@keyframes vui-taped-marquee { to { transform: translateX(-50%); } }
.vui-taped-marquee__track { animation: vui-taped-marquee var(--marquee-duration, 60s) linear infinite; }
.vui-taped-marquee[data-pause="true"]:hover .vui-taped-marquee__track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .vui-taped-marquee { overflow-x: auto !important; }
  .vui-taped-marquee__track { animation: none; }
  .vui-taped-marquee__copy { display: none; }
}
`;

// Both ends fade to whatever is behind the row.
const FADE = "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)";

export interface TapedMarqueeProps {
  photos: MarqueePhoto[];
  /** Time for one full loop. More (or wider) photos need more seconds to keep the same pace. */
  seconds?: number;
  /** Drift left to right instead. */
  reverse?: boolean;
  /** Shifts the tilt pattern, so two rows stacked together don't tilt in step. */
  tiltOffset?: number;
  /** Page height in px from the `sm` breakpoint up; phones get 80% of it. */
  height?: number;
  /** Hovering the row freezes it where it is. */
  pauseOnHover?: boolean;
  /** Colour of the masking tape. It is near-opaque, so it reads on dark backgrounds too. */
  tapeColor?: string;
  className?: string;
}

// A row of taped-down pages sliding past. The pages are listed twice and the track moves by one
// copy's width, so the loop never shows a seam. Hovering the row pauses it. With reduced motion the
// row stands still and scrolls sideways by hand instead.
export function TapedMarquee({
  photos,
  seconds = 60,
  reverse = false,
  tiltOffset = 0,
  height = 240,
  pauseOnHover = true,
  tapeColor = "#ebe4d2",
  className,
}: TapedMarqueeProps) {
  const style = {
    "--marquee-duration": `${seconds}s`,
    "--page-h": `${height}px`,
    animationDirection: reverse ? "reverse" : undefined,
  } as CSSProperties;

  return (
    <div
      className={`vui-taped-marquee overflow-hidden ${className ?? ""}`}
      data-pause={pauseOnHover}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <style>{STYLES}</style>
      <ul style={style} className="vui-taped-marquee__track m-0 flex w-max list-none items-start p-0 py-10">
        {[false, true].map((copy) =>
          photos.map((photo, i) => (
            <li
              key={`${copy}-${photo.src}`}
              aria-hidden={copy || undefined}
              className={`shrink-0 px-4 sm:px-6 ${copy ? "vui-taped-marquee__copy" : ""}`}
            >
              <Page photo={photo} index={i + tiltOffset} decorative={copy} height={height} tapeColor={tapeColor} />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

function Page({
  photo,
  index,
  decorative,
  height,
  tapeColor,
}: {
  photo: MarqueePhoto;
  index: number;
  decorative: boolean;
  height: number;
  tapeColor: string;
}) {
  const style = {
    "--tilt": `${TILTS[index % TILTS.length]}deg`,
    // Every other page sits a little lower, like pages pinned along a line.
    marginTop: index % 2 ? 18 : 0,
  } as CSSProperties;
  // Pages are a fixed height, so their width follows their shape.
  const ratio = photo.width / photo.height;
  const sizes = `(min-width: 640px) ${Math.round(height * ratio)}px, ${Math.round(height * 0.8 * ratio)}px`;

  return (
    <div style={style} className={MOUNT}>
      {/* Masking tape: the drop shadow on the outer span follows the torn edge cut by the inner
          one's clip-path, which outlines the strip against the white mount. The tape is near-opaque
          (a see-through white strip turns muddy grey where it hangs over a dark background), with a
          sheen and fine paper fibre so it still reads as tape rather than a flat label. */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
        style={{ rotate: `${TAPE_TILTS[index % TAPE_TILTS.length]}deg` }}
      >
        <span
          className="block h-6 w-20 opacity-95 [clip-path:polygon(3%_0,97%_4%,100%_30%,96%_55%,100%_80%,97%_100%,2%_96%,0_70%,4%_45%,0_20%)] sm:w-24"
          style={{ background: `${TAPE_TEXTURE}, ${tapeColor}` }}
        />
      </span>
      <img
        src={photo.src}
        alt={decorative ? "" : photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        // Pages slide in from off-screen, where lazy loading would leave them blank for a moment.
        loading="eager"
        draggable={false}
        className="block h-[calc(var(--page-h)*0.8)] w-auto max-w-none sm:h-(--page-h)"
      />
    </div>
  );
}

export default TapedMarquee;
