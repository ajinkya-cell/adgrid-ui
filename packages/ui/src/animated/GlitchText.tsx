"use client";
import { cn } from "../lib/utils";

export interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className }: GlitchTextProps) {
  return (
    <span
      className={cn("relative inline-block font-display font-bold group", className)}
      data-text={text}
    >
      <style>{`
        .glitch-text { position: relative; }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          opacity: 0;
        }
        .glitch-text::before { color: #ff0040; clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
        .glitch-text::after  { color: #00ffcc; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
        .glitch-text:hover::before { opacity: 0.8; animation: glitch-before 0.3s steps(2) infinite; }
        .glitch-text:hover::after  { opacity: 0.8; animation: glitch-after  0.3s steps(2) infinite; }
        @keyframes glitch-before { 0%,100%{transform:translate(0)} 33%{transform:translate(-3px,1px)} 66%{transform:translate(3px,-1px)} }
        @keyframes glitch-after  { 0%,100%{transform:translate(0)} 33%{transform:translate(3px,-1px)} 66%{transform:translate(-3px,1px)} }
      `}</style>
      <span className="glitch-text" data-text={text}>{text}</span>
    </span>
  );
}