"use client";

import { cn } from "../../../lib/utils";
import { Roughly } from "../../../animated/Roughly";
import { FG, FOCUS, LINE, MUTED, SUBTLE, SocialIcon, externalProps, HAND, useInk } from "../parts";
import type { PortfolioProfile, SocialLink } from "../types";
import type { NavLink } from "./Header";

/** Footer: hand-signed name, page links, socials and copyright. */
export function Footer({ profile, socials, nav }: { profile: PortfolioProfile; socials: SocialLink[]; nav: NavLink[] }) {
  const ink = useInk();
  return (
    <>
      <footer className="grid gap-6 px-5 py-8 md:grid-cols-[230px_minmax(0,1fr)]">
        {/* Signed by hand: the drawing is decorative, the name stays in the DOM. */}
        <p className={cn("-mt-2", FG)}>
          <span className="sr-only">{profile.name}</span>
          <span aria-hidden="true">
            <Roughly.Handwriting color={ink} font={HAND} fontSize={56} strokeWidth={1.2} animationDelay={200}>
              {profile.name.split(" ")[0]}
            </Roughly.Handwriting>
          </span>
        </p>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-1.5 sm:grid-cols-3">
              {nav.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className={cn("rounded-sm text-sm transition-colors hover:text-[var(--pf-fg)]", MUTED, FOCUS)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <ul aria-label="Social links" className="flex gap-1.5">
              {socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    aria-label={social.label}
                    title={social.label}
                    className={cn("grid size-8 place-items-center rounded-md border transition-colors hover:bg-[var(--pf-panel)] hover:text-[var(--pf-fg)] [&_svg]:size-3.5", LINE, MUTED, FOCUS)}
                    {...externalProps(social.url)}
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                </li>
              ))}
            </ul>
            <p className={cn("pf-mono text-xs", SUBTLE)}>
              © {new Date().getFullYear()} {profile.name}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
