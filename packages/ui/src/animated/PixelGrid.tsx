"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Brush,
  Eraser,
  PaintBucket,
  MousePointer2,
  RotateCcw,
  RotateCw,
  Trash2,
  Copy,
  Check,
  Minus,
  Plus,
} from "lucide-react";

import { cn } from "../lib/utils";

export type PixelGridTool = "paint" | "erase" | "fill" | "select";
export type PixelGridCell = string | null;
export type PixelGridArtwork = PixelGridCell[][];

export interface PixelGridPaletteColor {
  id: string;
  label: string;
  color: string;
}

export interface PixelGridProps {
  value?: PixelGridArtwork;
  defaultValue?: PixelGridArtwork;
  rows?: number;
  columns?: number;
  editable?: boolean;
  palette?: PixelGridPaletteColor[];
  activeColorId?: string;
  defaultTool?: PixelGridTool;
  defaultBrushSize?: number;
  showToolbar?: boolean;
  showGridLines?: boolean;
  cellSize?: number;
  gap?: number;
  backgroundColor?: string;
  gridLineColor?: string;
  emptyColor?: string;
  className?: string;
  boardClassName?: string;
  onChange?: (artwork: PixelGridArtwork) => void;
}

const DEFAULT_PALETTE: PixelGridPaletteColor[] = [
  { id: "ink", label: "Ink", color: "#222222" },
  { id: "shadow", label: "Shadow", color: "#4b5563" },
  { id: "paper", label: "Paper", color: "#f8fafc" },
  { id: "amber", label: "Amber", color: "#f59e0b" },
];

const TOOL_LABELS: Record<PixelGridTool, string> = {
  paint: "Paint",
  erase: "Erase",
  fill: "Fill",
  select: "Select",
};

const TOOL_ICONS: Record<PixelGridTool, React.ComponentType<{ className?: string }>> = {
  paint: Brush,
  erase: Eraser,
  fill: PaintBucket,
  select: MousePointer2,
};

function cloneArtwork(artwork: PixelGridArtwork) {
  return artwork.map((row) => [...row]);
}

function createEmptyArtwork(rows: number, columns: number): PixelGridArtwork {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => null));
}

function normalizeArtwork(
  artwork: PixelGridArtwork | undefined,
  rows: number,
  columns: number
): PixelGridArtwork {
  const source = artwork ?? [];
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, columnIndex) => source[rowIndex]?.[columnIndex] ?? null)
  );
}

function serializeArtwork(artwork: PixelGridArtwork) {
  return JSON.stringify(artwork);
}

function buildRect(
  start: { row: number; column: number },
  end: { row: number; column: number }
) {
  return {
    top: Math.min(start.row, end.row),
    bottom: Math.max(start.row, end.row),
    left: Math.min(start.column, end.column),
    right: Math.max(start.column, end.column),
  };
}

function isInRect(
  row: number,
  column: number,
  rect: { top: number; bottom: number; left: number; right: number } | null
) {
  return Boolean(rect && row >= rect.top && row <= rect.bottom && column >= rect.left && column <= rect.right);
}

function applyBrush(
  artwork: PixelGridArtwork,
  row: number,
  column: number,
  brushSize: number,
  colorId: string | null
) {
  const next = cloneArtwork(artwork);
  const radius = Math.max(0, Math.floor((brushSize - 1) / 2));

  for (let y = row - radius; y <= row + radius; y += 1) {
    for (let x = column - radius; x <= column + radius; x += 1) {
      if (next[y]?.[x] !== undefined) {
        next[y][x] = colorId;
      }
    }
  }

  return next;
}

function floodFill(
  artwork: PixelGridArtwork,
  row: number,
  column: number,
  colorId: string | null
) {
  const target = artwork[row]?.[column];
  if (target === colorId) return artwork;

  const next = cloneArtwork(artwork);
  const queue: Array<[number, number]> = [[row, column]];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const [y, x] = queue.shift()!;
    const key = `${y}:${x}`;
    if (seen.has(key) || next[y]?.[x] !== target) continue;

    seen.add(key);
    next[y][x] = colorId;
    queue.push([y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]);
  }

  return next;
}

function clearSelection(
  artwork: PixelGridArtwork,
  rect: { top: number; bottom: number; left: number; right: number }
) {
  const next = cloneArtwork(artwork);
  for (let row = rect.top; row <= rect.bottom; row += 1) {
    for (let column = rect.left; column <= rect.right; column += 1) {
      if (next[row]?.[column] !== undefined) next[row][column] = null;
    }
  }
  return next;
}

function IconButton({
  active,
  label,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative grid h-9 w-9 place-items-center border border-white/10 bg-white/[0.04] text-white/55",
        "outline-none ring-offset-0 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
        "focus-visible:ring-2 focus-visible:ring-white/35 disabled:pointer-events-none disabled:opacity-35",
        active && "border-white/35 bg-white text-black"
      )}
    >
      {children}
    </button>
  );
}

export function PixelGrid({
  value,
  defaultValue,
  rows = 24,
  columns = 24,
  editable = false,
  palette = DEFAULT_PALETTE,
  activeColorId,
  defaultTool = "paint",
  defaultBrushSize = 1,
  showToolbar = editable,
  showGridLines = true,
  cellSize = 16,
  gap = 1,
  backgroundColor = "#f8fafc",
  gridLineColor = "rgba(15, 23, 42, 0.28)",
  emptyColor = "#ffffff",
  className,
  boardClassName,
  onChange,
}: PixelGridProps) {
  const reducedMotion = useReducedMotion();
  const normalizedRows = Math.max(1, Math.floor(rows));
  const normalizedColumns = Math.max(1, Math.floor(columns));
  const normalizedDefault = React.useMemo(
    () => normalizeArtwork(defaultValue, normalizedRows, normalizedColumns),
    [defaultValue, normalizedRows, normalizedColumns]
  );
  const [internalArtwork, setInternalArtwork] = React.useState<PixelGridArtwork>(normalizedDefault);
  const controlled = value !== undefined;
  const artwork = React.useMemo(
    () => normalizeArtwork(controlled ? value : internalArtwork, normalizedRows, normalizedColumns),
    [controlled, value, internalArtwork, normalizedRows, normalizedColumns]
  );
  const [tool, setTool] = React.useState<PixelGridTool>(defaultTool);
  const [selectedColorId, setSelectedColorId] = React.useState(activeColorId ?? palette[0]?.id ?? "ink");
  const [brushSize, setBrushSize] = React.useState(Math.max(1, Math.min(5, defaultBrushSize)));
  const [undoStack, setUndoStack] = React.useState<PixelGridArtwork[]>([]);
  const [redoStack, setRedoStack] = React.useState<PixelGridArtwork[]>([]);
  const [selectionStart, setSelectionStart] = React.useState<{ row: number; column: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = React.useState<{ row: number; column: number } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const isPointerDownRef = React.useRef(false);
  const actionStartedRef = React.useRef(false);
  const latestArtworkRef = React.useRef(artwork);

  React.useEffect(() => {
    latestArtworkRef.current = artwork;
  }, [artwork]);

  React.useEffect(() => {
    if (activeColorId) setSelectedColorId(activeColorId);
  }, [activeColorId]);

  React.useEffect(() => {
    if (!controlled) setInternalArtwork(normalizedDefault);
  }, [controlled, normalizedDefault]);

  React.useEffect(() => {
    function stopDrawing() {
      isPointerDownRef.current = false;
      actionStartedRef.current = false;
    }

    window.addEventListener("pointerup", stopDrawing);
    window.addEventListener("pointercancel", stopDrawing);
    return () => {
      window.removeEventListener("pointerup", stopDrawing);
      window.removeEventListener("pointercancel", stopDrawing);
    };
  }, []);

  const paletteMap = React.useMemo(
    () => new Map(palette.map((item) => [item.id, item])),
    [palette]
  );
  const selectionRect = React.useMemo(
    () => (selectionStart && selectionEnd ? buildRect(selectionStart, selectionEnd) : null),
    [selectionStart, selectionEnd]
  );

  const updateArtwork = React.useCallback(
    (next: PixelGridArtwork, options?: { history?: boolean }) => {
      const normalizedNext = normalizeArtwork(next, normalizedRows, normalizedColumns);
      const previous = latestArtworkRef.current;

      if (serializeArtwork(previous) === serializeArtwork(normalizedNext)) return;

      if (options?.history !== false) {
        setUndoStack((stack) => [...stack.slice(-39), cloneArtwork(previous)]);
        setRedoStack([]);
      }

      latestArtworkRef.current = normalizedNext;
      if (!controlled) setInternalArtwork(normalizedNext);
      onChange?.(normalizedNext);
    },
    [controlled, normalizedRows, normalizedColumns, onChange]
  );

  const applyTool = React.useCallback(
    (row: number, column: number, event?: React.PointerEvent) => {
      if (!editable) return;

      if (tool === "select") {
        const point = { row, column };
        if (!selectionStart || !isPointerDownRef.current) setSelectionStart(point);
        setSelectionEnd(point);
        return;
      }

      const erase = tool === "erase" || event?.button === 2;
      const colorId = erase ? null : selectedColorId;
      const next = tool === "fill"
        ? floodFill(latestArtworkRef.current, row, column, colorId)
        : applyBrush(latestArtworkRef.current, row, column, brushSize, colorId);

      updateArtwork(next, { history: !actionStartedRef.current });
      actionStartedRef.current = true;
    },
    [brushSize, editable, selectedColorId, selectionStart, tool, updateArtwork]
  );

  const undo = React.useCallback(() => {
    setUndoStack((stack) => {
      const previous = stack.at(-1);
      if (!previous) return stack;
      setRedoStack((redo) => [...redo, cloneArtwork(latestArtworkRef.current)]);
      latestArtworkRef.current = cloneArtwork(previous);
      if (!controlled) setInternalArtwork(cloneArtwork(previous));
      onChange?.(cloneArtwork(previous));
      return stack.slice(0, -1);
    });
  }, [controlled, onChange]);

  const redo = React.useCallback(() => {
    setRedoStack((stack) => {
      const next = stack.at(-1);
      if (!next) return stack;
      setUndoStack((undoItems) => [...undoItems, cloneArtwork(latestArtworkRef.current)]);
      latestArtworkRef.current = cloneArtwork(next);
      if (!controlled) setInternalArtwork(cloneArtwork(next));
      onChange?.(cloneArtwork(next));
      return stack.slice(0, -1);
    });
  }, [controlled, onChange]);

  const clearAll = React.useCallback(() => {
    updateArtwork(createEmptyArtwork(normalizedRows, normalizedColumns));
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [normalizedColumns, normalizedRows, updateArtwork]);

  const clearSelected = React.useCallback(() => {
    if (!selectionRect) return;
    updateArtwork(clearSelection(latestArtworkRef.current, selectionRect));
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selectionRect, updateArtwork]);

  const copyJson = React.useCallback(async () => {
    const json = JSON.stringify(latestArtworkRef.current);
    try {
      await navigator.clipboard?.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className={cn("flex w-fit flex-col gap-3 text-white", className)}>
      {showToolbar && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: -8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", duration: 0.32, bounce: 0 }}
          className="flex flex-wrap items-center gap-2 border border-white/10 bg-black/75 p-2 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-1">
            {(["paint", "erase", "fill", "select"] as PixelGridTool[]).map((toolName) => {
              const Icon = TOOL_ICONS[toolName];
              return (
                <IconButton
                  key={toolName}
                  active={tool === toolName}
                  label={TOOL_LABELS[toolName]}
                  onClick={() => setTool(toolName)}
                >
                  <Icon className="h-4 w-4" />
                </IconButton>
              );
            })}
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-1">
            {palette.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Use ${item.label}`}
                title={item.label}
                onClick={() => {
                  setSelectedColorId(item.id);
                  if (tool === "erase") setTool("paint");
                }}
                className={cn(
                  "grid h-9 w-9 place-items-center border border-white/10 bg-white/[0.04]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                  selectedColorId === item.id && "border-white/60"
                )}
              >
                <span className="h-5 w-5 border border-black/20" style={{ backgroundColor: item.color }} />
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-1">
            <IconButton label="Smaller brush" onClick={() => setBrushSize((size) => Math.max(1, size - 1))}>
              <Minus className="h-4 w-4" />
            </IconButton>
            <div className="grid h-9 min-w-9 place-items-center border border-white/10 px-2 font-mono text-[11px] text-white/70">
              {brushSize}
            </div>
            <IconButton label="Larger brush" onClick={() => setBrushSize((size) => Math.min(5, size + 1))}>
              <Plus className="h-4 w-4" />
            </IconButton>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-1">
            <IconButton label="Undo" onClick={undo} disabled={undoStack.length === 0}>
              <RotateCcw className="h-4 w-4" />
            </IconButton>
            <IconButton label="Redo" onClick={redo} disabled={redoStack.length === 0}>
              <RotateCw className="h-4 w-4" />
            </IconButton>
            <IconButton label={selectionRect ? "Clear selection" : "Clear grid"} onClick={selectionRect ? clearSelected : clearAll}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
            <IconButton label="Copy JSON" onClick={copyJson}>
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.9, filter: "blur(3px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9, filter: "blur(3px)" }}
                    transition={{ type: "spring", duration: 0.18, bounce: 0 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.9, filter: "blur(3px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9, filter: "blur(3px)" }}
                    transition={{ type: "spring", duration: 0.18, bounce: 0 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </IconButton>
          </div>
        </motion.div>
      )}

      <div
        role="grid"
        aria-rowcount={normalizedRows}
        aria-colcount={normalizedColumns}
        onContextMenu={(event) => event.preventDefault()}
        className={cn(
          "touch-none select-none overflow-hidden border border-black/20 shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
          editable && "cursor-crosshair",
          boardClassName
        )}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${normalizedColumns}, ${cellSize}px)`,
          gap,
          padding: showGridLines ? gap : 0,
          backgroundColor: showGridLines ? gridLineColor : backgroundColor,
        }}
      >
        {artwork.map((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const color = cell ? paletteMap.get(cell)?.color ?? cell : emptyColor;
            const selected = isInRect(rowIndex, columnIndex, selectionRect);
            return (
              <motion.button
                key={`${rowIndex}-${columnIndex}`}
                type="button"
                role="gridcell"
                aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}${cell ? `, ${cell}` : ", empty"}`}
                disabled={!editable}
                onPointerDown={(event) => {
                  if (!editable) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  isPointerDownRef.current = true;
                  actionStartedRef.current = false;
                  applyTool(rowIndex, columnIndex, event);
                }}
                onPointerEnter={(event) => {
                  if (!editable || !isPointerDownRef.current) return;
                  applyTool(rowIndex, columnIndex, event);
                }}
                onKeyDown={(event) => {
                  if (!editable) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    applyTool(rowIndex, columnIndex);
                  }
                }}
                animate={reducedMotion ? undefined : { scale: cell ? 1 : 0.985, opacity: cell ? 1 : 0.94 }}
                transition={{ type: "spring", duration: 0.14, bounce: 0 }}
                className={cn(
                  "relative m-0 block border-0 p-0 outline-none",
                  "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-sky-400",
                  editable ? "cursor-crosshair" : "cursor-default"
                )}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: color,
                }}
              >
                {selected && (
                  <span className="pointer-events-none absolute inset-0 bg-sky-400/30 ring-1 ring-inset ring-sky-300" />
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

export const pixelGridCatArtwork: PixelGridArtwork = [
  "......##........##......",
  ".....####......####.....",
  "....######....######....",
  "...########..########...",
  "...##################...",
  "..####################..",
  "..####################..",
  "..####################..",
  "..######...##...######..",
  "..#####.....##....#####.",
  "..#####.....##....#####.",
  "..#####..#..##..#..####.",
  "..#####..#..##..#..####.",
  "..######...####...#####.",
  "########################",
  ".######################.",
  "...##################...",
  "....################....",
  "....################....",
  "...##################...",
  "..####################..",
  ".######################.",
  "########################",
  "########################",
].map((row) => row.split("").map((cell) => (cell === "#" ? "ink" : null)));
