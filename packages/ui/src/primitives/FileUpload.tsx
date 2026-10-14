"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { Progress } from "./Progress";

// A dashed well you drop files into, or click (or focus and press Enter/Space) to browse. A real
// <input type="file"> sits underneath, so keyboard, screen readers and forms work natively; the
// accepted files are written back into it, so a plain form submit carries them. On drag-over the
// edge brightens and the well lightens one step; the key in its middle lifts to meet the files.
// Chosen files list underneath in trays: a thumbnail (images) or extension in a socket, the name,
// the size or status, and a slim Progress while uploading. Rejected files stay in the list with
// the reason, so nothing disappears without a word.

export type FileUploadStatus = "idle" | "uploading" | "done" | "error";

export interface FileUploadItem {
  id: string;
  file: File;
  status: FileUploadStatus;
  /** 0–100 while uploading. Leave undefined (or null) for an indeterminate bar. */
  progress?: number | null;
  /** Shown in place of the size when status is "error". */
  error?: string;
}

export interface FileUploadProps {
  value?: FileUploadItem[];
  defaultValue?: FileUploadItem[];
  /** Called with the whole list whenever files are added or removed. */
  onValueChange?: (items: FileUploadItem[]) => void;
  /** Called with just the newly accepted files — the place to start uploads. */
  onFilesAdded?: (items: FileUploadItem[]) => void;
  /** Called when a file is removed from the list — the place to cancel its upload. */
  onRemove?: (item: FileUploadItem) => void;
  /** Same syntax as the input's `accept`: ".pdf,image/*,text/csv". */
  accept?: string;
  multiple?: boolean;
  /** Largest file accepted, in bytes. */
  maxSize?: number;
  /** Most files the list can hold. */
  maxFiles?: number;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the accepted files with a form. */
  name?: string;
  id?: string;
  /** Main line inside the well. */
  title?: ReactNode;
  /** Second line inside the well. Defaults to a summary of `accept` and `maxSize`. */
  hint?: ReactNode;
  "aria-describedby"?: string;
  className?: string;
}

const EASE = [0.32, 0.72, 0, 1] as const;

let counter = 0;
const nextId = () => `file-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size < 10 ? parseFloat(size.toFixed(1)) : Math.round(size)} ${units[unit]}`;
}

function accepts(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule
    );
}

function describeAccept(accept?: string, maxSize?: number) {
  const kinds = accept
    ?.split(",")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => (rule.startsWith(".") ? rule.slice(1).toUpperCase() : rule.endsWith("/*") ? `${rule.slice(0, -2)}s` : rule))
    .join(", ");
  const size = maxSize ? `up to ${formatBytes(maxSize)}` : "";
  if (kinds) return `${kinds.charAt(0).toUpperCase()}${kinds.slice(1)}${size ? ` ${size}` : ""}`;
  if (size) return `Any file ${size}`;
  return "Any file";
}

const extension = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1, dot + 5) : "file";
};

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    value: valueProp,
    defaultValue = [],
    onValueChange,
    onFilesAdded,
    onRemove,
    accept,
    multiple = true,
    maxSize,
    maxFiles,
    disabled = false,
    invalid = false,
    name,
    id,
    title,
    hint,
    "aria-describedby": ariaDescribedBy,
    className,
  },
  ref
) {
  const [own, setOwn] = useState<FileUploadItem[]>(defaultValue);
  const items = valueProp !== undefined ? valueProp : own;
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const commit = (next: FileUploadItem[]) => {
    if (valueProp === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const add = (list: FileList | null) => {
    if (disabled || !list?.length) return;
    const incoming = multiple ? Array.from(list) : [list[0]];
    // A single-file field replaces what it holds.
    const kept = multiple ? items : [];
    let room = maxFiles === undefined ? Infinity : maxFiles - kept.filter((item) => item.status !== "error").length;

    const added = incoming.map<FileUploadItem>((file) => {
      const id = nextId();
      if (!accepts(file, accept)) return { id, file, status: "error", error: "File type not accepted" };
      if (maxSize !== undefined && file.size > maxSize) return { id, file, status: "error", error: `Larger than ${formatBytes(maxSize)}` };
      if (room <= 0) return { id, file, status: "error", error: `Limit of ${maxFiles} ${maxFiles === 1 ? "file" : "files"}` };
      room--;
      return { id, file, status: "idle" };
    });

    commit([...kept, ...added]);
    const accepted = added.filter((item) => item.status !== "error");
    if (accepted.length) onFilesAdded?.(accepted);
  };

  const remove = (item: FileUploadItem) => {
    commit(items.filter((other) => other.id !== item.id));
    onRemove?.(item);
  };

  // Write the accepted files back into the native input, so a form submit carries them.
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    try {
      const transfer = new DataTransfer();
      items.filter((item) => item.status !== "error").forEach((item) => transfer.items.add(item.file));
      input.files = transfer.files;
    } catch {
      // Older engines can't construct a DataTransfer; the list still works, only form submit doesn't.
    }
  }, [items]);

  const onDragEnter = (event: DragEvent) => {
    if (disabled || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current++;
    setDragging(true);
  };
  const onDragOver = (event: DragEvent) => {
    if (disabled || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(dragDepth.current - 1, 0);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (event: DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    add(event.dataTransfer.files);
  };

  return (
    <div
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      className={cn("flex w-full flex-col", className)}
    >
      <label
        data-dragging={dragging ? "" : undefined}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "group/drop relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center",
          "bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
          "transition-[border-color,background-color] duration-150",
          "outline-white/40 outline-offset-2 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-1",
          invalid ? "border-[rgb(229_115_115/0.45)]" : dragging ? "border-white/30" : "border-white/[0.12]",
          dragging && "bg-[#0c0c0d]",
          !disabled && !invalid && !dragging && "hover:border-white/[0.18]",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          onChange={(event) => {
            add(event.target.files);
          }}
          className="sr-only"
        />

        {/* A small raised key sitting in the well; it lifts when files hover over it. */}
        <span
          aria-hidden="true"
          className={cn(
            "grid size-10 place-items-center rounded-xl border border-white/[0.08] border-t-white/[0.13]",
            "bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_6px_14px_-6px_rgba(0,0,0,0.8),0_1px_3px_rgba(0,0,0,0.5)]",
            "transition-[translate,color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-colors",
            dragging ? "-translate-y-0.5 text-neutral-100 motion-reduce:translate-y-0" : "text-neutral-400 group-hover/drop:text-neutral-200"
          )}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
            <path d="M8 10.5V3m0 0L5 6m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10.5v1A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>

        <span className="flex flex-col gap-1">
          <span className="text-sm font-medium tracking-tight text-neutral-100">
            {title ?? (
              <>
                {dragging ? "Drop to add" : "Drop files here or "}
                {!dragging && <span className="underline decoration-white/25 underline-offset-[3px] group-hover/drop:decoration-white/60">browse</span>}
              </>
            )}
          </span>
          <span className="text-xs text-neutral-500">{hint ?? describeAccept(accept, maxSize)}</span>
        </span>
      </label>

      {items.length > 0 && (
        <ul aria-label="Files" className="mt-3 flex flex-col">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pb-2">
                  <FileRow item={item} disabled={disabled} onRemove={() => remove(item)} />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
});

function FileRow({ item, disabled, onRemove }: { item: FileUploadItem; disabled: boolean; onRemove: () => void }) {
  const { file, status } = item;
  const [preview, setPreview] = useState<string | null>(null);

  // Images get a thumbnail; the object URL is released when the row goes.
  useEffect(() => {
    if (!file.type.startsWith("image/") || status === "error") return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [file, status]);

  const meta =
    status === "error" ? (
      <span className="text-[rgb(229_115_115)]">{item.error ?? "Couldn't add this file"}</span>
    ) : status === "uploading" ? (
      <span className="tabular-nums">
        {formatBytes(file.size)}
        {item.progress != null && ` · ${Math.round(item.progress)}%`}
      </span>
    ) : status === "done" ? (
      `${formatBytes(file.size)} · Uploaded`
    ) : (
      formatBytes(file.size)
    );

  return (
    <div
      data-status={status}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-[#0c0c0d] py-2 pr-2 pl-2",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        status === "error" ? "border-[rgb(229_115_115/0.25)]" : "border-white/[0.06]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#070707]",
          "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
          "text-[10px] font-medium uppercase text-neutral-400"
        )}
      >
        {preview ? <img src={preview} alt="" className="size-full object-cover" /> : extension(file.name)}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[13px] font-medium tracking-tight text-neutral-100">{file.name}</span>
        <span className="text-xs text-neutral-500">{meta}</span>
        {status === "uploading" && (
          <Progress value={item.progress ?? null} size="sm" aria-label={`Uploading ${file.name}`} className="mt-0.5" />
        )}
      </span>

      {status === "done" && (
        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true" className="shrink-0 text-neutral-300">
          <path d="M2.6 6.3 4.9 8.6 9.4 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      <button
        type="button"
        aria-label={status === "uploading" ? `Cancel ${file.name}` : `Remove ${file.name}`}
        disabled={disabled}
        onClick={onRemove}
        className={cn(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-neutral-500",
          "transition-colors duration-150 hover:bg-white/[0.04] hover:text-neutral-100",
          "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
          "disabled:cursor-not-allowed"
        )}
      >
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
          <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
