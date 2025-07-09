import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  owner: string
  repo: string
  branch?: string // optional for now
}

interface ProjectStore {
  projects: Project[]
  addProject: (project: Project) => void
  removeProject: (owner: string, repo: string) => void
  clearProjects: () => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) => {
        const exists = get().projects.some(
          (p) => p.owner === project.owner && p.repo === project.repo
        )
        if (!exists) {
          set((state) => ({
            projects: [...state.projects, project],
          }))
        }
      },
      removeProject: (owner, repo) => {
        set((state) => ({
          projects: state.projects.filter(
            (p) => !(p.owner === owner && p.repo === repo)
          ),
        }))
      },
      clearProjects: () => set({ projects: [] }),
    }),
    {
      name: 'project-store', // localStorage key
    }
  )
)