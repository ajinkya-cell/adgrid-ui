"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bug, Layers, User } from "lucide-react";
import { CommandPalette, type CommandItem } from "@adgrid-ui/ui";
import { usePresentationStore } from "@/lib/presentation/store";
import { presentationEntries } from "@/components/presentation/presentation-registry";
import { usePresentation } from "@/components/presentation/hooks/usePresentation";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const componentUrl = (entry: { category: string; slug: string }) => `/present/${entry.category}/${entry.slug}`;

/** The site-wide ⌘K search, opened from the Navbar. */
export function SiteSearch() {
  const router = useRouter();
  const open = usePresentationStore((state) => state.commandPaletteOpen);
  const presentation = usePresentation(presentationEntries[0]!);

  const items = useMemo<CommandItem[]>(
    () => [
      {
        id: "conn-github",
        label: "GitHub",
        category: "Connect",
        description: "github.com/ajinkya-cell",
        url: "https://github.com/ajinkya-cell",
        isExternal: true,
        icon: <GithubIcon />,
      },
      {
        id: "conn-linkedin",
        label: "LinkedIn",
        category: "Connect",
        description: "linkedin.com/in/ajinkya",
        url: "https://linkedin.com",
        isExternal: true,
        icon: <LinkedinIcon />,
      },
      {
        id: "conn-x",
        label: "X",
        category: "Connect",
        description: "x.com",
        url: "https://x.com",
        isExternal: true,
        icon: <XIcon />,
        keywords: ["twitter"],
      },
      {
        id: "conn-portfolio",
        label: "Portfolio",
        category: "Connect",
        description: "ajinkya.org",
        url: "https://ajinkya.org",
        isExternal: true,
        icon: <User />,
      },
      ...presentationEntries.map((entry) => ({
        id: `comp-${entry.category}-${entry.slug}`,
        label: entry.name,
        category: "Components",
        description: entry.description,
        url: componentUrl(entry),
        icon: <Layers />,
        keywords: [entry.slug, entry.category],
      })),
      {
        id: "act-issues",
        label: "Report a bug",
        category: "Support",
        description: "Open the bug report form",
        url: "/issues",
        icon: <Bug />,
        keywords: ["issue", "feedback"],
      },
    ],
    []
  );

  // Components go through the presentation store so the viewer opens on the right entry.
  const navigate = (url: string) => {
    const entry = presentationEntries.find((candidate) => componentUrl(candidate) === url);
    if (entry) presentation.navigateTo(entry);
    else router.push(url);
  };

  return (
    <CommandPalette
      isOpen={open}
      onClose={() => {
        const store = usePresentationStore.getState();
        if (store.commandPaletteOpen) store.toggleCommandPalette();
      }}
      items={items}
      placeholder="Search components and links…"
      onNavigate={navigate}
    />
  );
}
