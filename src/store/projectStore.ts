import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  owner: string
  repo: string
  branch?: string 
  model?: string
}

interface ProjectStore {
  projects: Project[]
  selectedProject?: Project
  selectedBranch?: string
  selectedFile?: string  
  addProject: (project: Project) => void
  removeProject: (owner: string, repo: string) => void
  clearProjects: () => void
  selectProject: (project: Project) => void
  setSelectedBranch: (branch: string) => void
  setSelectedFile: (filePath: string) => void
  setSelectedModel: (model: string) => void
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
      selectProject: (project) => {
        const newProject = { ...project }
        set({
          selectedProject: newProject,
          selectedBranch: newProject.branch || 'main',
          selectedModel: newProject.model,
        })
      },
      setSelectedBranch: (branch) => {
        const { selectedProject, projects } = get()
        if (!selectedProject) return
        const updatedProjects = projects.map(p =>
          p.owner === selectedProject.owner && p.repo === selectedProject.repo
            ? { ...p, branch: branch }
            : p
        )
        set({
          selectedBranch: branch,
          projects: updatedProjects,
          selectedProject: { ...selectedProject, branch: branch },
        })
      },
      removeProject: (owner, repo) => {
        set((state) => ({
          projects: state.projects.filter(
            (p) => !(p.owner === owner && p.repo === repo)
          ),
        }))
      },
      clearProjects: () => set({ projects: [] }),
      setSelectedFile: (filePath) => set({ selectedFile: filePath }),
      setSelectedModel: (model) => {
        const { selectedProject, projects } = get()
        if (!selectedProject) return
        const updatedProjects = projects.map(p =>
          p.owner === selectedProject.owner && p.repo === selectedProject.repo
            ? { ...p, model: model }
            : p
        )
        set({
          selectedModel: model,
          projects: updatedProjects,
          selectedProject: { ...selectedProject, model: model },
        })
      },
    }),
    {
      name: 'project-store', // localStorage key
    }
  )
)