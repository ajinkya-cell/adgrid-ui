"use client";

import { LayoutGroup } from "framer-motion";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";
import { CommandPalette } from "@/components/presentation/CommandPalette";
import { presentationEntries } from "@/components/presentation/presentation-registry";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIsolated = pathname.startsWith("/present") || pathname.startsWith("/embed");

  return (
    <LayoutGroup id="site-shell">
      {!isIsolated && (
        <>
          <Navbar />
          <CommandPalette entry={presentationEntries[0]!} mode="site" />
        </>
      )}
      <div className="min-h-screen flex flex-col">
        {isIsolated ? children : <PageTransition>{children}</PageTransition>}
      </div>
    </LayoutGroup>
  );
}
