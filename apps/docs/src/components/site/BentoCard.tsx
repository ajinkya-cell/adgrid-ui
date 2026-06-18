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
        "group relative bg-surface-charcoal border border-border-hairline p-6 flex flex-col",
        "hover:bg-surface-container transition-colors duration-150",
        accent ? "md:col-span-1" : "",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] font-mono text-text-muted tracking-wider uppercase">
          {category}
        </span>
        <span className="text-xs text-text-muted/50">{categoryIcon}</span>
      </div>
      <p className="font-display font-semibold text-white mb-2 text-lg tracking-tight group-hover:text-white transition-colors">
        {label}
      </p>
      <p className="text-xs text-text-muted leading-relaxed flex-1">
        {description}
      </p>
      <div className="mt-4 text-xs font-mono text-text-muted/40 group-hover:text-text-muted transition-colors">
        explore →
      </div>
    </Link>
  );
}
