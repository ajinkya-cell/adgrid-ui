"use client";

import React, { createContext, useContext, useState } from "react";

const ComponentPageContext = createContext<{
  isWide: boolean;
  setIsWide: (wide: boolean) => void;
} | null>(null);

export function ComponentPageProvider({
  defaultWide,
  children,
}: {
  defaultWide: boolean;
  children: React.ReactNode;
}) {
  const [isWide, setIsWide] = useState(defaultWide);

  return (
    <ComponentPageContext.Provider value={{ isWide, setIsWide }}>
      {children}
    </ComponentPageContext.Provider>
  );
}

export function useComponentPage() {
  const context = useContext(ComponentPageContext);
  if (!context) {
    return { isWide: false, setIsWide: () => {} };
  }
  return context;
}

export function ComponentPageMain({ children }: { children: React.ReactNode }) {
  const { isWide } = useComponentPage();
  return (
    <main
      className={`flex-1 min-w-0 px-8 py-12 transition-all duration-300 ${
        isWide ? "max-w-7xl" : "max-w-4xl"
      }`}
    >
      {children}
    </main>
  );
}

export function ComponentPageSidebar({ children }: { children: React.ReactNode }) {
  const { isWide } = useComponentPage();
  if (isWide) return null;
  return (
    <aside className="hidden xl:block w-64 shrink-0 border-l border-border-hairline px-8 py-12 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto select-none">
      {children}
    </aside>
  );
}

export function WideViewToggle() {
  const { isWide, setIsWide } = useComponentPage();
  return (
    <button
      onClick={() => setIsWide(!isWide)}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-border-hairline bg-surface-charcoal text-text-muted hover:text-white rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer select-none shrink-0"
      title={isWide ? "Exit wide preview" : "Enter wide preview"}
    >
      <span className="material-symbols-outlined text-[14px]">
        {isWide ? "close_fullscreen" : "open_in_full"}
      </span>
      <span>{isWide ? "Normal View" : "Wide View"}</span>
    </button>
  );
}
