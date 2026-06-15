"use client";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-sm transition-all"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}