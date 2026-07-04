"use client";

import { useState } from "react";
import { FaSpotify } from "react-icons/fa6";

export type Song = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  image: string;
  songUrl: string;
  playedAt: string | null;
};

export function NowPlayingCard({ song }: { song: Song }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={song.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative block h-80 w-full max-w-[450px] overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black text-white shadow-2xl transition-transform duration-300"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vinyl-spinning {
          animation: vinyl-spin 6s linear infinite;
        }
      `}} />

      {/* Background */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-xl opacity-60 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none"
        style={{ backgroundImage: `url(${song.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6 pointer-events-none">
        
        {/* Top */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
          <FaSpotify className={`h-8 w-8 ${song.isPlaying ? "text-green-400" : "text-white/60"}`} />
          <span className={`${song.isPlaying ? "text-green-400" : "text-white/60"} text-2xl`} style={{ fontFamily: '"Outfit", sans-serif' }}>
            {song.isPlaying ? "Now Playing" : "Last Played"}
          </span>
        </div>

        {/* Info */}
        <div className="mt-3 flex-1">
          <h3 className="text-xl leading-tight line-clamp-2" style={{ fontFamily: '"Outfit", sans-serif' }}>
            I am listening to{" "}
            <span className="font-semibold">{song.title}</span>
          </h3>
          <p className="mt-2 uppercase text-base text-white/70" style={{ fontFamily: '"Geist Mono", monospace' }}>
            {song.artist}
          </p>
          <p className="mt-1 text-sm text-white/50" style={{ fontFamily: '"Geist Mono", monospace' }}>
            {song.album}
          </p>
        </div>

        {/* 🎵 Album + Vinyl */}
        <div className="relative mx-auto mt-8 h-48 w-48">
          
          {/* Vinyl */}
          <div
            className="absolute left-1/2 top-1/2 h-40 w-40 transition-transform duration-700 ease-out will-change-transform"
            style={{
              zIndex: 10,
              transform: isHovered ? "translate(-50%, -30%)" : "translate(-50%, -10%)",
            }}
          >
            <div
              className="relative w-full h-full vinyl-spinning will-change-transform transform-gpu"
              style={{
                animationPlayState: isHovered ? "running" : "paused",
              }}
            >
              
              {/* Shadow */}
              <div className="absolute inset-2 bg-black/80 rounded-full blur-xl translate-y-4" />

              {/* Vinyl body */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_0_15px_rgba(0,0,0,0.9),0_10px_30px_-10px_rgba(0,0,0,0.8)]">
                
                {/* Grooves */}
                <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,transparent_0,transparent_2px,rgba(255,255,255,0.03)_3px,transparent_4px)]" />

                {/* Sheen */}
                <div className="absolute inset-0 rounded-full pointer-events-none mix-blend-screen bg-[conic-gradient(from_45deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.08)_15%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.08)_65%,rgba(255,255,255,0)_80%)]" />

                {/* Center label */}
                <div className="relative w-[36%] h-[36%] rounded-full overflow-hidden border border-zinc-900 bg-zinc-800 flex items-center justify-center z-10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  
                  <img
                    src={song.image}
                    alt={song.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Hole */}
                  <div className="relative w-3 h-3 bg-[#09090b] rounded-full border border-zinc-700/50 shadow-[0_0_2px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Album */}
          <div
            className="absolute left-1/2 top-1/2 h-56 w-56 overflow-hidden rounded-xl shadow-2xl transition-transform duration-700 ease-out will-change-transform"
            style={{
              zIndex: 20,
              transform: isHovered ? "translate(-50%, 10%)" : "translate(-50%, 0%)",
            }}
          >
            <img
              src={song.image}
              alt={song.album}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/40">
          Hover to reveal vinyl
        </div>
      </div>
    </a>
  );
}

export default NowPlayingCard;
