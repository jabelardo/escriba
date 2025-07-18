import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  githubToken: string | null;
  setGithubToken: (token: string) => void;
  clearGithubToken: () => void;

  openrouterKey: string | null;
  setOpenrouterKey: (key: string) => void;
  clearOpenrouterKey: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      githubToken: import.meta.env.VITE_GITHUB_TOKEN || null,
      setGithubToken: (token) => set({ githubToken: token }),
      clearGithubToken: () => set({ githubToken: null }),

      openrouterKey: import.meta.env.VITE_OPENROUTER_KEY || null,
      setOpenrouterKey: (key) => set({ openrouterKey: key }),
      clearOpenrouterKey: () => set({ openrouterKey: null }),
    }),
    {
      name: "auth-storage", // localStorage key
    },
  ),
);
