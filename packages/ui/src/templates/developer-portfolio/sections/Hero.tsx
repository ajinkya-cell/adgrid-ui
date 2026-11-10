"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, BadgeCheck, CodeXml, Mail, Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Roughly } from "../../../animated/Roughly";
import {
  DASH,
  DOTS,
  FG,
  FOCUS,
  IconBox,
  LINE,
  LinkButton,
  MUTED,
  RichText,
  SUBTLE,
  SocialIcon,
  externalProps,
  initialsOf,
  HAND,
  useInk,
} from "../parts";
import type { FeaturedCard, PortfolioProfile, ResumeLink, SocialLink } from "../types";

/** Their local time and how far it is from the visitor's. Null until mounted, so SSR matches. */
function useLocalTime(timezone: string) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;
  try {
    const time = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(now);
    const theirs = new Date(now.toLocaleString("en-US", { timeZone: timezone })).getTime();
    const mine = new Date(now.toLocaleString("en-US")).getTime();
    const hours = Math.round(((theirs - mine) / 3_600_000) * 2) / 2;
    const diff = hours === 0 ? "same time" : `${Math.abs(hours)}h ${hours > 0 ? "ahead" : "behind"}`;
    return { time, diff };
  } catch {
    return null;
  }
}

/**
 * The banner. The still image shows straight away; a muted looping video loads after it and
 * fades in once it can play. Visitors who prefer reduced motion keep the still.
 */
function Cover({ image, video, position = "center" }: { image?: string; video?: string; position?: string }) {
  const [playVideo, setPlayVideo] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    setPlayVideo(Boolean(video) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [video]);

  const fill = "absolute inset-0 size-full object-cover";
  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden rounded-2xl border sm:h-64",
        LINE,
        !image && !video && cn("bg-[var(--pf-panel)]", DOTS)
      )}
    >
      {image && <img src={image} alt="" className={fill} style={{ objectPosition: position }} />}
      {video && playVideo && (
        <video
          key={video}
          src={video}
          poster={image}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onPlaying={() => setReady(true)}
          className={cn(fill, "transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
          style={{ objectPosition: position }}
        />
      )}
    </div>
  );
}

/** The tagline with its key words underlined by hand (kept on one line so it reads as one mark). */
function Tagline({ text, emphasis }: { text: string; emphasis?: string }) {
  const ink = useInk();
  const at = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      {/* 15px text → stroke 1.5; double = "this is the one" (the only double on the page) */}
      <Roughly.Underline variant="double" color={ink} strokeWidth={1.5} animationDelay={400} className="whitespace-nowrap text-[var(--pf-fg)]">
        {emphasis}
      </Roughly.Underline>
      {text.slice(at + emphasis.length)}
    </>
  );
}

function Featured({ card }: { card: FeaturedCard }) {
  const solid = card.platform === "community";
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", DASH)}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg border bg-[var(--pf-panel)] [&_svg]:size-5", LINE, FG)}>
        {card.platform === "community" ? <Users aria-hidden="true" /> : <SocialIcon platform={card.platform} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("flex items-center gap-1 truncate text-sm font-semibold", FG)}>
          {card.title}
          {card.verified && <BadgeCheck className="size-4 shrink-0 fill-sky-500 stroke-[var(--pf-bg)]" aria-label="Verified" />}
        </p>
        <p className={cn("flex items-center gap-1.5 truncate text-[13px]", MUTED)}>
          {card.live && <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />}
          {card.subtitle}
        </p>
      </div>
      <LinkButton href={card.url} variant={solid ? "solid" : "outline"} className="h-7 shrink-0 px-2.5 text-xs">
        {card.action}
      </LinkButton>
    </div>
  );
}

export function Hero({
  onBook,
  profile,
  intro,
  featured,
  socials,
  resumes,
}: {
  /** Opens the booking dialog; without it the button follows bookingUrl. */
  onBook?: () => void;
  profile: PortfolioProfile;
  intro: string[];
  featured: FeaturedCard[];
  socials: SocialLink[];
  resumes: ResumeLink[];
}) {
  const local = useLocalTime(profile.timezone);
  const ink = useInk();

  return (
    <section id="home" aria-labelledby="hero-name" className={cn("grid scroll-mt-16 border-b md:grid-cols-[230px_minmax(0,1fr)]", DASH)}>
      {/* Left column: resume downloads */}
      <div className={cn("order-2 px-5 pb-6 md:order-none md:border-r md:pb-8 md:pt-[300px]", DASH)}>
        {resumes.length > 0 && (
          <div className="md:sticky md:top-20">
            <p className={cn("pf-display text-xl font-bold tracking-tight", FG)}>Resume</p>
            <ul className="mt-2 space-y-1">
              {resumes.map((resume) => (
                <li key={resume.url + resume.label}>
                  <a
                    href={resume.url}
                    download
                    className={cn("inline-flex items-center gap-1.5 rounded-md text-[15px] transition-colors hover:text-[var(--pf-fg)] [&_svg]:size-3.5", MUTED, FOCUS)}
                  >
                    {resume.label}
                    <ArrowDownToLine aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-w-0 px-5 pb-8 pt-5">
        {/* Cover */}
        <Cover image={profile.cover} video={profile.coverVideo} position={profile.coverPosition} />

        {/* Identity */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-4">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className={cn("size-24 shrink-0 rounded-2xl border object-cover object-top sm:size-28", LINE)} />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "pf-display grid size-24 shrink-0 place-items-center rounded-2xl border bg-[var(--pf-fg)] text-3xl font-extrabold text-[var(--pf-bg)] sm:size-28",
                LINE
              )}
            >
              {initialsOf(profile.name)}
            </span>
          )}
          {/* min-w keeps the name block wide enough on phones; the social pill wraps below it. */}
          <div className="min-w-[210px] flex-1">
            <h1 id="hero-name" className={cn("pf-display flex flex-wrap items-center gap-x-2 text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[44px]", FG)}>
              <span>{profile.name}</span>
              {profile.verified && <BadgeCheck className="size-7 shrink-0 fill-sky-500 stroke-[var(--pf-bg)]" aria-label="Verified" />}
            </h1>
            <p className={cn("mt-0.5 text-[15px] leading-snug", MUTED)}>
              <Tagline text={profile.tagline} emphasis={profile.taglineEmphasis} />
            </p>
            <p className={cn("pf-mono mt-2.5 flex flex-wrap items-center gap-x-3 text-[13px]", SUBTLE)}>
              {profile.handle && <span>{profile.handle}</span>}
              {profile.building && (
                <span className={FG}>
                  Building{" "}
                  {profile.building.url ? (
                    <a href={profile.building.url} className={cn("font-semibold underline-offset-4 hover:underline", FOCUS)} {...externalProps(profile.building.url)}>
                      {profile.building.label}
                    </a>
                  ) : (
                    <span className="font-semibold">{profile.building.label}</span>
                  )}
                </span>
              )}
            </p>
          </div>
          {/* Social pill */}
          <ul aria-label="Social links" className={cn("flex items-center gap-0.5 rounded-full border p-1", LINE)}>
            {socials.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  aria-label={social.label}
                  title={social.label}
                  className={cn("grid size-8 place-items-center rounded-full transition-colors hover:bg-[var(--pf-panel)] hover:text-[var(--pf-fg)] [&_svg]:size-4", MUTED, FOCUS)}
                  {...externalProps(social.url)}
                >
                  <SocialIcon platform={social.platform} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Intro bullets */}
        {intro.length > 0 && (
          <ul className={cn("mt-6 space-y-2 text-[15px] leading-relaxed", MUTED)}>
            {intro.map((line) => (
              <li key={line} className="relative pl-5 before:absolute before:left-1 before:top-[0.6em] before:size-2 before:rounded-full before:bg-[var(--pf-l2)]">
                <RichText text={line} />
              </li>
            ))}
          </ul>
        )}

        {/* Info rows */}
        <ul className={cn("mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2", DASH)}>
          <li className="flex min-w-0 items-center gap-3">
            <IconBox>
              <CodeXml />
            </IconBox>
            <span className={cn("pf-mono truncate text-[13px]", FG)}>
              {profile.role}
              {profile.company && (
                <>
                  {" @"}
                  {profile.companyUrl ? (
                    <a href={profile.companyUrl} className={cn("underline-offset-4 hover:underline", FOCUS)} {...externalProps(profile.companyUrl)}>
                      {profile.company.toLowerCase()}
                    </a>
                  ) : (
                    profile.company.toLowerCase()
                  )}
                </>
              )}
            </span>
          </li>
          <li className="flex min-w-0 items-center gap-3">
            <IconBox>
              <Mail />
            </IconBox>
            <a href={`mailto:${profile.email}`} className={cn("pf-mono truncate text-[13px] underline-offset-4 hover:underline", FG, FOCUS)}>
              {profile.email}
            </a>
          </li>
        </ul>

        {/* Featured cards */}
        {featured.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {featured.map((card) => (
              <Featured key={card.url + card.title} card={card} />
            ))}
          </div>
        )}

        {/* Call to action + status */}
        {profile.bookingUrl && (
          // The arrow comes from the empty space to the right of the button: size 0.9 with a 28px
          // "say hello" label needs ~170px there (73·0.9 + 8 + label width), reserved by pr.
          <div className="mt-6 inline-block pr-[170px]">
            <Roughly.Arrow
              placement="right"
              color={ink}
              size={0.9}
              strokeWidth={2}
              label="say hello"
              labelFont={HAND}
              labelFontSize={28}
              animationDelay={900}
              seed={11}
            >
              <LinkButton
                href={onBook ? "#contact" : profile.bookingUrl}
                onClick={
                  onBook
                    ? (event) => {
                        event.preventDefault();
                        onBook();
                      }
                    : undefined
                }
                className="h-9 rounded-lg px-4"
              >
                Book a free call
                <ArrowUpRight aria-hidden="true" />
              </LinkButton>
            </Roughly.Arrow>
          </div>
        )}
        {profile.bookingNote && <p className={cn("mt-3 text-[13px]", MUTED)}>{profile.bookingNote}</p>}
        <p className={cn("pf-mono mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs", MUTED)}>
          {profile.available && (
            <>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                Available for projects
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{profile.location}</span>
          {local && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{local.time}</span>
              <span className={SUBTLE}>// {local.diff}</span>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
