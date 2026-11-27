"use client";

import type { MotionValue } from "framer-motion";
import { JogWheel } from "./JogWheel";
import { Fader } from "./controls/Fader";
import { Pad } from "./controls/Pad";
import { PanelButton, TransportButton } from "./controls/PanelButton";
import { LABEL, alpha } from "./material";
import { HOT_CUE_COLORS, JUMP_BEATS, LOOP_BEATS, PAD_MODES, type Loop, type PadMode } from "./types";

export interface DeckView {
  playing: boolean;
  /** Effective pitch in percent (follows the other deck while synced). */
  pitch: number;
  sync: boolean;
  padMode: PadMode;
  hotCues: (number | null)[];
  loop: Loop | null;
  loopIn: number | null;
  /** Seconds per beat at the current pitch, for the pads' pulse. */
  beatSec: number;
}

export interface DeckActions {
  togglePlay: () => void;
  cueDown: () => void;
  cueUp: () => void;
  setPitch: (pitch: number) => void;
  toggleSync: () => void;
  setPadMode: (mode: PadMode) => void;
  padDown: (pad: number) => void;
  padUp: (pad: number) => void;
  padClear: (pad: number) => void;
  loopIn: () => void;
  loopOut: () => void;
  reloop: () => void;
  jogGrab: () => void;
  jogTurn: (degrees: number) => void;
  jogRelease: () => void;
  nudge: (beats: number) => void;
  detent: () => void;
}

const fraction = (b: number) => (b === 0.25 ? "1/4" : b === 0.5 ? "1/2" : String(b));
const LETTERS = "ABCDEFGH";

export function Deck({
  deck,
  view,
  actions,
  angle,
  accent,
  reducedMotion,
}: {
  deck: 0 | 1;
  view: DeckView;
  actions: DeckActions;
  angle: MotionValue<number>;
  accent: string;
  reducedMotion: boolean;
}) {
  const mode = PAD_MODES.find((m) => m.id === view.padMode)!;

  const pad = (i: number) => {
    switch (view.padMode) {
      case "hot-cue": {
        const set = view.hotCues[i] != null;
        return { color: HOT_CUE_COLORS[i]!, lit: set, label: LETTERS[i]!, aria: set ? `Hot cue ${LETTERS[i]}: jump` : `Hot cue ${LETTERS[i]}: set` };
      }
      case "beat-loop":
      case "slip-loop": {
        const active = view.loop?.pad === i;
        const beats = LOOP_BEATS[i]!;
        const what = view.padMode === "slip-loop" ? "Slip loop" : "Loop";
        return { color: mode.color, lit: active, label: fraction(beats), aria: `${what} ${fraction(beats)} beat${beats > 1 ? "s" : ""}` };
      }
      case "beat-jump": {
        const b = JUMP_BEATS[i]!;
        return { color: mode.color, lit: false, label: b > 0 ? `+${b}` : String(b), aria: `Jump ${b > 0 ? "forward" : "back"} ${Math.abs(b)} beats` };
      }
    }
  };

  return (
    <div className="flex h-full w-[400px] shrink-0 flex-col justify-between">
      {/* header: deck number, loop keys, sync */}
      <div className="flex items-center gap-2">
        <span className={LABEL}>Deck</span>
        <span
          className="flex h-[22px] w-7 items-center justify-center rounded-md font-mono text-[12px] font-semibold"
          style={{ background: "linear-gradient(180deg,#f5f5f5 0%,#d9d9d9 100%)", color: "#0a0a0a", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.6)" }}
        >
          {deck + 1}
        </span>
        <div className="ml-3 flex gap-1.5">
          <PanelButton ariaLabel={`Deck ${deck + 1} loop in`} lit={view.loopIn !== null && !view.loop} color="#f08c3a" onPress={actions.loopIn}>
            In
          </PanelButton>
          <PanelButton ariaLabel={`Deck ${deck + 1} loop out`} lit={!!view.loop && view.loop.pad === null} color="#f08c3a" onPress={actions.loopOut}>
            Out
          </PanelButton>
          <PanelButton ariaLabel={`Deck ${deck + 1} reloop or exit`} lit={!!view.loop} color="#f08c3a" onPress={actions.reloop}>
            Reloop
          </PanelButton>
        </div>
        <PanelButton className="ml-auto" ariaLabel={`Deck ${deck + 1} beat sync`} lit={view.sync} color={accent} onPress={actions.toggleSync}>
          Sync
        </PanelButton>
      </div>

      {/* platter and tempo */}
      <div className="flex items-center justify-between">
        <JogWheel
          deck={deck}
          angle={angle}
          accent={accent}
          playing={view.playing}
          onGrab={actions.jogGrab}
          onTurn={actions.jogTurn}
          onRelease={actions.jogRelease}
          onNudge={actions.nudge}
        />
        <div className="flex flex-col items-center gap-2">
          <span className={LABEL}>Tempo</span>
          <span className="font-mono text-[10px] tabular-nums text-neutral-300">
            {view.pitch >= 0 ? "+" : "−"}
            {Math.abs(view.pitch).toFixed(1)}%
          </span>
          <Fader
            ariaLabel={`Deck ${deck + 1} tempo`}
            value={view.pitch}
            onChange={actions.setPitch}
            min={-8}
            max={8}
            defaultValue={0}
            detent
            ticks={9}
            length={236}
            format={(v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} percent`}
            onDetent={actions.detent}
          />
          <span className={LABEL}>±8</span>
        </div>
      </div>

      {/* pad mode, transport, pads */}
      <div className="flex gap-[22px]">
        <div className="flex flex-col justify-end gap-3">
          <TransportButton kind="cue" deck={deck} lit={!view.playing} onPress={actions.cueDown} onRelease={actions.cueUp} />
          <TransportButton kind="play" deck={deck} lit={view.playing} onPress={actions.togglePlay} />
        </div>
        <div className="flex flex-col gap-2.5">
          <div role="radiogroup" aria-label={`Deck ${deck + 1} pad mode`} className="grid grid-cols-4 gap-2.5">
            {PAD_MODES.map((m) => {
              const active = m.id === view.padMode;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => actions.setPadMode(m.id)}
                  className="flex h-[26px] flex-col items-center justify-center gap-[3px] rounded-md text-[8.5px] font-semibold uppercase tracking-[0.06em] outline-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                  style={{ color: active ? "#ededed" : "rgb(115,115,115)" }}
                >
                  {m.label}
                  <span
                    className="h-[2px] w-7 rounded-full transition-colors"
                    style={{ background: active ? m.color : alpha(m.color, 0.22), boxShadow: active ? `0 0 6px ${alpha(m.color, 0.6)}` : "none" }}
                  />
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }, (_, i) => {
              const p = pad(i);
              return (
                <Pad
                  key={`${view.padMode}-${i}`}
                  color={p.color}
                  lit={p.lit}
                  pulse={p.lit && view.padMode !== "hot-cue" ? view.beatSec : null}
                  label={p.label}
                  ariaLabel={`Deck ${deck + 1} pad ${i + 1}, ${p.aria}`}
                  onPress={() => actions.padDown(i)}
                  onRelease={() => actions.padUp(i)}
                  onClear={view.padMode === "hot-cue" ? () => actions.padClear(i) : undefined}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
