import { create } from "zustand";
import type { FileTreeNode } from "@/lib/github/filetree";

interface FileStore {
  fileTree: FileTreeNode | null;
  setFileTree: (fileTree: FileTreeNode) => void;
  fetchFileTree: (token: string, owner: string, repo: string) => Promise<void>;
}

export const useFileStore = create<FileStore>((set) => ({
  fileTree: null,
  setFileTree: (fileTree) => {
    set({ fileTree });
  },
  fetchFileTree: async (token, owner, repo) => {
    const { fetchProjectFileTree } = await import("@/lib/github/filetree");
    const fileTree = await fetchProjectFileTree(token, owner, repo);
    const root: FileTreeNode = {
      id: "ROOT",
      name: "",
      type: "folder",
      children: fileTree,
    };
    set({ fileTree: root });
  },
}));
