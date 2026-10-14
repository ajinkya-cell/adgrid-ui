"use client";

import { LayoutGroup } from "framer-motion";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";
import { SiteSearch } from "@/components/site/SiteSearch";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIsolated = pathname.startsWith("/present") || pathname.startsWith("/embed");

  return (
    <LayoutGroup id="site-shell">
      {!isIsolated && (
        <>
          <Navbar />
          <SiteSearch />
        </>
      )}
      <div className="min-h-screen flex flex-col">
        {isIsolated ? children : <PageTransition>{children}</PageTransition>}
      </div>
    </LayoutGroup>
  );
}
