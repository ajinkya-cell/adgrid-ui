"use client";

import { LayoutGroup } from "framer-motion";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { PageTransition } from "@/components/site/PageTransition";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const presenting = pathname.startsWith("/present");

  return (
    <LayoutGroup id="site-shell">
      {!presenting && <Navbar />}
      <div className={`${presenting ? "" : "pt-16"} min-h-screen flex flex-col`}>
        {presenting ? children : <PageTransition>{children}</PageTransition>}
      </div>
    </LayoutGroup>
  );
}

