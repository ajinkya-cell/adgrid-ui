"use client";

import { DjController, sampleDeckTracks, type DjControllerProps } from "./DjController";

export type DjControllerDemoProps = Omit<DjControllerProps, "decks">;

/** Two sample tracks loaded, deck 1 playing. */
export function DjControllerDemo(props: DjControllerDemoProps) {
  return (
    <div className="w-full max-w-[1100px]">
      <DjController decks={sampleDeckTracks} {...props} />
    </div>
  );
}
