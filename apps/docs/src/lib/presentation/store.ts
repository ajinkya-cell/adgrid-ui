import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BackgroundMode = "solid" | "noise" | "grid" | "dotGrid" | "gradient" | "aurora" | "moonArc";
export type DisplayStrategy = "center" | "fullscreen" | "cover" | "fit" | "auto";

export interface PresentationSettings {
  backgroundMode: BackgroundMode;
  canvasColor: string;
  showSafeArea: boolean;
  showRulers: boolean;
  showGuides: boolean;
  showFPS: boolean;
  reduceMotion: boolean;
  playTactileSounds: boolean;
}

export interface PresentationState {
  // Core state
  isActive: boolean;
  componentSlug: string | null;
  componentCategory: string | null;
  
  // UI state
  sidebarOpen: boolean;
  sidebarTab: "navigator" | "code" | "props" | "install";
  dockVisible: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  shortcutsOpen: boolean;
  propsTweakerOpen: boolean;
  
  scrollContainer: HTMLElement | null;
  
  // Navigation
  history: Array<{ slug: string; category: string }>;
  historyIndex: number;
  favorites: string[];
  recent: Array<{ slug: string; category: string; visitedAt: number }>;
  componentProps: Record<string, Record<string, unknown>>;
  
  // Settings
  settings: PresentationSettings;
  
  // Actions
  enterPresentation: (slug: string, category: string) => void;
  exitPresentation: () => void;
  toggleSidebar: () => void;
  setSidebarTab: (tab: "navigator" | "code" | "props" | "install") => void;
  openSidebarTab: (tab: "navigator" | "code" | "props" | "install") => void;
  setDockVisible: (visible: boolean) => void;
  toggleCommandPalette: () => void;
  toggleSettings: () => void;
  toggleShortcuts: () => void;
  togglePropsTweaker: () => void;
  navigateToComponent: (slug: string, category: string) => void;
  toggleFavorite: (slug: string) => void;
  setComponentProp: (slug: string, name: string, value: unknown) => void;
  resetComponentProps: (slug: string, defaults: Record<string, unknown>) => void;
  updateSettings: (settings: Partial<PresentationSettings>) => void;
  resetPresentation: () => void;
  goBack: () => void;
  goForward: () => void;
  setScrollContainer: (el: HTMLElement | null) => void;
}

const defaultSettings: PresentationSettings = {
  backgroundMode: "solid",
  canvasColor: "#111111",
  showSafeArea: false,
  showRulers: false,
  showGuides: false,
  showFPS: false,
  reduceMotion: false,
  playTactileSounds: true,
};

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      componentSlug: null,
      componentCategory: null,
      
      sidebarOpen: false,
      sidebarTab: "navigator",
      dockVisible: true,
      commandPaletteOpen: false,
      settingsOpen: false,
      shortcutsOpen: false,
      propsTweakerOpen: false,
      
      scrollContainer: null,
      
      history: [],
      historyIndex: -1,
      favorites: [],
      recent: [],
      componentProps: {},
      
      settings: defaultSettings,
      
      // Actions
      enterPresentation: (slug, category) => {
        const recent = get().recent.filter((item) => item.slug !== slug);
        set({
          isActive: true,
          componentSlug: slug,
          componentCategory: category,
          history: [{ slug, category }],
          historyIndex: 0,
          recent: [{ slug, category, visitedAt: Date.now() }, ...recent].slice(0, 12),
        });
      },
      
      exitPresentation: () => {
        set({
          isActive: false,
          sidebarOpen: false,
          commandPaletteOpen: false,
          settingsOpen: false,
          shortcutsOpen: false,
        });
      },
      
      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen });
      },
      
      setSidebarTab: (tab) => {
        set({ sidebarTab: tab });
      },
      
      openSidebarTab: (tab) => {
        set({ sidebarOpen: true, sidebarTab: tab });
      },
      
      setDockVisible: (visible) => {
        set({ dockVisible: visible });
      },
      
      toggleCommandPalette: () => {
        set({ commandPaletteOpen: !get().commandPaletteOpen });
      },
      
      toggleSettings: () => {
        set({ settingsOpen: !get().settingsOpen });
      },
      
      toggleShortcuts: () => {
        set({ shortcutsOpen: !get().shortcutsOpen });
      },

      togglePropsTweaker: () => {
        set({ propsTweakerOpen: !get().propsTweakerOpen });
      },
      
      navigateToComponent: (slug, category) => {
        const current = get();
        const active = current.history[current.historyIndex];
        const recent = current.recent.filter((item) => item.slug !== slug);
        const baseHistory = current.history.slice(0, current.historyIndex + 1);
        const newHistory =
          active?.slug === slug && active?.category === category
            ? baseHistory
            : [...baseHistory, { slug, category }];
        
        set({
          isActive: true,
          componentSlug: slug,
          componentCategory: category,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          recent: [{ slug, category, visitedAt: Date.now() }, ...recent].slice(0, 12),
        });
      },
      
      toggleFavorite: (slug) => {
        const favorites = get().favorites;
        const isFavorite = favorites.includes(slug);
        
        set({
          favorites: isFavorite
            ? favorites.filter((f) => f !== slug)
            : [...favorites, slug],
        });
      },

      setComponentProp: (slug, name, value) => {
        const componentProps = get().componentProps;
        set({
          componentProps: {
            ...componentProps,
            [slug]: {
              ...(componentProps[slug] ?? {}),
              [name]: value,
            },
          },
        });
      },

      resetComponentProps: (slug, defaults) => {
        const componentProps = get().componentProps;
        set({
          componentProps: {
            ...componentProps,
            [slug]: { ...defaults },
          },
        });
      },
      
      updateSettings: (newSettings) => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },

      setScrollContainer: (el) => {
        set({ scrollContainer: el });
      },

      resetPresentation: () => {
        set({
          sidebarOpen: false,
          dockVisible: true,
          commandPaletteOpen: false,
          settingsOpen: false,
          shortcutsOpen: false,
          propsTweakerOpen: false,
          settings: defaultSettings,
        });
      },
      
      goBack: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const previous = history[historyIndex - 1];
          
          set({
            componentSlug: previous.slug,
            componentCategory: previous.category,
            historyIndex: historyIndex - 1,
          });
        }
      },
      
      goForward: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const next = history[historyIndex + 1];
          set({
            componentSlug: next.slug,
            componentCategory: next.category,
            historyIndex: historyIndex + 1,
          });
        }
      },
    }),
    {
      name: "void-ui-presentation",
      partialize: (state) => ({
        favorites: state.favorites,
        recent: state.recent,
        componentProps: state.componentProps,
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
        sidebarTab: state.sidebarTab,
        propsTweakerOpen: state.propsTweakerOpen,
      }),
    }
  )
);
