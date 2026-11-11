import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  theme: "dark" | "light";
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const applyThemeToDOM = (theme: "dark" | "light") => {
  if (typeof document === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      sidebarOpen: true,

      toggleTheme: () => {
        const nextTheme = get().theme === "dark" ? "light" : "dark";

        if (
          typeof document !== "undefined" &&
          "startViewTransition" in document &&
          typeof (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition === "function"
        ) {
          (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
            applyThemeToDOM(nextTheme);
            set({ theme: nextTheme });
          });
        } else {
          applyThemeToDOM(nextTheme);
          set({ theme: nextTheme });
        }
      },

      setTheme: (theme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "procurepilot-ui",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);
