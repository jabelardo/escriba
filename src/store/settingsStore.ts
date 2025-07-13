// store/settingsStore.ts
import type { Prompt } from '@/types/settings'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  openrouterKey: string
  githubToken: string
  favoriteModels: string[]
  systemPrompts: Prompt[]
  continuePrompts: Prompt[]
  revisePrompts: Prompt[]
  activeSystemPrompt: Prompt | undefined
  activeContinuePrompt: Prompt | undefined
  activeRevisePrompt: Prompt | undefined
  setOpenrouterKey: (k: string) => void
  setGithubToken: (t: string) => void
  setFavoriteModels: (ids: string[]) => void
  setActiveSystemPrompt: (prompt: Prompt) => void
  setActiveContinuePrompt: (prompt: Prompt) => void
  setActiveRevisePrompt: (prompt: Prompt) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist((set) => ({
    openrouterKey: '',
    githubToken: '',
    favoriteModels: [],
    systemPrompts: [],
    continuePrompts: [],
    revisePrompts: [],
    activeSystemPrompt: undefined,
    activeContinuePrompt: undefined,
    activeRevisePrompt: undefined,
    setOpenrouterKey: (openrouterKey) => set({ openrouterKey }),
    setGithubToken: (githubToken) => set({ githubToken }),
    setFavoriteModels: (favoriteModels) => set({ favoriteModels }),
    setActiveSystemPrompt: (activeSystemPrompt) => set({ activeSystemPrompt }),
    setActiveContinuePrompt: (activeContinuePrompt) => set({ activeContinuePrompt }),
    setActiveRevisePrompt: (activeRevisePrompt) => set({ activeRevisePrompt }),
  }), {
    name: 'escriba-settings',
  })
)
