// src/store/revisionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SerializedEditorState } from "lexical";

export interface Revision {
  previousEditorState: SerializedEditorState;
  inRevisionNodeKeys: string[];
  revisedNodeKey: string;
}

interface RevisionState {
  revisions: Record<string, Revision>;
  setRevision: (fileKey: string, revision: Revision) => void;
  getRevision: (fileKey: string) => Revision | null;
  clearRevision: (fileKey: string) => void;
  hasRevision: (fileKey: string) => boolean;
}

export const useRevisionStore = create<RevisionState>()(
  persist(
    (set, get) => ({
      revisions: {},

      setRevision: (fileKey, revision) =>
        set((state) => ({
          revisions: { ...state.revisions, [fileKey]: revision },
        })),

      getRevision: (fileKey) => get().revisions[fileKey] ?? null,

      clearRevision: (fileKey) =>
        set((state) => {
          const { [fileKey]: _, ...rest } = state.revisions;
          return { revisions: rest };
        }),

      hasRevision: (fileKey) => fileKey in get().revisions,
    }),
    {
      name: "escriba-revision",
    },
  ),
);
