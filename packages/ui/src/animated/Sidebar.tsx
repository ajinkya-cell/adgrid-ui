"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
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
  ChevronRight,
  ChevronDown,
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
  const [activeNav, setActiveNav] = useState("overview");
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    analytics: false,
    team: false,
  });

  const dragControls = useDragControls();

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    }
    if (!isControlled) {
      setUncontrolledIsOpen(false);
    }
  }, [controlledOnClose, isControlled]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // ESC key dismiss listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !inline) {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose, inline]);

  // Motion variants based on side position
  const getMotionConfig = () => {
    if (side === "left") {
      return {
        initial: { x: "-100%", opacity: 0.5 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
        drag: "x" as const,
        dragControls: dragControls,
        dragListener: false,
        dragConstraints: { right: 0 },
        dragElastic: { right: 0.05, left: 0.8 },
        onDragEnd: (_: any, info: PanInfo) => {
          if (info.offset.x < -120 || info.velocity.x < -400) {
            handleClose();
          }
        },
      };
    }

    // right side
    return {
      initial: { x: "100%", opacity: 0.5 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 },
      drag: "x" as const,
      dragControls: dragControls,
      dragListener: false,
      dragConstraints: { left: 0 },
      dragElastic: { left: 0.05, right: 0.8 },
      onDragEnd: (_: any, info: PanInfo) => {
        if (info.offset.x > 120 || info.velocity.x > 400) {
          handleClose();
        }
      },
    };
  };

  const getPositionClasses = () => {
    if (inline) {
      return "w-full max-w-xs mx-auto rounded-3xl border border-white/15 min-h-[620px]";
    }
    if (side === "left") {
      return "fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 h-full border-r border-white/15";
    }
    // right side
    return "fixed top-0 bottom-0 right-0 z-50 w-72 sm:w-80 h-full border-l border-white/15";
  };

  const motionConfig = getMotionConfig();

  // Navigation Items Structure
  const dashboardSubOptions = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "performance", label: "Performance Metrics", icon: TrendingUp },
    { id: "traffic", label: "Live Traffic", icon: Zap, badge: "Live" },
    { id: "summary", label: "Executive Summary", icon: PieChart },
  ];

  const analyticsSubOptions = [
    { id: "demographics", label: "Audience & Demographics", icon: Globe },
    { id: "funnels", label: "Conversion Funnels", icon: Filter },
    { id: "reports", label: "Custom Reports", icon: FileText },
  ];

  const teamSubOptions = [
    { id: "directory", label: "Member Directory", icon: UserCheck },
    { id: "roles", label: "Roles & Access", icon: ShieldCheck },
    { id: "invites", label: "Invite Links", icon: UserPlus },
  ];

  const panelContent = (
    <motion.div
      key={`sidebar-panel-${side}`}
      {...motionConfig}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 30,
        mass: 0.9,
      }}
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "#111111",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 30px 80px rgba(0, 0, 0, 0.75)",
        fontFamily: "'DM Sans', sans-serif",
      }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden p-5 shadow-2xl backdrop-blur-2xl select-none font-['DM_Sans',sans-serif]",
        getPositionClasses(),
        className
      )}
    >
      {/* Google DM Sans Font Loader */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      {/* Top Handle for drag-to-dismiss */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex justify-center pt-0 pb-2 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="w-10 h-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors" />
      </div>

      {/* Header: Brand Logo */}
      <div className="flex items-center pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="AdGrid Studio Logo"
            className="w-11 h-11 object-contain shrink-0"
          />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-['DM_Sans',sans-serif]">
              AdGrid Studio
            </h3>
            <p className="text-[11px] text-neutral-400 font-['DM_Sans',sans-serif]">
              Pro Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Body Content */}
      {children || (
        <div className="flex-1 overflow-y-auto py-4 space-y-6 font-['DM_Sans',sans-serif]">
          {/* Main Navigation Group */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest font-['DM_Sans',sans-serif]">
              Main Navigation
            </div>

            {/* 1. Expandable Item: Dashboard (WITH ARROW) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection("dashboard")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-['DM_Sans',sans-serif]"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span className="font-['DM_Sans',sans-serif]">Dashboard</span>
                </div>
                {expandedSections.dashboard ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {expandedSections.dashboard && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-3.5 pr-1 space-y-1 border-l border-white/15 ml-4.5 mt-2 mb-2"
                  >
                    {dashboardSubOptions.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeNav === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveNav(sub.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                            isSubActive
                              ? "bg-white text-black font-bold shadow-md"
                              : "text-neutral-400 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon className={cn("w-3.5 h-3.5", isSubActive ? "text-black" : "text-neutral-400")} />
                            <span>{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-semibold px-1.5 py-0.2 rounded-full uppercase",
                                isSubActive
                                  ? "bg-black text-white"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              )}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Expandable Item: Analytics Hub (WITH ARROW) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection("analytics")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-['DM_Sans',sans-serif]"
              >
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4 text-white" />
                  <span className="font-['DM_Sans',sans-serif]">Analytics Hub</span>
                </div>
                {expandedSections.analytics ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {expandedSections.analytics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-3.5 pr-1 space-y-1 border-l border-white/15 ml-4.5 mt-2 mb-2"
                  >
                    {analyticsSubOptions.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeNav === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveNav(sub.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                            isSubActive
                              ? "bg-white text-black font-bold shadow-md"
                              : "text-neutral-400 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon className={cn("w-3.5 h-3.5", isSubActive ? "text-black" : "text-neutral-400")} />
                            <span>{sub.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Direct Link Item: Projects (NO ARROW) */}
            <button
              type="button"
              onClick={() => setActiveNav("projects")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                activeNav === "projects"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className={cn("w-4 h-4", activeNav === "projects" ? "text-black" : "text-neutral-400")} />
                <span>Projects</span>
              </div>
            </button>

            {/* 4. Direct Link Item: Components (NO ARROW, HAS BADGE) */}
            <button
              type="button"
              onClick={() => setActiveNav("components")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                activeNav === "components"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Layers className={cn("w-4 h-4", activeNav === "components" ? "text-black" : "text-neutral-400")} />
                <span>Components</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                  activeNav === "components"
                    ? "bg-black text-white"
                    : "bg-white/10 text-neutral-300 border border-white/10"
                )}
              >
                New
              </span>
            </button>
          </div>

          {/* Account Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest font-['DM_Sans',sans-serif]">
              Account & Settings
            </div>

            {/* 5. Expandable Item: Team Members (WITH ARROW) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection("team")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer font-['DM_Sans',sans-serif]"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-white" />
                  <span className="font-['DM_Sans',sans-serif]">Team & Access</span>
                </div>
                {expandedSections.team ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {expandedSections.team && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-3.5 pr-1 space-y-1 border-l border-white/15 ml-4.5 mt-2 mb-2"
                  >
                    {teamSubOptions.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeNav === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveNav(sub.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                            isSubActive
                              ? "bg-white text-black font-bold shadow-md"
                              : "text-neutral-400 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon className={cn("w-3.5 h-3.5", isSubActive ? "text-black" : "text-neutral-400")} />
                            <span>{sub.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Direct Link Item: API Credentials (NO ARROW) */}
            <button
              type="button"
              onClick={() => setActiveNav("api-keys")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                activeNav === "api-keys"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Key className={cn("w-4 h-4", activeNav === "api-keys" ? "text-black" : "text-neutral-400")} />
                <span>API Credentials</span>
              </div>
            </button>

            {/* 7. Direct Link Item: Billing & Plans (NO ARROW) */}
            <button
              type="button"
              onClick={() => setActiveNav("billing")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                activeNav === "billing"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={cn("w-4 h-4", activeNav === "billing" ? "text-black" : "text-neutral-400")} />
                <span>Billing & Plans</span>
              </div>
            </button>

            {/* 8. Direct Link Item: Workspace Settings (NO ARROW) */}
            <button
              type="button"
              onClick={() => setActiveNav("settings")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer font-['DM_Sans',sans-serif]",
                activeNav === "settings"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className={cn("w-4 h-4", activeNav === "settings" ? "text-black" : "text-neutral-400")} />
                <span>Workspace Settings</span>
              </div>
            </button>
          </div>

          {/* Upgrade Banner - Sunken / Recessed Debossed Well (Under Chassis Depth) */}
          <div
            style={{
              backgroundColor: "#060607",
              boxShadow:
                "inset 0 4px 10px rgba(0, 0, 0, 0.95), inset 0 1px 3px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(255, 255, 255, 0.07)",
            }}
            className="relative overflow-hidden p-4 rounded-2xl border border-white/[0.06] space-y-2.5 font-['DM_Sans',sans-serif] group select-none"
          >
            {/* Top inner cavity shadow transition line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a78bfa]/35 to-transparent opacity-80" />

            {/* Deep background lavender ambient glow */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#a78bfa]/8 blur-2xl pointer-events-none group-hover:bg-[#a78bfa]/18 transition-all duration-500" />

            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-2.5 text-xs font-bold text-white tracking-wide">
                {/* Sunken Inner Socket (Well inside a Well) */}
                <div
                  style={{
                    backgroundColor: "#020203",
                    boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.95)",
                  }}
                  className="w-7 h-7 rounded-lg border border-[#a78bfa]/30 flex items-center justify-center shrink-0"
                >
                  <Crown className="w-3.5 h-3.5 text-[#a78bfa]" />
                </div>
                <span className="font-['DM_Sans',sans-serif] text-white/95 font-bold">Pro Plan Active</span>
              </div>
              <span
                style={{
                  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.7)",
                }}
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30 tracking-widest uppercase"
              >
                PRO
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed font-['DM_Sans',sans-serif] relative z-10">
              Your team has unlimited component exports and API access.
            </p>
          </div>
        </div>
      )}

      {/* Footer Profile */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between font-['DM_Sans',sans-serif]">
        <div className="flex items-center gap-3">
          <img
            src="https://github.com/ajinkya-cell.png"
            alt="Ajinkya Profile"
            className="w-8 h-8 rounded-full object-cover border border-white/15 shadow-sm shrink-0"
          />
          <div>
            <div className="text-xs font-bold text-white font-['DM_Sans',sans-serif]">Ajinkya</div>
            <div className="text-[11px] text-neutral-400 font-['DM_Sans',sans-serif]">ajinkya.org</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  if (inline) {
    return panelContent;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-md cursor-default select-none font-['DM_Sans',sans-serif]"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
