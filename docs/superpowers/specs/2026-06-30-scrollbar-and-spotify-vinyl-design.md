# Design Spec: ScrollProgress and NowPlayingCard Components

This document outlines the design specification for implementing two new premium, dark-first components inside `@adgrid-ui/ui`:
1. `ScrollProgress` - A vertical dynamic scrollbar overlay with interactive tick mark animations and velocity-based stretching/glow.
2. `NowPlayingCard` - A Spotify-style vinyl player card powered by Last.fm API that dynamically retrieves real-time listening history.

---

## 1. ScrollProgress Component

### Component Structure (packages/ui/src/animated/scrollprogress/)
We will isolate the component and its assets into a folder structure matching `@adgrid-ui/ui` conventions:
- `ScrollProgress.tsx`: Main progress bar overlay component.
- `Tick.tsx`: Individual tick marks lining the scroll track that glow and scale as the scroll indicator passes them.
- `useScrollProgress.ts`: Custom hook managing scroll telemetry (progress, velocity/speed, and glow intensity).
- `types.ts`: Interface declarations for props.
- `utils.ts`: Internal utilities (e.g. `range`).

### Hook & Telemetry Architecture (`useScrollProgress.ts`)
The hook leverages `framer-motion`'s scroll tracking values:
1. `scrollYProgress`: The raw 0-to-1 scroll progress of the viewport.
2. `smoothProgress`: Created via `useSpring(scrollYProgress, { damping: 20, stiffness: 80 })` to filter raw scroll ticks.
3. `velocity`: Tracks speed of scrolling via `useVelocity(scrollYProgress)`.
4. `scaleX` (used as `scaleY` in vertical orientation): Maps the absolute velocity to a scale multiplier (stretches the indicator vertically on fast scrolls).
5. `glowIntensity`: Maps absolute velocity to a booster value added to the ambient glow.

### Props & API (`types.ts`)
```typescript
export interface ScrollProgressProps {
  ticks?: number;      // Number of tick lines (default: 42)
  color?: string;      // Glow and active color (default: "#a855f7")
  glow?: boolean;      // Enable ambient neon glow overlay (default: true)
  height?: number;     // Width/thickness of the pill (default: 44)
  width?: number;      // Height/length of the pill (default: 320)
  position?: "left" | "right" | "top" | "bottom"; // Layout position (default: "bottom" / fixed right)
}
```

---

## 2. NowPlayingCard (Spotify Vinyl Player) Component

### Component Structure
- Location: `packages/ui/src/animated/NowPlayingCard.tsx`
- Types definition (embedded or imported):
```typescript
export type Song = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  image: string;
  songUrl: string;
  playedAt: string | null;
};
```

### Visual & Interactive Highlights
- **Zero External Icon Dependencies**: Standardize on a self-contained Spotify SVG logo instead of requiring `react-icons`.
- **Vinyl Record Animation**: Spinning record body with radial grooves and metallic conic reflection sheen.
- **Hover Transition**: Record slides up out of the album cover sleeve when hovered and returns when unhovered. Spin animation continues infinitely.
- **Dark Elegance styling**: Glassmorphism highlights, custom blur backdrop using the album cover, and premium layout fonts using Geist Mono and Outfit.

---

## 3. Data Integration: Last.fm API Endpoint

To feed the `NowPlayingCard` with real-time listening data securely without exposing API keys on the client:
1. **Environment Variables**: Add `LASTFM_API_KEY` and `LASTFM_USERNAME` to `.env.local` inside `apps/docs`.
2. **API Proxy Route**: Implement a GET handler at `apps/docs/src/app/api/now-playing/route.ts` which:
   - Performs a fetch call to:
     `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&limit=1&format=json`
   - Normalizes the response to the `Song` type interface.
   - Specifically checks for `track[0]['@attr']?.nowplaying === 'true'` to set `isPlaying: true`.
   - Uses default placeholders if no listening data exists or the API fails.
   - Sets cache headers (`s-maxage=15`, stale-while-revalidate) to respect rate limits and keep it performant.

---

## 4. Documentation Registry & Showcase

- Export the new components from `packages/ui/src/index.ts`.
- Register the components in `apps/docs/src/registry/index.ts` so they can be parsed by the CLI build script and Sandpack previews.
- Create preview templates inside `apps/docs/src/app/components/[category]/[slug]/page.tsx` or configure live play-testing with standard props.

---

## Verification Plan

### Automated Build & Compilation
- Run `pnpm build` in the monorepo root to verify both `@adgrid-ui/ui` and `apps/docs` build cleanly without TypeScript or bundler errors.

### Manual Behavior Verification
1. **Scrollbar Overlay**:
   - Verify vertical drag on the scroll progress bar scrolls the page correctly.
   - Verify tick marks light up in a smooth wave as you scroll.
   - Verify indicator stretches and glows brighter on high-speed scroll.
2. **Vinyl Player Card**:
   - Verify hover moves the vinyl record in/out of the sleeve.
   - Verify currently playing song pulls correct track title, artist, album art, and Spotify/Last.fm URLs.
   - Verify the record spins when the song is playing.
