"use client";

import type { MotionValue } from "framer-motion";
import { Fader } from "./controls/Fader";
import { Knob } from "./controls/Knob";
import { LedMeter } from "./controls/LedMeter";
import { PanelButton } from "./controls/PanelButton";
import { LABEL, tray } from "./material";
import type { Channel } from "./types";

export interface MixerProps {
  channels: [Channel, Channel];
  onChannel: (deck: 0 | 1, patch: Partial<Channel>) => void;
  crossfader: number;
  onCrossfader: (v: number) => void;
  master: number;
  onMaster: (v: number) => void;
  levels: [MotionValue<number>, MotionValue<number>];
  masterLevels: [MotionValue<number>, MotionValue<number>];
  onDetent: () => void;
}

const db = (v: number) => (v <= -1 ? "kill" : `${v >= 0 ? "+" : "−"}${Math.abs(v * (v < 0 ? 26 : 6)).toFixed(0)} dB`);

function Strip({ deck, ch, onChannel, level, onDetent }: { deck: 0 | 1; ch: Channel; onChannel: MixerProps["onChannel"]; level: MotionValue<number>; onDetent: () => void }) {
  const n = deck + 1;
  const set = (patch: Partial<Channel>) => onChannel(deck, patch);
  const knobs = (
    <div className="flex flex-col gap-2">
      <Knob label="Trim" ariaLabel={`Channel ${n} trim`} value={ch.trim} defaultValue={0.5} onChange={(trim) => set({ trim })} bipolar size={34} onDetent={onDetent} />
      <Knob label="Hi" ariaLabel={`Channel ${n} high EQ`} value={ch.hi} min={-1} max={1} defaultValue={0} bipolar size={34} format={db} onChange={(hi) => set({ hi })} onDetent={onDetent} />
      <Knob label="Mid" ariaLabel={`Channel ${n} mid EQ`} value={ch.mid} min={-1} max={1} defaultValue={0} bipolar size={34} format={db} onChange={(mid) => set({ mid })} onDetent={onDetent} />
      <Knob label="Low" ariaLabel={`Channel ${n} low EQ`} value={ch.low} min={-1} max={1} defaultValue={0} bipolar size={34} format={db} onChange={(low) => set({ low })} onDetent={onDetent} />
    </div>
  );
  const meter = <LedMeter level={level} height={206} segments={15} />;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* the meter sits on the inside edge, toward the master section */}
      <div className="flex items-center gap-3">
        {deck === 0 ? (
          <>
            {knobs}
            {meter}
          </>
        ) : (
          <>
            {meter}
            {knobs}
          </>
        )}
      </div>
      <Knob
        label="Color"
        ariaLabel={`Channel ${n} colour filter`}
        value={ch.color}
        min={-1}
        max={1}
        defaultValue={0}
        bipolar
        size={42}
        format={(v) => (Math.abs(v) < 0.01 ? "off" : v < 0 ? `low-pass ${Math.round(-v * 100)}%` : `high-pass ${Math.round(v * 100)}%`)}
        onChange={(color) => set({ color })}
        onDetent={onDetent}
      />
      <PanelButton ariaLabel={`Channel ${n} headphone cue`} lit={ch.cue} color="#f08c3a" width={46} onPress={() => set({ cue: !ch.cue })}>
        Cue
      </PanelButton>
      <Fader ariaLabel={`Channel ${n} volume`} value={ch.fader} onChange={(fader) => set({ fader })} defaultValue={0.8} length={112} ticks={11} format={(v) => `${Math.round(v * 100)}%`} />
      <span className="font-mono text-[13px] font-semibold text-neutral-300">{n}</span>
    </div>
  );
}

/** Two channel strips, the master section between them, and the crossfader. */
export function Mixer({ channels, onChannel, crossfader, onCrossfader, master, onMaster, levels, masterLevels, onDetent }: MixerProps) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl px-4 pb-3 pt-3.5" style={tray}>
      <div className="flex justify-between">
        <Strip deck={0} ch={channels[0]} onChannel={onChannel} level={levels[0]} onDetent={onDetent} />
        <div className="flex flex-col items-center gap-3 pt-1">
          <span className={LABEL}>Master</span>
          <Knob label="Level" ariaLabel="Master level" value={master} defaultValue={0.8} onChange={onMaster} size={34} />
          <div className="flex gap-1.5">
            <LedMeter level={masterLevels[0]} height={170} segments={15} width={7} />
            <LedMeter level={masterLevels[1]} height={170} segments={15} width={7} />
          </div>
          <div className="flex w-full justify-between">
            <span className={LABEL}>L</span>
            <span className={LABEL}>R</span>
          </div>
        </div>
        <Strip deck={1} ch={channels[1]} onChannel={onChannel} level={levels[1]} onDetent={onDetent} />
      </div>

      <div className="mt-auto flex items-center justify-center gap-3">
        <span className="font-mono text-[11px] font-semibold text-neutral-400">1</span>
        <Fader
          ariaLabel="Crossfader"
          orientation="horizontal"
          value={crossfader}
          onChange={onCrossfader}
          min={-1}
          max={1}
          defaultValue={0}
          detent
          ticks={9}
          length={200}
          format={(v) => (Math.abs(v) < 0.01 ? "centre" : v < 0 ? `toward deck 1, ${Math.round(-v * 100)}%` : `toward deck 2, ${Math.round(v * 100)}%`)}
          onDetent={onDetent}
        />
        <span className="font-mono text-[11px] font-semibold text-neutral-400">2</span>
      </div>
    </div>
  );
}
