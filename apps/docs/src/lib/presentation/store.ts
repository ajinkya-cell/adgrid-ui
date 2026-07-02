import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BackgroundMode = "solid" | "noise" | "grid" | "dotGrid" | "gradient" | "aurora";
export type DisplayStrategy = "center" | "fullscreen" | "cover" | "fit" | "auto";

export interface PresentationSettings {
  backgroundMode: BackgroundMode;
  showSafeArea: boolean;
  showRulers: boolean;
  showGuides: boolean;
  showFPS: boolean;
  reduceMotion: boolean;
}

export interface PresentationState {
  // Core state
  isActive: boolean;
  componentSlug: string | null;
  componentCategory: string | null;
  
  // UI state
  sidebarOpen: boolean;
  dockVisible: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  shortcutsOpen: boolean;
  
  // Navigation
  history: Array<{ slug: string; category: string }>;
  favorites: string[];
  
  // Settings
  settings: PresentationSettings;
  
  // Actions
  enterPresentation: (slug: string, category: string) => void;
  exitPresentation: () => void;
  toggleSidebar: () => void;
  setDockVisible: (visible: boolean) => void;
  toggleCommandPalette: () => void;
  toggleSettings: () => void;
  toggleShortcuts: () => void;
  navigateToComponent: (slug: string, category: string) => void;
  toggleFavorite: (slug: string) => void;
  updateSettings: (settings: Partial<PresentationSettings>) => void;
  goBack: () => void;
  goForward: () => void;
}

const defaultSettings: PresentationSettings = {
  backgroundMode: "solid",
  showSafeArea: false,
  showRulers: false,
  showGuides: false,
  showFPS: false,
  reduceMotion: false,
};

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      componentSlug: null,
      componentCategory: null,
      
      sidebarOpen: false,
      dockVisible: true,
      commandPaletteOpen: false,
      settingsOpen: false,
      shortcutsOpen: false,
      
      history: [],
      favorites: [],
      
      settings: defaultSettings,
      
      // Actions
      enterPresentation: (slug, category) => {
        set({
          isActive: true,
          componentSlug: slug,
          componentCategory: category,
          history: [...get().history, { slug, category }],
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
      
      navigateToComponent: (slug, category) => {
        const current = get();
        const newHistory = [
          ...current.history,
          { slug, category },
        ];
        
        set({
          componentSlug: slug,
          componentCategory: category,
          history: newHistory,
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
      
      updateSettings: (newSettings) => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },
      
      goBack: () => {
        const history = get().history;
        if (history.length > 1) {
          const newHistory = history.slice(0, -1);
          const previous = newHistory[newHistory.length - 1];
          
          set({
            componentSlug: previous.slug,
            componentCategory: previous.category,
            history: newHistory,
          });
        }
      },
      
      goForward: () => {
        // Implement forward navigation if needed
      },
    }),
    {
      name: "void-ui-presentation",
      partialize: (state) => ({
        favorites: state.favorites,
        settings: state.settings,
      }),
    }
  )
);
