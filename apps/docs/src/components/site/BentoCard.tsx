import Link from "next/link";
import { cn } from "@adgrid-ui/ui";

interface BentoCardProps {
  href: string;
  label: string;
  category: string;
  categoryIcon: string;
  description: string;
  accent?: boolean;
  className?: string;
}

export function BentoCard({ href, label, category, categoryIcon, description, accent, className }: BentoCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative bg-surface-charcoal border border-border-hairline p-6 flex flex-col rounded-xl",
        "hover:bg-surface-container shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.95)] transition-all duration-300",
        accent ? "md:col-span-1" : "",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[9px] font-syncopate text-text-muted tracking-[0.2em] font-bold uppercase">
          {category}
        </span>
        <span className="text-xs text-text-muted/50">{categoryIcon}</span>
      </div>
      <p className="font-jura font-bold text-neutral-100 mb-2 text-lg tracking-wide group-hover:text-white transition-colors">
        {label}
      </p>
      <p className="text-xs text-text-muted leading-relaxed flex-1 font-plus-jakarta">
        {description}
      </p>
      <div className="mt-4 text-xs font-syncopate text-text-muted/40 tracking-wider group-hover:text-text-muted transition-colors">
        explore →
      </div>
    </Link>
  );
}
