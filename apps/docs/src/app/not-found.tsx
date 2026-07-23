import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-pure-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="inline-block px-3 py-1 border border-border-hairline bg-surface-charcoal font-mono text-[10px] tracking-widest text-text-muted mb-6 uppercase">
        404 // ROUTE_NOT_FOUND
      </div>
      
      <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-4">
        OUT OF BOUNDS
      </h1>
      
      <p className="text-text-muted text-sm md:text-base max-w-md mb-8 leading-relaxed">
        The page or component route you requested does not exist or has been relocated within the void.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/gallery"
          className="px-6 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/90 transition-colors"
        >
          Explore Gallery
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-border-hairline bg-surface-charcoal text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/docs/getting-started"
          className="px-6 py-3 border border-border-hairline bg-surface-charcoal text-text-muted hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          Documentation
        </Link>
      </div>
    </div>
  );
}
