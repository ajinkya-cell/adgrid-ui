"use client";

export function DownloadButton({ slug, name }: { slug: string; name: string }) {
  const download = async () => {
    const res = await fetch(`/api/registry/${slug}`);
    const data = await res.json();
    const blob = new Blob([data.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-sm transition-all"
    >
      ↓ download
    </button>
  );
}