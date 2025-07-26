// src/store/revisionStore.ts
import { create } from "zustand";
import type { SerializedEditorState } from "lexical";

export interface Revision {
  previousEditorState: SerializedEditorState;
  inRevisionNodeKeys: string[];
  revisedNodeKeys: string[];
}

interface RevisionState {
  revision: Revision | null;
  setRevision: (revision: Revision) => void;
  clearRevision: () => void;
}

export const useRevisionStore = create<RevisionState>()((set) => ({
  revision: null,

  setRevision: (revision) => {
    set({ revision });
  },

  clearRevision: () => {
    set({ revision: null });
  },
}));
