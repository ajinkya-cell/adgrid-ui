"use client";

import { useState } from 'react';
import { DotMatrix } from '@adgrid-ui/ui';

export default function MatrixDemoPage() {
  const [animation, setAnimation] = useState<any>('wave');
  const [rows, setRows] = useState(14);
  const [columns, setColumns] = useState(44);
  const [speed, setSpeed] = useState(1);
  const [color, setColor] = useState('#d2eaf4'); // default icy blue
  const [text, setText] = useState('KINETIC MATRIX');
  const [glow, setGlow] = useState(true);

  const animationsList = [
    { value: 'wave', label: 'Diagonal Sine Wave' },
    { value: 'noise', label: 'Perlin Simplex Noise' },
    { value: 'sparkle', label: 'Meteor Sparkles' },
    { value: 'ripple', label: 'Center Ripple Wave' },
    { value: 'snake', label: 'Retro Snake Game' },
    { value: 'rain', label: 'Digital Matrix Rain' },
    { value: 'text', label: 'Centered Static Text' },
    { value: 'scroll-text', label: 'Scrolling Marquee Text' },
    { value: 'clock', label: 'Real-Time Digital Clock' },
    { value: 'equalizer', label: 'Equalizer Simulation' },
    { value: 'audio', label: 'Live Audio Analyzer' },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#050508] text-white p-6 font-sans">
      <header className="max-w-6xl mx-auto w-full mb-8 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500">
          Programmable LED Dot Matrix
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          High-performance DOM-based LED emitter board with custom modular plugins.
        </p>
      </header>

      <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LED Grid Panel */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md min-h-[450px]">
          {animation === 'audio' && (
            <div className="mb-4 text-xs font-semibold px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Microphone Permission Required
            </div>
          )}
          
          <div className="overflow-auto max-w-full p-2 flex items-center justify-center">
            <DotMatrix
              rows={rows}
              columns={columns}
              animation={animation}
              speed={speed}
              color={color}
              text={text}
              glow={glow}
              dotSize={14}
              gap={5}
            />
          </div>
        </div>

        {/* Dashboard Settings Controls */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 flex flex-col gap-6">
          <h2 className="text-lg font-bold border-b border-neutral-800 pb-3 text-sky-400">
            LED Control Matrix
          </h2>

          {/* Animation Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Animation Engine
            </label>
            <select
              value={animation}
              onChange={(e) => setAnimation(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-sky-500"
            >
              {animationsList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input (only relevant for text / scroll-text) */}
          {(animation === 'text' || animation === 'scroll-text') && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Display Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={30}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}

          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Active LED Color
            </label>
            <div className="flex gap-2.5 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 border-0 bg-transparent rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono uppercase text-neutral-300">{color}</span>
            </div>
          </div>

          {/* Grid Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Rows: {rows}
              </label>
              <input
                type="range"
                min={6}
                max={22}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Columns: {columns}
              </label>
              <input
                type="range"
                min={16}
                max={60}
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>

          {/* Speed */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Animation Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-4 border-t border-neutral-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                LED Ambient Glow
              </span>
              <input
                type="checkbox"
                checked={glow}
                onChange={(e) => setGlow(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-neutral-900 border-neutral-800 accent-sky-500"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
