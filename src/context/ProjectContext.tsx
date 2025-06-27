"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ProjectContextType {
  currentOwner: string | null;
  setCurrentOwner: (owner: string | null) => void;
  currentRepo: string | null;
  setCurrentRepo: (repo: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [currentOwner, setCurrentOwner] = useState<string | null>(null);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);

  return (
    <ProjectContext.Provider value={{
      currentOwner,
      setCurrentOwner,
      currentRepo,
      setCurrentRepo,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
