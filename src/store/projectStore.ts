import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Project {
  owner: string;
  repo: string;
  branch?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProjectFile {
  filePath: string;
  content: string;
  sha: string;
}

export interface EditorFile extends ProjectFile {
  currentContent: string;
}

interface ProjectStore {
  projects: Project[];
  selectedProject?: Project;
  selectedBranch?: string;
  selectedFile?: EditorFile;
  contextFileContents?: ProjectFile[];
  isSelectedFileChanged: () => boolean;
  addProject: (project: Project) => void;
  removeProject: (project: Project) => void;
  clearProjects: () => void;
  selectProject: (project: Project) => void;
  setSelectedBranch: (branch: string) => void;
  setSelectedFile: (selectedFile: EditorFile) => void;
  setSelectedFileCurrentContent: (currentContent: string) => void;
  setSelectedFileSha: (sha: string) => void;
  setSelectedModel: (model: string) => void;
  setContextFileContents: (contextFileContents: ProjectFile[]) => void;
  setMaxTokens: (maxTokens: number) => void;
  setTemperature: (temperature: number) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      isSelectedFileChanged: () => {
        const { selectedFile } = get();
        if (!selectedFile) {
          return false;
        }
        return selectedFile.content !== selectedFile.currentContent;
      },
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
          selectedFile: undefined,
          contextFileContents: undefined,
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
      setSelectedFile: (selectedFile) => {
        set({ selectedFile: { ...selectedFile, currentContent: selectedFile.content } });
      },
      setSelectedFileCurrentContent: (currentContent) => {
        const { selectedFile } = get();
        if (!selectedFile) {
          return;
        }
        set({ selectedFile: { ...selectedFile, currentContent: currentContent } });
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
      setContextFileContents: (newContextFileContents: ProjectFile[]) => {
        const { contextFileContents } = get();

        if (
          (!contextFileContents && !newContextFileContents) ||
          (contextFileContents?.length === 0 &&
            newContextFileContents.length === 0)
        ) {
          return;
        }
        if (newContextFileContents?.length > 0) {
          newContextFileContents = newContextFileContents.sort((a, b) =>
            a.filePath.localeCompare(b.filePath),
          );
        }
        set({ contextFileContents: newContextFileContents });
      },
      setMaxTokens: (maxTokens) => {
        const { selectedProject, projects } = get();
        if (!selectedProject) {
          return;
        }
        const updatedProjects = projects.map((p) =>
          p.owner === selectedProject.owner && p.repo === selectedProject.repo
            ? { ...p, maxTokens: maxTokens }
            : p,
        );
        set({
          projects: updatedProjects,
          selectedProject: { ...selectedProject, maxTokens: maxTokens },
        });
      },
      setTemperature: (temperature) => {
        const { selectedProject, projects } = get();
        if (!selectedProject) {
          return;
        }
        const updatedProjects = projects.map((p) =>
          p.owner === selectedProject.owner && p.repo === selectedProject.repo
            ? { ...p, temperature: temperature }
            : p,
        );
        set({
          projects: updatedProjects,
          selectedProject: { ...selectedProject, temperature: temperature },
        });
      },
    }),
    {
      name: "project-store", // localStorage key
    },
  ),
);
