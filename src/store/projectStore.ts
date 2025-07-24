import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Project {
  owner: string;
  repo: string;
  branch?: string;
  model?: string;
}

export interface ProjectFile {
  filePath: string;
  content: string;
  sha: string;
}

interface ProjectStore {
  projects: Project[];
  selectedProject?: Project;
  selectedBranch?: string;
  selectedFile?: ProjectFile;
  addProject: (project: Project) => void;
  removeProject: (project: Project) => void;
  clearProjects: () => void;
  selectProject: (project: Project) => void;
  setSelectedBranch: (branch: string) => void;
  setSelectedFile: (projectFile: ProjectFile) => void;
  setSelectedFileContent: (content: string) => void;
  setSelectedFileSha: (sha: string) => void;
  setSelectedModel: (model: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) => {
        const exists = get().projects.some(
          (p) => p.owner === project.owner && p.repo === project.repo,
        );
        if (!exists) {
          set((state) => ({
            projects: [...state.projects, project],
          }));
        }
      },
      selectProject: (project) => {
        set({
          selectedProject: project,
          selectedBranch: project.branch || "main",
        });
      },
      setSelectedBranch: (branch) => {
        const { selectedProject, projects } = get();
        if (!selectedProject) {
          return;
        }
        const updatedProjects = projects.map((p) =>
          p.owner === selectedProject.owner && p.repo === selectedProject.repo
            ? { ...p, branch: branch }
            : p,
        );
        set({
          selectedBranch: branch,
          projects: updatedProjects,
          selectedProject: { ...selectedProject, branch: branch },
        });
      },
      removeProject: (project) => {
        set((state) => ({
          projects: state.projects.filter((p) => !(p === project)),
        }));
      },
      clearProjects: () => {
        set({ projects: [] });
      },
      setSelectedFile: (projectFile) => {
        set({ selectedFile: projectFile });
      },
      setSelectedFileContent: (content) => {
        const { selectedFile } = get();
        if (!selectedFile) {
          return;
        }
        set({ selectedFile: { ...selectedFile, content: content } });
      },
      setSelectedFileSha: (sha) => {
        const { selectedFile } = get();
        if (!selectedFile) {
          return;
        }
        set({ selectedFile: { ...selectedFile, sha: sha } });
      },
      setSelectedModel: (model) => {
        const { selectedProject, projects } = get();
        if (!selectedProject) {
          return;
        }
        const updatedProjects = projects.map((p) =>
          p.owner === selectedProject.owner && p.repo === selectedProject.repo
            ? { ...p, model: model }
            : p,
        );
        set({
          projects: updatedProjects,
          selectedProject: { ...selectedProject, model: model },
        });
      },
    }),
    {
      name: "project-store", // localStorage key
    },
  ),
);
