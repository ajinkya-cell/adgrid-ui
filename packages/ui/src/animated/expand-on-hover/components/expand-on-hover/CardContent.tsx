import { ExpandItem } from "../../types";

interface CardContentProps {
  item: ExpandItem;
  index: number;
  borderRadius?: number;
}

export function CardContent({ item }: CardContentProps) {
  return (
    <div className="relative w-full h-full flex flex-col justify-end p-6 sm:p-8 select-none z-10">
      <div className="space-y-3 max-w-xl">
        {/* Subtitle / Category / Badge */}
        {(item.subtitle || item.badge) && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/60">
              {item.subtitle || item.badge}
            </span>
          </div>
        )}

        {/* Prominent Title */}
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed line-clamp-3 max-w-lg">
            {item.description}
          </p>
        )}

        {/* Year Pill & Status */}
        {item.year && (
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400 bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-0.5 rounded-full">
              Release {item.year}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
