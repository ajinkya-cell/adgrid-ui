"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Deck, type DeckActions, type DeckView } from "./Deck";
import { Mixer } from "./Mixer";
import { Screen } from "./Screen";
import { click, DETENT_CLICK, VOID_BUTTON_CLICK } from "./controls/click";
import { PRISMATIC, raised } from "./material";
import { useDeckClock, type Controls } from "./useDeckClock";
import { makePeaks, type Peaks } from "./waveform";
import { DEFAULT_CHANNEL, JUMP_BEATS, LOOP_BEATS, type Channel, type DeckTrack, type Loop, type PadMode } from "./types";

export interface DjControllerProps {
  /** The tracks on deck 1 and deck 2. */
  decks?: [DeckTrack, DeckTrack];
  /** Start deck 1 playing on mount. */
  autoPlay?: boolean;
  /** Jog-ring and screen colour per deck. */
  accents?: [string, string];
  /** Detent clicks on knobs, faders and pads. Off by default. */
  sound?: boolean;
  className?: string;
}

export const sampleDeckTracks: [DeckTrack, DeckTrack] = [
  { title: "Low Orbit", artist: "Mira Kael", bpm: 124, duration: 372 },
  { title: "Glass Harbour (Extended Mix)", artist: "Tomasz Ide", bpm: 126, duration: 405 },
];

// The chassis is laid out at one fixed size and scaled as a whole to its container's width, so
// every proportion of the hardware holds at any size.
const W = 1280;
const H = 820;
const PAD = 22;

interface DeckState {
  playing: boolean;
  /** Held CUE while paused: plays from the cue point until released. */
  cueHeld: boolean;
  cue: number;
  pitch: number;
  sync: boolean;
  padMode: PadMode;
  hotCues: (number | null)[];
  loop: Loop | null;
  lastLoop: Loop | null;
  loopIn: number | null;
}

/** Hot cues A–D at the first four phrase starts, so the pads come up lit. */
function initialDeck(track: DeckTrack, playing: boolean): DeckState {
  const phrase = (60 / track.bpm) * 64;
  const hotCues: (number | null)[] = Array.from({ length: 8 }, (_, i) => (i < 4 && i * phrase < track.duration ? i * phrase : null));
  return { playing, cueHeld: false, cue: 0, pitch: 0, sync: false, padMode: "hot-cue", hotCues, loop: null, lastLoop: null, loopIn: null };
}

export function DjController({ decks: tracksProp, autoPlay = true, accents = ["#3f8cff", "#3f8cff"], sound = false, className }: DjControllerProps) {
  // Keyed by value, so an inline `decks={[…]}` doesn't regenerate the waveforms every render.
  const tracksKey = JSON.stringify(tracksProp ?? sampleDeckTracks);
  const tracks = useMemo(() => JSON.parse(tracksKey) as [DeckTrack, DeckTrack], [tracksKey]);
  const reducedMotion = !!useReducedMotion();
  const peaks = useMemo(() => [makePeaks(tracks[0]), makePeaks(tracks[1])] as [Peaks, Peaks], [tracks]);

  const [decks, setDecks] = useState<[DeckState, DeckState]>(() => [initialDeck(tracks[0], autoPlay), initialDeck(tracks[1], false)]);
  const [channels, setChannels] = useState<[Channel, Channel]>([{ ...DEFAULT_CHANNEL }, { ...DEFAULT_CHANNEL, fader: 0.8 }]);
  const [crossfader, setCrossfader] = useState(-0.35);
  const [master, setMaster] = useState(0.8);

  const patchDeck = useCallback((d: 0 | 1, patch: Partial<DeckState> | ((s: DeckState) => Partial<DeckState>)) => {
    setDecks((prev) => {
      const next = [...prev] as [DeckState, DeckState];
      next[d] = { ...prev[d], ...(typeof patch === "function" ? patch(prev[d]) : patch) };
      return next;
    });
  }, []);

  // Sync follows the other deck's tempo for as long as it stays on.
  const effectivePitch = (d: 0 | 1) => {
    const s = decks[d];
    if (!s.sync) return s.pitch;
    const o = decks[d === 0 ? 1 : 0];
    const target = (tracks[d === 0 ? 1 : 0].bpm * (1 + (o.sync ? 0 : o.pitch) / 100)) / tracks[d].bpm - 1;
    return Math.max(-8, Math.min(8, target * 100));
  };
  const pitches = [effectivePitch(0), effectivePitch(1)] as const;

  const controls = useRef<Controls>(null!);
  controls.current = {
    decks: [0, 1].map((d) => ({
      playing: decks[d]!.playing || decks[d]!.cueHeld,
      pitch: pitches[d]!,
      duration: tracks[d]!.duration,
      loop: decks[d]!.loop,
      slip: decks[d]!.padMode === "slip-loop" && !!decks[d]!.loop,
    })) as Controls["decks"],
    mix: { channels, crossfader, master },
  };

  const onEnd = useCallback((d: 0 | 1) => patchDeck(d, { playing: false }), [patchDeck]);
  const clock = useDeckClock({ controls, peaks, reducedMotion, onEnd });
  const { rt } = clock;

  // --- scale to fit ---
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tick = useCallback(() => sound && click(DETENT_CLICK), [sound]);
  const press = useCallback(() => sound && click(VOID_BUTTON_CLICK), [sound]);

  const actionsFor = (d: 0 | 1): DeckActions => {
    const r = () => rt.current[d];
    const beatSec = 60 / tracks[d].bpm;
    const duration = tracks[d].duration;
    const clamp = (t: number) => Math.max(0, Math.min(duration, t));
    const snap = (t: number) => clamp(Math.round(t / beatSec) * beatSec);
    const jump = (t: number) => {
      r().pos = clamp(t);
    };
    const loopAt = (beats: number, pad: number): Loop => {
      const length = beats * beatSec;
      const unit = Math.min(length, beatSec);
      return { start: Math.floor(r().pos / unit) * unit, length, pad };
    };

    return {
      togglePlay: () => {
        press();
        patchDeck(d, (s) => ({ playing: !(s.playing || s.cueHeld), cueHeld: false }));
      },
      cueDown: () => {
        press();
        const s = decks[d];
        if (s.playing) {
          // Back to the cue point and stop dead, like the hardware.
          r().velocity = 0;
          jump(s.cue);
          patchDeck(d, { playing: false });
        } else {
          const at = Math.abs(r().pos - s.cue) < 0.02 ? s.cue : snap(r().pos);
          jump(at);
          patchDeck(d, { cue: at, cueHeld: true });
        }
      },
      cueUp: () => {
        if (!decks[d].cueHeld) return;
        r().velocity = 0;
        jump(decks[d].cue);
        patchDeck(d, { cueHeld: false });
      },
      setPitch: (pitch) => patchDeck(d, { pitch, sync: false }),
      toggleSync: () => {
        press();
        patchDeck(d, (s) => (s.sync ? { sync: false, pitch: effectivePitch(d) } : { sync: true }));
      },
      setPadMode: (padMode) => {
        press();
        // Leaving slip loop while one is held lets go of it.
        const shadow = r().shadow;
        if (shadow !== null) {
          jump(shadow);
          r().shadow = null;
          patchDeck(d, { padMode, loop: null });
        } else patchDeck(d, { padMode });
      },
      padDown: (i) => {
        tick();
        const s = decks[d];
        switch (s.padMode) {
          case "hot-cue": {
            const cue = s.hotCues[i];
            if (cue == null) {
              const hotCues = [...s.hotCues];
              hotCues[i] = snap(r().pos);
              patchDeck(d, { hotCues });
            } else jump(cue);
            break;
          }
          case "beat-loop":
            if (s.loop?.pad === i) patchDeck(d, { loop: null, lastLoop: s.loop });
            else {
              const loop = loopAt(LOOP_BEATS[i]!, i);
              patchDeck(d, { loop, lastLoop: loop });
            }
            break;
          case "slip-loop":
            r().shadow = r().pos;
            patchDeck(d, { loop: loopAt(LOOP_BEATS[i]!, i) });
            break;
          case "beat-jump": {
            const delta = JUMP_BEATS[i]! * beatSec;
            jump(r().pos + delta);
            if (s.loop) patchDeck(d, { loop: { ...s.loop, start: s.loop.start + delta } });
            break;
          }
        }
      },
      padUp: (i) => {
        const s = decks[d];
        if (s.padMode === "slip-loop" && s.loop?.pad === i) {
          // Let go: carry on from where the track would have been all along.
          if (r().shadow !== null) jump(r().shadow!);
          r().shadow = null;
          patchDeck(d, { loop: null });
        }
      },
      padClear: (i) => {
        const hotCues = [...decks[d].hotCues];
        hotCues[i] = null;
        patchDeck(d, { hotCues });
      },
      loopIn: () => {
        press();
        patchDeck(d, { loopIn: snap(r().pos), loop: null });
      },
      loopOut: () => {
        press();
        const s = decks[d];
        if (s.loopIn === null) return;
        const end = snap(r().pos);
        if (end <= s.loopIn) return;
        const loop: Loop = { start: s.loopIn, length: end - s.loopIn, pad: null };
        patchDeck(d, { loop, lastLoop: loop, loopIn: null });
      },
      reloop: () => {
        press();
        const s = decks[d];
        if (s.loop) patchDeck(d, { loop: null, lastLoop: s.loop });
        else if (s.lastLoop) {
          jump(s.lastLoop.start);
          patchDeck(d, { loop: s.lastLoop });
        }
      },
      jogGrab: () => {
        r().scratching = true;
        r().scratchDelta = 0;
      },
      jogTurn: (deg) => {
        r().scratchDelta += deg;
      },
      jogRelease: () => {
        r().scratching = false;
      },
      nudge: (beats) => jump(r().pos + beats * beatSec),
      detent: tick,
    };
  };

  const view = (d: 0 | 1): DeckView => {
    const s = decks[d];
    return {
      playing: s.playing || s.cueHeld,
      pitch: pitches[d],
      sync: s.sync,
      padMode: s.padMode,
      hotCues: s.hotCues,
      loop: s.loop,
      loopIn: s.loopIn,
      beatSec: 60 / tracks[d].bpm / (1 + pitches[d] / 100),
    };
  };

  return (
    <div ref={host} className={cn("relative w-full select-none", className)} style={{ aspectRatio: `${W} / ${H}` }}>
      <div
        className="absolute left-0 top-0 origin-top-left rounded-[30px]"
        style={{
          ...raised,
          width: W,
          height: H,
          padding: PAD,
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
          boxShadow: `${raised.boxShadow}, 0 40px 80px -30px rgba(0,0,0,0.8)`,
        }}
      >
        <span aria-hidden className="pointer-events-none absolute left-16 right-16 top-0 h-[1.5px]" style={{ background: PRISMATIC }} />
        <div className="flex h-full justify-between">
          <Deck deck={0} view={view(0)} actions={actionsFor(0)} angle={clock.angles[0]} accent={accents[0]} reducedMotion={reducedMotion} />
          <div className="flex w-[400px] shrink-0 flex-col gap-3">
            <Screen
              tracks={tracks}
              peaks={peaks}
              rt={rt}
              controls={controls}
              hotCues={[decks[0].hotCues, decks[1].hotCues]}
              accents={accents}
              scale={scale || 1}
            />
            <Mixer
              channels={channels}
              onChannel={(d, patch) =>
                setChannels((prev) => {
                  const next = [...prev] as [Channel, Channel];
                  next[d] = { ...prev[d], ...patch };
                  return next;
                })
              }
              crossfader={crossfader}
              onCrossfader={setCrossfader}
              master={master}
              onMaster={setMaster}
              levels={clock.levels}
              masterLevels={clock.master}
              onDetent={tick}
            />
          </div>
          <Deck deck={1} view={view(1)} actions={actionsFor(1)} angle={clock.angles[1]} accent={accents[1]} reducedMotion={reducedMotion} />
        </div>
      </div>
    </div>
  );
}
