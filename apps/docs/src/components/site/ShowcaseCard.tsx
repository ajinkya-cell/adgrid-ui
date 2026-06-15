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
        "group relative bg-[#0d0d0d] border border-white/[0.06] rounded-[20px] p-6 pt-12",
        "hover:border-white/[0.15] transition-all duration-150 ease-out",
        "shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <span className="absolute top-4 left-5 font-mono text-[11px] text-white/40 tracking-wider group-hover:text-white/70 transition-colors duration-150">
        // {label}
      </span>
      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        <span className="text-[10px] text-white/40">{icon}</span>
      </div>
      <div className="flex items-center justify-center min-h-[100px]">
        {children}
      </div>
    </div>
  );
}
