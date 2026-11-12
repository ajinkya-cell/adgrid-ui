"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Briefcase, FileText, FolderGit2, Hash, Home, Mail, Moon, Sparkles, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { defaultPortfolioData } from "./defaults";
import { DASH, Gap, INK, InkContext, PageThemeContext, SocialIcon, THEME_CSS } from "./parts";
import { Header, type NavLink } from "./sections/Header";
import { Sidebar } from "./sections/Sidebar";
import { Hero } from "./sections/Hero";
import { Terminal } from "./sections/Terminal";
import { About } from "./sections/About";
import { Stack } from "./sections/Stack";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { GithubActivity } from "./sections/GithubActivity";
import { Education, Recognition, Writing } from "./sections/Lists";
import { Footer } from "./sections/Footer";
import { BookingDialog, Contact } from "./sections/Contact";
import { SearchDialog, type SearchItem } from "./sections/SearchDialog";
import type { PortfolioData, PortfolioProfile } from "./types";

// A developer portfolio template that fuses three portfolios' taste:
// - Layout: section titles in a left column, content in the middle, a sticky right sidebar with
//   search, theme, what's being built and a live index, all on dashed rails.
// - Detail: corner-bracket titles, a plain text nav with an Open-source pill, bullet intro with
//   bold keywords, featured profile cards, a skills marquee, a dotted experience timeline with
//   Active/Done pills, wide project cards.
// - Finish: hatched breaks, Geist + Geist Mono, icon-boxed info rows, "// 1h ahead" local time,
//   a flat contribution graph, light and dark themes.
// All content comes from `data`; the flat props are shortcuts that win over it. Empty lists hide
// their section.

export interface DeveloperPortfolioProps {
  /** All the content. Anything left out falls back to the placeholder developer. */
  data?: Partial<Omit<PortfolioData, "profile">> & { profile?: Partial<PortfolioProfile> };
  name?: string;
  role?: string;
  company?: string;
  location?: string;
  tagline?: string;
  available?: boolean;
  githubUsername?: string;
  /** Starting theme; visitors can flip it. Default "dark". */
  defaultTheme?: "dark" | "light";
  showStack?: boolean;
  showGithub?: boolean;
  showRecognition?: boolean;
  showEducation?: boolean;
  showWriting?: boolean;
  /** Companies shown before "Show more". Default 3. */
  experienceCount?: number;
  className?: string;
}

const pick = <T,>(value: T | undefined, fallback: T) => (value === undefined ? fallback : value);

function scrollToSection(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** The section nearest the top of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join(",");
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

export function DeveloperPortfolio({
  data,
  name,
  role,
  company,
  location,
  tagline,
  available,
  githubUsername,
  defaultTheme = "dark",
  showStack = true,
  showGithub = true,
  showRecognition = true,
  showEducation = true,
  showWriting = true,
  experienceCount = 3,
  className,
}: DeveloperPortfolioProps) {
  const content = useMemo<PortfolioData>(() => {
    const base = { ...defaultPortfolioData, ...data } as PortfolioData;
    const profile: PortfolioProfile = { ...defaultPortfolioData.profile, ...data?.profile };
    return {
      ...base,
      profile: {
        ...profile,
        name: pick(name, profile.name),
        role: pick(role, profile.role),
        company: pick(company, profile.company),
        location: pick(location, profile.location),
        tagline: pick(tagline, profile.tagline),
        available: pick(available, profile.available),
      },
      githubUsername: pick(githubUsername, base.githubUsername),
    };
  }, [data, name, role, company, location, tagline, available, githubUsername]);

  const [theme, setTheme] = useState(defaultTheme);
  useEffect(() => setTheme(defaultTheme), [defaultTheme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const { profile } = content;
  const show = {
    about: content.about.length > 0,
    stack: showStack && content.stack.some((g) => g.items.length > 0),
    experience: content.experience.length > 0,
    projects: content.projects.length > 0,
    github: showGithub && Boolean(content.githubUsername),
    recognition: showRecognition && content.recognition.length > 0,
    education: showEducation && content.education.length > 0,
    writing: showWriting && content.posts.length > 0,
  };

  const nav: NavLink[] = [
    { id: "home", label: "Home" },
    show.about && { id: "about", label: "About" },
    show.experience && { id: "experience", label: "Experience" },
    show.projects && { id: "projects", label: "Projects" },
    show.recognition && { id: "achievements", label: "Achievements" },
    show.github && { id: "github", label: "GitHub" },
    show.writing && { id: "writing", label: "Blog" },
    { id: "contact", label: "Contact" },
  ].filter(Boolean) as NavLink[];
  const activeId = useActiveSection(nav.map((link) => link.id));

  // ⌘K / Ctrl+K opens search. Bound in the capture phase and marked handled, so a host page that
  // also uses ⌘K (like a docs shell) leaves it to the portfolio.
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  const searchItems = useMemo<SearchItem[]>(() => {
    const go = (id: string) => () => window.setTimeout(() => scrollToSection(id), 50);
    const icons: Record<string, React.ReactNode> = {
      home: <Home />,
      about: <User />,
      experience: <Briefcase />,
      projects: <FolderGit2 />,
      achievements: <Award />,
      github: <SocialIcon platform="github" />,
      writing: <BookOpen />,
      contact: <Mail />,
    };
    return [
      ...nav.map((link) => ({ id: `s-${link.id}`, label: link.label, group: "Sections", icon: icons[link.id] ?? <Hash />, onSelect: go(link.id) })),
      ...content.projects.map((p) => ({
        id: `p-${p.name}`,
        label: p.name,
        group: "Projects",
        icon: <Sparkles />,
        keywords: p.tags,
        url: p.liveUrl ?? p.sourceUrl,
        onSelect: p.liveUrl || p.sourceUrl ? undefined : go("projects"),
      })),
      ...(show.writing ? content.posts.map((post) => ({ id: `b-${post.url}-${post.title}`, label: post.title, group: "Blog", icon: <BookOpen />, url: post.url })) : []),
      ...content.resumes.map((r) => ({ id: `r-${r.label}`, label: `Resume · ${r.label}`, group: "Resume", icon: <FileText />, url: r.url })),
      ...content.socials.map((s) => ({ id: `l-${s.url}`, label: s.label, group: "Links", icon: <SocialIcon platform={s.platform} />, url: s.url })),
      { id: "theme", label: "Toggle theme", group: "Settings", icon: <Moon />, onSelect: toggleTheme },
    ];
    // nav is derived from content and the toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, show.writing, show.recognition, show.github, toggleTheme]);

  const sections: React.ReactNode[] = [
    show.about && <About key="about" paragraphs={content.about} highlight={content.aboutHighlight} />,
    show.stack && <Stack key="stack" groups={content.stack} />,
    show.experience && <Experience key="experience" items={content.experience} initialCount={experienceCount} />,
    show.projects && <Projects key="projects" items={content.projects} allUrl={content.projectsUrl} note={content.projectsNote} />,
    show.recognition && <Recognition key="recognition" items={content.recognition} />,
    show.github && <GithubActivity key="github" username={content.githubUsername} />,
    show.education && <Education key="education" items={content.education} />,
    show.writing && <Writing key="writing" posts={content.posts} allUrl={content.blogUrl} />,
  ].filter(Boolean);

  return (
    <div data-theme={theme} className={cn("pf-root min-h-dvh w-full bg-[var(--pf-bg)] text-[var(--pf-fg)]", className)}>
      <style>{THEME_CSS}</style>
      <PageThemeContext.Provider value={theme}>
      <InkContext.Provider value={INK[theme]}>
      <Header nav={nav} activeId={activeId} openSourceUrl={content.openSourceUrl} theme={theme} onToggleTheme={toggleTheme} onOpenSearch={openSearch} />
      <div className={cn("mx-auto grid max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_240px] xl:border-x", DASH)}>
        <main className="min-w-0">
          <Hero
            terminal={<Terminal data={content} theme={theme} onToggleTheme={toggleTheme} onBook={profile.calLink ? openBooking : undefined} />}
            onBook={profile.calLink ? openBooking : undefined}
            profile={profile} intro={content.intro} featured={content.featured} socials={content.socials} resumes={content.resumes} />
          {sections.map((section, i) => (
            <div key={i}>
              <Gap />
              {section}
            </div>
          ))}
          <Contact profile={profile} onBook={profile.calLink ? openBooking : undefined} />
          <Footer profile={profile} socials={content.socials} nav={nav} />
        </main>
        <Sidebar index={nav} activeId={activeId} building={profile.building} theme={theme} onToggleTheme={toggleTheme} onOpenSearch={openSearch} />
      </div>
      <SearchDialog open={searchOpen} onClose={closeSearch} items={searchItems} />
      {profile.calLink && (
        <BookingDialog open={bookingOpen} onClose={closeBooking} calLink={profile.calLink} theme={theme} name={profile.name} />
      )}
      </InkContext.Provider>
      </PageThemeContext.Provider>
    </div>
  );
}

export default DeveloperPortfolio;
