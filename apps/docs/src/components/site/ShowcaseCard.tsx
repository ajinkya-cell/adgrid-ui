import { cn } from "@adgrid-ui/ui";

interface ShowcaseCardProps {
  label: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export function ShowcaseCard({ label, icon = "◆", children, className }: ShowcaseCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-surface-charcoal border border-border-hairline p-6 pt-12",
        "hover:bg-surface-container transition-colors duration-150",
        className
      )}
    >
      <span className="absolute top-4 left-5 font-mono text-[11px] text-text-muted tracking-wider">
        {label}
      </span>
      <div className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center border border-border-hairline bg-pure-black">
        <span className="text-[10px] text-text-muted">{icon}</span>
      </div>
      <div className="flex items-center justify-center min-h-[100px]">
        {children}
      </div>
    </div>
  );
}
