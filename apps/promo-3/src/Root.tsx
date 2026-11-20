import { Composition } from "remotion";
import { Film } from "./Film";
import { DURATION, FPS } from "./timeline";

export const Root: React.FC = () => (
  <>
    <Composition id="VoidPromo3" component={Film} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
  </>
);
