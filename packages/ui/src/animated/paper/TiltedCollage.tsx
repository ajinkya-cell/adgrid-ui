import PaperTile, { type PaperImage } from "./PaperTile";

const COLUMN_SIZES = "(min-width: 1152px) 340px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw";
const WIDE_SIZES = "(min-width: 1152px) 1000px, 90vw";

// Full class strings, so Tailwind can see every option.
const COLUMNS = {
  2: "columns-1 sm:columns-2",
  3: "columns-1 sm:columns-2 lg:columns-3",
  4: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
} as const;

export interface TiltedCollageProps {
  images: PaperImage[];
  /** Most columns the wall breaks into on wide screens. */
  columns?: 2 | 3 | 4;
  /** Scales every tile's tilt and drop. 0 is a clean, straight masonry. */
  messiness?: number;
  className?: string;
}

// Columns of tiles at their own shape (nothing cropped), each mounted on white paper and set at a
// slight angle. A wide image breaks the columns and runs across the whole collage.
export function TiltedCollage({ images, columns = 3, messiness = 1, className }: TiltedCollageProps) {
  // Split the list into runs: each wide image on its own, and the images between them together.
  const runs: PaperImage[][] = [];
  for (const image of images) {
    const last = runs.at(-1);
    if (image.wide || !last || last[0].wide) runs.push([image]);
    else last.push(image);
  }

  return (
    <div className={`flex flex-col gap-10 sm:gap-14 ${className ?? ""}`}>
      {runs.map((run) =>
        run[0].wide ? (
          <div key={run[0].src} className="mx-auto w-full max-w-5xl px-2">
            <PaperTile image={run[0]} index={images.indexOf(run[0])} sizes={WIDE_SIZES} messiness={messiness} />
          </div>
        ) : (
          <ul key={run[0].src} className={`${COLUMNS[columns] ?? COLUMNS[3]} gap-8 px-2 sm:gap-10`}>
            {run.map((image) => (
              <li key={image.src} className="mb-8 break-inside-avoid sm:mb-10">
                <PaperTile image={image} index={images.indexOf(image)} sizes={COLUMN_SIZES} messiness={messiness} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export default TiltedCollage;
