"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Roughly } from "../../../animated/Roughly";
import { DASH, FG, FOCUS, HATCH, LINE, MUTED, externalProps } from "../parts";
import type { PortfolioProfile } from "../types";

// The contact section as a handwritten note: a small sheet of lined paper, taped to the page at a
// slight tilt, written in Reenie Beanie. Booking opens Cal.com in a dialog instead of filling the
// page with a calendar.

// The note is paper, not page: it keeps its own colours in both themes (like a real sticky note).
const PAPER = "#FBF4DC";
const PAPER_INK = "#3B2A14";
const PAPER_LINE = "rgba(59,42,20,0.13)";
const MARGIN_LINE = "rgba(220,38,38,0.35)";
const NOTE_FONT = { fontFamily: "'Reenie Beanie', cursive" } as const;

/** Cal.com in a native modal <dialog>. The iframe loads the first time it opens. */
export function BookingDialog({
  open,
  onClose,
  calLink,
  theme,
  name,
}: {
  open: boolean;
  onClose: () => void;
  calLink: string;
  theme: "dark" | "light";
  name: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setLoaded(true);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-label={`Book a call with ${name}`}
      className={cn(
        "m-auto h-[min(780px,calc(100dvh-2rem))] w-[min(920px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border bg-[var(--pf-bg)] p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-[2px]",
        LINE
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn("flex items-center justify-between border-b px-4 py-2.5", DASH)}>
          <p className={cn("text-sm font-medium", FG)}>Book a call with {name.split(" ")[0]}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn("grid size-8 place-items-center rounded-md transition-colors hover:bg-[var(--pf-panel)] hover:text-[var(--pf-fg)] [&_svg]:size-4", MUTED, FOCUS)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        {loaded && (
          <iframe
            key={theme}
            src={`https://cal.com/${calLink}?embed=true&layout=month_view&theme=${theme}`}
            title={`Book a call with ${name}`}
            className="block w-full flex-1 border-0"
          />
        )}
      </div>
    </dialog>
  );
}

function NoteButton({
  children,
  solid,
  href,
  onClick,
}: {
  children: React.ReactNode;
  solid?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const className = cn(
    "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-4 pb-1 pt-0.5 text-[24px] leading-none transition-transform duration-150 hover:-translate-y-0.5 [&_svg]:size-4",
    "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
  );
  const style = {
    ...NOTE_FONT,
    borderColor: PAPER_INK,
    background: solid ? PAPER_INK : "transparent",
    color: solid ? PAPER : PAPER_INK,
    outlineColor: PAPER_INK,
  };
  return href ? (
    <a href={href} className={className} style={style} {...externalProps(href)}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
}

export function Contact({ profile, onBook }: { profile: PortfolioProfile; onBook?: () => void }) {
  const first = profile.name.split(" ")[0].toLowerCase();
  const canBook = Boolean(onBook || profile.bookingUrl);

  return (
    <section id="contact" aria-labelledby="contact-title" className={cn("scroll-mt-16 border-b px-5 py-12 sm:py-16", DASH, HATCH)}>
      <div className="mx-auto max-w-[440px]">
        <div
          className="relative -rotate-[1.5deg] rounded-[3px] px-7 pb-6 pt-7 shadow-[0_1px_1px_rgba(0,0,0,0.15),0_12px_30px_-8px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none sm:pl-12"
          style={{
            background: `repeating-linear-gradient(180deg, transparent 0 31px, ${PAPER_LINE} 31px 32px), ${PAPER}`,
            backgroundPosition: "0 22px",
            color: PAPER_INK,
          }}
        >
          {/* Tape holding the note up, and the red margin rule of a notebook page. */}
          <span
            aria-hidden="true"
            className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[2deg] bg-[rgba(226,214,178,0.6)] shadow-[0_1px_2px_rgba(0,0,0,0.15)] backdrop-blur-[1px]"
          />
          <span aria-hidden="true" className="absolute inset-y-0 left-8 hidden w-px sm:block" style={{ background: MARGIN_LINE }} />

          <h2 id="contact-title" className="text-[42px] leading-[1]" style={NOTE_FONT}>
            hey, let&rsquo;s build something{" "}
            <Roughly.Underline color={PAPER_INK} strokeWidth={2} animationDelay={300} className="whitespace-nowrap">
              meaningful
            </Roughly.Underline>
          </h2>
          <p className="mt-3 text-[25px] leading-[32px]" style={NOTE_FONT}>
            have an idea, a project, or just want to talk? i&rsquo;m always open to a good conversation.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {canBook && (
              <NoteButton solid onClick={onBook} href={onBook ? undefined : profile.bookingUrl}>
                book a call
                <ArrowUpRight aria-hidden="true" />
              </NoteButton>
            )}
            <NoteButton href={`mailto:${profile.email}`}>say hello</NoteButton>
          </div>

          <p className="mt-4 text-right text-[28px] leading-none" style={NOTE_FONT}>
            &mdash; {first}
          </p>
        </div>
      </div>
    </section>
  );
}
