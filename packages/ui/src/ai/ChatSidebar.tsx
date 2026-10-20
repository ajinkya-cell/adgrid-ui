"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  Archive02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  PinIcon,
  PinOffIcon,
  Search01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "../lib/utils";

// The history panel of a chat app. A New chat key at the top, a search well under it, then the
// threads grouped by when they were last touched: Pinned, Today, Yesterday, Previous 7 days,
// Previous 30 days, then by month. The open thread is the same raised segment as Tabs and Nav,
// and it glides from row to row.
//
// Hover a row (or tab into it) and a ⋯ key appears at its right end. Press it and the thread's
// menu unfolds from the key: Share, Rename, Pin, Archive, Delete, whichever you've wired up. The
// panel scales out of the key's corner as its blur clears, the items arrive one after another,
// a raised segment glides behind the one under the pointer, and each item's icon makes a small
// gesture of its own (the pin tips, the pencil scribbles, the bin rattles). Delete asks first: it
// turns into "Click again to delete" with a line draining under it, and backs off when it runs out.
// Rename turns the title into a field in place: Enter or clicking away keeps it, Escape throws it
// away. Removed rows fold shut. The menu is a real menu: arrow keys, Home/End, Escape.
//
// It fills its container's height, so put it in a column, or in a Drawer on small screens.
// Icons are Hugeicons (@hugeicons/react + @hugeicons/core-free-icons).

export interface ChatThread {
  id: string;
  title: string;
  /** When it was last touched. Drives the date groups. */
  updatedAt: Date | string | number;
  pinned?: boolean;
}

export interface ChatSidebarProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  threads: ChatThread[];
  /** The open thread. */
  activeId?: string | null;
  onSelect?: (id: string) => void;
  /** Shows the New chat key. */
  onNewChat?: () => void;
  /** Adds Share to the thread menu. */
  onShare?: (id: string) => void;
  /** Adds Rename to the thread menu. */
  onRename?: (id: string, title: string) => void;
  /** Adds Pin / Unpin to the thread menu. */
  onPinChange?: (id: string, pinned: boolean) => void;
  /** Adds Archive to the thread menu. */
  onArchive?: (id: string) => void;
  /** Adds Delete to the thread menu, with a confirming second press. */
  onDelete?: (id: string) => void;
  /** Show the search well. Default true. */
  searchable?: boolean;
  /** Above the New chat key: a logo, a workspace switcher. */
  header?: ReactNode;
  /** Pinned to the bottom: the signed-in user, settings. */
  footer?: ReactNode;
  /** Shown when there are no threads. Default "No chats yet". */
  emptyLabel?: ReactNode;
  /** "Today" is judged against this. Default: now. */
  now?: Date;
}

const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;
const EASE = [0.32, 0.72, 0, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

const SEGMENT = cn(
  "absolute inset-0 rounded-lg border border-white/[0.07] border-t-white/[0.13]",
  "bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_10px_-4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.5)]"
);

const WELL = "border border-white/[0.08] bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]";

const OVERLAY =
  "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1.5px 0 0 rgba(0,0,0,0.45), 0 40px 100px -20px rgba(0,0,0,0.9), 0 8px 24px -6px rgba(0,0,0,0.7)";

const DAY = 86_400_000;

/** The group a thread falls in, and an order key so newer groups come first. */
function groupOf(thread: ChatThread, now: Date): { label: string; order: number } {
  if (thread.pinned) return { label: "Pinned", order: -1 };
  const at = new Date(thread.updatedAt);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = at.getTime();
  if (t >= startOfToday) return { label: "Today", order: 0 };
  if (t >= startOfToday - DAY) return { label: "Yesterday", order: 1 };
  if (t >= startOfToday - 7 * DAY) return { label: "Previous 7 days", order: 2 };
  if (t >= startOfToday - 30 * DAY) return { label: "Previous 30 days", order: 3 };
  const sameYear = at.getFullYear() === now.getFullYear();
  return {
    label: at.toLocaleDateString(undefined, sameYear ? { month: "long" } : { month: "long", year: "numeric" }),
    // Older months sort by recency after the fixed groups.
    order: 4 + (now.getFullYear() * 12 + now.getMonth() - (at.getFullYear() * 12 + at.getMonth())),
  };
}

function groupThreads(threads: ChatThread[], now: Date) {
  const groups = new Map<string, { label: string; order: number; threads: ChatThread[] }>();
  for (const thread of [...threads].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())) {
    const { label, order } = groupOf(thread, now);
    if (!groups.has(label)) groups.set(label, { label, order, threads: [] });
    groups.get(label)!.threads.push(thread);
  }
  return [...groups.values()].sort((a, b) => a.order - b.order);
}

function Icon({ icon, size = 16, className }: { icon: IconSvgElement; size?: number; className?: string }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.6} color="currentColor" aria-hidden="true" className={className} />;
}

interface Handlers {
  onSelect?: (id: string) => void;
  onShare?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onPinChange?: (id: string, pinned: boolean) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChatSidebar = forwardRef<HTMLElement, ChatSidebarProps>(function ChatSidebar(
  {
    threads,
    activeId,
    onSelect,
    onNewChat,
    onShare,
    onRename,
    onPinChange,
    onArchive,
    onDelete,
    searchable = true,
    header,
    footer,
    emptyLabel = "No chats yet",
    now,
    className,
    ...rest
  },
  ref
) {
  const reduce = useReducedMotion() ?? false;
  const layoutId = useId();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q ? threads.filter((t) => t.title.toLowerCase().includes(q)) : threads;
  const groups = groupThreads(visible, now ?? new Date());
  const handlers: Handlers = { onSelect, onShare, onRename, onPinChange, onArchive, onDelete };

  return (
    <nav
      {...rest}
      ref={ref}
      aria-label={rest["aria-label"] ?? "Chat history"}
      className={cn("flex h-full min-h-0 w-full flex-col", className)}
    >
      {(header || onNewChat || searchable) && (
        <div className="flex flex-col gap-2.5 p-3 pb-2">
          {header}
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className={cn(
                "inline-flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium tracking-tight text-neutral-200",
                "border border-white/[0.08] border-t-white/[0.14] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)]",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
                "transition-[background,box-shadow,color,translate] duration-150 hover:bg-[linear-gradient(180deg,#252527_0%,#1c1c1e_100%)] hover:text-white",
                "active:translate-y-px active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)] motion-reduce:active:translate-y-0",
                "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
              )}
            >
              <Icon icon={Add01Icon} className="text-neutral-400" />
              New chat
            </button>
          )}
          {searchable && (
            <label className={cn("flex h-9 items-center gap-2 rounded-xl px-3 transition-colors duration-150 has-[:focus]:border-white/[0.18]", WELL)}>
              <Icon icon={Search01Icon} size={14} className="shrink-0 text-neutral-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                aria-label="Search chats"
                className="h-full min-w-0 flex-1 bg-transparent text-[13px] tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden"
              />
            </label>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]">
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-neutral-500">{q ? "No chats match" : emptyLabel}</p>
        ) : (
          <LayoutGroup id={layoutId}>
            {groups.map((group) => (
              <section key={group.label} aria-labelledby={`${layoutId}-${group.label}`} className="mt-3 first:mt-1">
                <h3 id={`${layoutId}-${group.label}`} className="px-3 pb-1 text-xs font-medium text-neutral-500">
                  {group.label}
                </h3>
                <ul className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {group.threads.map((thread) => (
                      <ThreadRow
                        key={thread.id}
                        thread={thread}
                        active={thread.id === activeId}
                        layoutId={layoutId}
                        reduce={reduce}
                        handlers={handlers}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </LayoutGroup>
        )}
      </div>

      {footer && <div className="border-t border-black/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">{footer}</div>}
    </nav>
  );
});

// ─── Row ────────────────────────────────────────────────────────────────────

function ThreadRow({
  thread,
  active,
  layoutId,
  reduce,
  handlers,
}: {
  thread: ChatThread;
  active: boolean;
  layoutId: string;
  reduce: boolean;
  handlers: Handlers;
}) {
  const { onSelect, onShare, onRename, onPinChange, onArchive, onDelete } = handlers;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(thread.title);
  const [menuOpen, setMenuOpen] = useState(false);
  // Opened from the keyboard: focus goes into the menu straight away.
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (editing) field.current?.select();
  }, [editing]);

  const commit = () => {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== thread.title) onRename?.(thread.id, title);
    else setDraft(thread.title);
  };

  const onFieldKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(thread.title);
      setEditing(false);
    }
  };

  const items: MenuItemDef[] = [];
  if (onShare) items.push({ key: "share", label: "Share", icon: Share08Icon, gesture: { y: [0, -2.5, 0], x: [0, 1.5, 0] }, run: () => onShare(thread.id) });
  if (onRename)
    items.push({
      key: "rename",
      label: "Rename",
      icon: PencilEdit02Icon,
      gesture: { rotate: [0, -14, 10, -6, 0], x: [0, -1, 1, 0] },
      run: () => {
        setDraft(thread.title);
        setEditing(true);
      },
    });
  if (onPinChange)
    items.push({
      key: "pin",
      label: thread.pinned ? "Unpin" : "Pin",
      icon: thread.pinned ? PinOffIcon : PinIcon,
      gesture: { rotate: [0, -28, -18], y: [0, -1.5, -1] },
      run: () => onPinChange(thread.id, !thread.pinned),
    });
  if (onArchive) items.push({ key: "archive", label: "Archive", icon: Archive02Icon, gesture: { y: [0, 2, 0], scaleY: [1, 0.9, 1] }, run: () => onArchive(thread.id) });
  if (onDelete)
    items.push({
      key: "delete",
      label: "Delete",
      icon: Delete02Icon,
      gesture: { rotate: [0, -10, 10, -6, 6, 0] },
      danger: true,
      confirm: "Click again to delete",
      run: () => onDelete(thread.id),
    });

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFromKeyboard(e.detail === 0);
    setMenuOpen((open) => !open);
  };

  return (
    <motion.li
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto", transition: { duration: reduce ? 0.15 : 0.22, ease: EASE } }}
      exit={{ opacity: 0, height: 0, transition: { duration: reduce ? 0.12 : 0.18, ease: EASE_IN } }}
      className="overflow-hidden"
    >
      <div className="group/row relative my-px flex h-9 items-center rounded-lg" data-menu={menuOpen ? "open" : undefined}>
        {active && <motion.span layoutId={`${layoutId}-active`} transition={reduce ? { duration: 0 } : SPRING} className={SEGMENT} />}
        {!active && (
          <span className="absolute inset-0 rounded-lg transition-colors duration-150 group-hover/row:bg-white/[0.03] group-data-[menu=open]/row:bg-white/[0.03]" />
        )}

        {editing ? (
          <input
            ref={field}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onFieldKey}
            onBlur={commit}
            aria-label="Chat title"
            className={cn("relative mx-1 h-7 min-w-0 flex-1 rounded-md px-2 text-[13px] tracking-tight text-neutral-100 outline-none focus:border-white/[0.18]", WELL)}
          />
        ) : (
          <button
            type="button"
            onClick={() => onSelect?.(thread.id)}
            aria-current={active ? "page" : undefined}
            title={thread.title}
            className={cn(
              "relative h-full min-w-0 flex-1 cursor-pointer rounded-lg px-3 text-left text-[13px] tracking-tight",
              "outline-white/40 -outline-offset-1 focus-visible:outline focus-visible:outline-1",
              active ? "text-neutral-100" : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {/* The title fades out at the right edge instead of an ellipsis, and sooner when the key shows. */}
            <span
              className={cn(
                "block overflow-hidden whitespace-nowrap [mask-image:linear-gradient(90deg,#000_calc(100%_-_24px),transparent)]",
                items.length > 0 &&
                  "group-focus-within/row:[mask-image:linear-gradient(90deg,#000_calc(100%_-_52px),transparent_calc(100%_-_30px))] group-hover/row:[mask-image:linear-gradient(90deg,#000_calc(100%_-_52px),transparent_calc(100%_-_30px))] group-data-[menu=open]/row:[mask-image:linear-gradient(90deg,#000_calc(100%_-_52px),transparent_calc(100%_-_30px))]"
              )}
            >
              {thread.title}
            </span>
          </button>
        )}

        {/* A pinned thread wears a small pin while the ⋯ key is hidden. */}
        {!editing && thread.pinned && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 text-neutral-600 transition-opacity duration-150 group-hover/row:opacity-0 group-focus-within/row:opacity-0 group-data-[menu=open]/row:opacity-0"
          >
            <Icon icon={PinIcon} size={12} />
          </span>
        )}

        {!editing && items.length > 0 && (
          <button
            ref={trigger}
            type="button"
            aria-label={`Options for ${thread.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={openMenu}
            className={cn(
              "absolute right-1.5 grid size-6 cursor-pointer place-items-center rounded-md border border-transparent text-neutral-500",
              "opacity-0 transition-[opacity,background-color,color,box-shadow] duration-150",
              "group-hover/row:opacity-100 group-focus-within/row:opacity-100 hover:bg-white/[0.06] hover:text-neutral-100",
              "outline-white/40 focus-visible:outline focus-visible:outline-1",
              // While its menu is open the key sits sunk in a socket.
              menuOpen && "border-white/[0.06] bg-[#070707] text-neutral-100 opacity-100 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85)] hover:bg-[#070707]"
            )}
          >
            <motion.span animate={{ rotate: menuOpen && !reduce ? 90 : 0 }} transition={SPRING} className="grid place-items-center">
              <Icon icon={MoreHorizontalIcon} size={15} />
            </motion.span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <ThreadMenu
            key="menu"
            id={menuId}
            anchor={trigger}
            items={items}
            focusFirst={fromKeyboard}
            reduce={reduce}
            onClose={(restoreFocus) => {
              setMenuOpen(false);
              if (restoreFocus) trigger.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// ─── Thread menu ────────────────────────────────────────────────────────────

interface MenuItemDef {
  key: string;
  label: string;
  icon: IconSvgElement;
  /** The icon's little gesture while the item is highlighted. */
  gesture: TargetAndTransition;
  run: () => void;
  danger?: boolean;
  /** Ask first: the label shown while waiting for the second press. */
  confirm?: string;
}

const MENU_WIDTH = 200;
const CONFIRM_MS = 3000;

function ThreadMenu({
  id,
  anchor,
  items,
  focusFirst,
  reduce,
  onClose,
}: {
  id: string;
  anchor: React.RefObject<HTMLButtonElement | null>;
  items: MenuItemDef[];
  focusFirst: boolean;
  reduce: boolean;
  onClose: (restoreFocus: boolean) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const [active, setActive] = useState<number>(focusFirst ? 0 : -1);
  const [confirming, setConfirming] = useState<string | null>(null);
  const highlight = useId();

  // Hang below the key, aligned to its right edge; flip above when there's no room.
  useLayoutEffect(() => {
    const a = anchor.current?.getBoundingClientRect();
    const h = panel.current?.offsetHeight ?? 0;
    if (!a) return;
    const above = a.bottom + 6 + h > window.innerHeight - 8 && a.top - 6 - h > 8;
    setPos({
      top: above ? a.top - 6 - h : a.bottom + 6,
      left: Math.max(8, Math.min(a.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
      above,
    });
  }, [anchor]);

  // Close on a press outside, on scroll or resize; Tab leaves the menu and closes it.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !anchor.current?.contains(t)) onClose(false);
    };
    const onMove = (e: Event) => {
      if (e.target instanceof Node && panel.current?.contains(e.target)) return;
      onClose(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [anchor, onClose]);

  // From the keyboard, focus lands on the first item; from the pointer, on the panel itself, so the
  // arrow keys still work without a highlight appearing under a pointer that didn't ask for one.
  const placed = pos !== null;
  useEffect(() => {
    if (!placed) return;
    if (focusFirst) refs.current[0]?.focus({ preventScroll: true });
    else panel.current?.focus({ preventScroll: true });
  }, [placed, focusFirst]);

  // A confirming delete backs off after a few seconds.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(null), CONFIRM_MS);
    return () => clearTimeout(t);
  }, [confirming]);

  const choose = (item: MenuItemDef) => {
    if (item.confirm && confirming !== item.key) {
      setConfirming(item.key);
      return;
    }
    onClose(false);
    item.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = (i: number) => {
      const next = (i + items.length) % items.length;
      setActive(next);
      refs.current[next]?.focus();
    };
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(active + 1),
      ArrowUp: () => move(active < 0 ? items.length - 1 : active - 1),
      Home: () => move(0),
      End: () => move(items.length - 1),
      Escape: () => onClose(true),
      Tab: () => onClose(true),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  const dangerAt = items.findIndex((item) => item.danger);

  return createPortal(
    <motion.div
      ref={panel}
      id={id}
      role="menu"
      aria-label="Chat options"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerLeave={() => setActive(-1)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: pos?.above ? 6 : -6, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: reduce ? { duration: 0.15 } : { type: "spring", stiffness: 520, damping: 34, mass: 0.8, opacity: { duration: 0.16 } },
      }}
      exit={{ opacity: 0, scale: reduce ? 1 : 0.96, filter: reduce ? "blur(0px)" : "blur(4px)", transition: { duration: 0.14, ease: EASE_IN } }}
      style={{
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        width: MENU_WIDTH,
        transformOrigin: pos?.above ? "100% 100%" : "100% 0%",
        boxShadow: OVERLAY,
      }}
      className={cn(
        "z-[1000] overflow-hidden rounded-2xl border border-white/[0.08] p-1.5 outline-none",
        "bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]"
      )}
    >
      {/* Prismatic top edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.18)_25%,rgba(255,255,255,0.32)_50%,rgba(255,255,255,0.18)_75%,transparent_100%)]"
      />
      <motion.div
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: reduce ? 0 : 0.03, delayChildren: reduce ? 0 : 0.04 } } }}
        className="flex flex-col"
      >
        {items.map((item, i) => {
          const isActive = active === i;
          const isConfirming = confirming === item.key;
          return (
            <motion.div
              key={item.key}
              variants={{ hidden: { opacity: 0, x: reduce ? 0 : -6 }, shown: { opacity: 1, x: 0, transition: { duration: 0.22, ease: EASE } } }}
            >
              {i === dangerAt && i > 0 && (
                <div aria-hidden="true" className="mx-2 my-1.5 h-px bg-black/70 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
              )}
              <button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={isActive || (active < 0 && i === 0) ? 0 : -1}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => choose(item)}
                className={cn(
                  "relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium tracking-tight outline-none",
                  item.danger ? "text-[rgb(229_115_115)]" : isActive ? "text-neutral-100" : "text-neutral-300"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={highlight}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 40 }}
                    className={cn(SEGMENT, item.danger && "border-t-[rgb(229_115_115/0.35)]")}
                  />
                )}
                <motion.span
                  className="relative grid size-4 shrink-0 place-items-center"
                  animate={isActive && !reduce ? item.gesture : { rotate: 0, x: 0, y: 0, scaleY: 1 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Icon icon={item.icon} />
                </motion.span>
                <span className="relative min-w-0 flex-1 truncate">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={isConfirming ? "confirm" : "label"}
                      className="block"
                      initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                      transition={{ duration: 0.18, ease: EASE }}
                    >
                      {isConfirming ? item.confirm : item.label}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {/* While it waits for the second press, a line drains away under it. */}
                {isConfirming && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-x-2.5 bottom-1 h-px origin-left bg-[rgb(229_115_115/0.6)]"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: CONFIRM_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {confirming ? "Press again to confirm" : ""}
      </span>
    </motion.div>,
    document.body
  );
}
