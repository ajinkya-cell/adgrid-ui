"use client";

import React, { useCallback, useState } from "react";
import {
  LayoutDashboard,
  BarChart2,
  FolderKanban,
  Layers,
  Settings,
  CreditCard,
  Users,
  Key,
  LogOut,
  Crown,
  Activity,
  Zap,
  TrendingUp,
  PieChart,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Globe,
  Filter,
  FileText,
} from "lucide-react";
import { cn } from "../lib/utils";
import { CloseSocket, Drawer, DRAWER_PANEL_CLASS } from "../primitives/Drawer";
import { Nav, NavGroup, NavItem, NavSection } from "../primitives/Nav";

// An app sidebar in the primitives' material: a Drawer on the native <dialog> when it overlays the
// page, or the same raised panel docked inline. Navigation is the Nav primitive, so the current
// page is a raised segment that glides between items and into collapsible sections.

export type SidebarSide = "left" | "right";

export interface SidebarProps {
  /** Controls sidebar visibility */
  isOpen?: boolean;
  /** Callback fired when closing sidebar */
  onClose?: () => void;
  /** Viewport slide placement: "left" or "right" (default: "left") */
  side?: SidebarSide;
  /** Optional custom sidebar body content */
  children?: React.ReactNode;
  /** If true, renders inline inside container instead of fixed screen overlay */
  inline?: boolean;
  /** Custom class names */
  className?: string;
  /** Logo image source URL (default: "/utils/sidebar.png") */
  logoSrc?: string;
}

const WELL = "border border-white/[0.06] bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]";

function DefaultNav() {
  const [current, setCurrent] = useState("overview");

  return (
    <Nav aria-label="Main" value={current} onValueChange={setCurrent}>
      <NavGroup label="Workspace">
        <NavSection label="Dashboard" icon={<LayoutDashboard />} defaultOpen>
          <NavItem value="overview" icon={<Activity />}>Overview</NavItem>
          <NavItem value="performance" icon={<TrendingUp />}>Performance</NavItem>
          <NavItem value="traffic" icon={<Zap />} badge="Live">Live traffic</NavItem>
          <NavItem value="summary" icon={<PieChart />}>Executive summary</NavItem>
        </NavSection>
        <NavSection label="Analytics" icon={<BarChart2 />}>
          <NavItem value="demographics" icon={<Globe />}>Audience</NavItem>
          <NavItem value="funnels" icon={<Filter />}>Conversion funnels</NavItem>
          <NavItem value="reports" icon={<FileText />}>Custom reports</NavItem>
        </NavSection>
        <NavItem value="projects" icon={<FolderKanban />}>Projects</NavItem>
        <NavItem value="components" icon={<Layers />} badge="New">Components</NavItem>
      </NavGroup>

      <NavGroup label="Account">
        <NavSection label="Team & access" icon={<Users />}>
          <NavItem value="directory" icon={<UserCheck />}>Members</NavItem>
          <NavItem value="roles" icon={<ShieldCheck />}>Roles</NavItem>
          <NavItem value="invites" icon={<UserPlus />}>Invite links</NavItem>
        </NavSection>
        <NavItem value="api-keys" icon={<Key />}>API keys</NavItem>
        <NavItem value="billing" icon={<CreditCard />}>Billing</NavItem>
        <NavItem value="settings" icon={<Settings />}>Settings</NavItem>
      </NavGroup>
    </Nav>
  );
}

/** A plan card cut into the panel: a tray, an icon socket and a popout tag. No colour. */
function PlanCard() {
  return (
    <div className="rounded-2xl border border-black/50 bg-[#0c0c0d] p-3.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-neutral-300 [&_svg]:size-3.5", WELL)}>
          <Crown />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight text-neutral-100">Pro plan</span>
        <span className="inline-flex h-5 items-center rounded-md border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] px-1.5 text-[11px] font-medium text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6)]">
          Active
        </span>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-neutral-500">
        Unlimited component exports and API access for your team.
      </p>
    </div>
  );
}

export function Sidebar({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  side = "left",
  children,
  inline = false,
  className,
  logoSrc = "/utils/sidebar.png",
}: SidebarProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const handleClose = useCallback(() => {
    controlledOnClose?.();
    if (!isControlled) setUncontrolledIsOpen(false);
  }, [controlledOnClose, isControlled]);

  const content = (
    <>
      {/* Header: the logo sits in a socket. */}
      <div className="flex shrink-0 items-center gap-3 px-5 pt-5 pb-4">
        <span className={cn("grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl", WELL)}>
          <img src={logoSrc} alt="" className="size-8 object-contain" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold tracking-[-0.01em] text-neutral-50">AdGrid Studio</span>
          <span className="truncate text-xs text-neutral-500">Pro workspace</span>
        </div>
        {!inline && <CloseSocket onClick={handleClose} />}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]">
        {children ?? (
          <div className="flex flex-col gap-5">
            <DefaultNav />
            <div className="px-0.5">
              <PlanCard />
            </div>
          </div>
        )}
      </div>

      {/* Footer: profile, in the darker tray behind a cut line, like the Dialog footer. */}
      <div className="flex shrink-0 items-center gap-3 border-t border-black/60 bg-black/25 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span className={cn("size-9 shrink-0 overflow-hidden rounded-full p-0.5", WELL)}>
          <img src="https://github.com/ajinkya-cell.png" alt="" className="size-full rounded-full object-cover" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium tracking-tight text-neutral-100">Ajinkya</span>
          <span className="truncate text-xs text-neutral-500">ajinkya.org</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Log out"
          title="Log out"
          className={cn(
            "grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-neutral-500 [&_svg]:size-4",
            "transition-colors duration-150 hover:bg-white/[0.04] hover:text-neutral-100",
            "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
          )}
        >
          <LogOut />
        </button>
      </div>
    </>
  );

  if (inline) {
    return (
      <aside aria-label="Sidebar" className={cn(DRAWER_PANEL_CLASS, "mx-auto h-[640px] w-full max-w-[320px]", className)}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
          }}
        />
        {content}
      </aside>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      side={side}
      size="sm"
      aria-label="Sidebar"
      className={className}
    >
      {content}
    </Drawer>
  );
}
