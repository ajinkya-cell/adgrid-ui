import type { CSSProperties } from "react";

// `wide`: a long strip (e.g. a 5-frame storyboard), shown across the whole collage instead of in a column.
export type PaperImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  wide?: boolean;
};

// Each tile's tilt (deg) and drop from the tile above (px), cycled through in order. Fixed rather
// than random so the layout looks the same on every load and the server and client agree.
export const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 0.5];
const DROPS = [0, 14, 6, 20, 10, 2];

// The slow, soft ease every paper motion uses: quick start, long gentle settle.
export const EASE_SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// White paper mount; on hover it straightens and lifts. Tilt comes from --tilt (halved on phones).
export const MOUNT = `relative bg-white p-2 shadow-[0_10px_30px_-12px_rgba(23,23,23,0.35)] ring-1 ring-black/5 transition duration-500 ${EASE_SOFT} rotate-[calc(var(--tilt)*0.5)] sm:p-3 sm:rotate-(--tilt) hover:z-10 hover:rotate-0 hover:scale-103 hover:shadow-[0_20px_40px_-14px_rgba(23,23,23,0.45)] motion-reduce:transition-none motion-reduce:hover:scale-100`;

export interface PaperTileProps {
  image: PaperImage;
  index: number;
  sizes: string;
  /** Scales both the tilt and the drop. 0 is a clean, straight tile. */
  messiness?: number;
  loading?: "eager" | "lazy";
}

// An image at its own shape (nothing cropped), mounted on white paper and set at a slight angle.
export default function PaperTile({ image, index, sizes, messiness = 1, loading = "lazy" }: PaperTileProps) {
  // Wide strips sit nearly level; a big tilt on a long tile swings its ends far out.
  const tilt = TILTS[index % TILTS.length] * (image.wide ? 0.3 : 1) * messiness;
  const style = {
    "--tilt": `${tilt}deg`,
    paddingTop: image.wide ? 0 : DROPS[index % DROPS.length] * messiness,
  } as CSSProperties;

  return (
    <div style={style}>
      <div className={MOUNT}>
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          loading={loading}
          draggable={false}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

export { PaperTile };
