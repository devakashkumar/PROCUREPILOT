import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarOpen: true,

      toggleTheme: () => {
        const nextTheme = get().theme === "light" ? "dark" : "light";

        // View Transition API animation if available
        if (
          typeof document !== "undefined" &&
          "startViewTransition" in document &&
          typeof (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition === "function"
        ) {
          (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
            if (nextTheme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
            set({ theme: nextTheme });
          });
        } else {
          if (typeof document !== "undefined") {
            if (nextTheme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          set({ theme: nextTheme });
        }
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "procurepilot-ui",
    }
  )
);
