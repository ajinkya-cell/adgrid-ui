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
        "group relative bg-surface-charcoal border border-border-hairline p-6 pt-12 rounded-xl",
        "hover:bg-surface-container shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.95)] transition-all duration-300",
        className
      )}
    >
      <span className="absolute top-4 left-5 font-syncopate text-[8px] text-text-muted tracking-[0.2em] font-bold">
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
