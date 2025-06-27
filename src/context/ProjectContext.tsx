"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface UserProject {
  id: string;
  owner: string;
  name: string;
}

interface ProjectContextType {
  currentOwner: string | null;
  setCurrentOwner: (owner: string | null) => void;
  currentRepo: string | null;
  setCurrentRepo: (repo: string | null) => void;
  userProjects: UserProject[];
  addUserProject: (owner: string, repo: string) => void;
  loadUserProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [currentOwner, setCurrentOwner] = useState<string | null>(null);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);

  const LOCAL_STORAGE_KEY = "escriba_user_projects";

  const loadUserProjects = () => {
    if (typeof window !== "undefined") {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProjects) {
        setUserProjects(JSON.parse(storedProjects));
      }
    }
  };

  const addUserProject = (owner: string, repo: string) => {
    const newProject: UserProject = {
      id: `${owner}/${repo}`,
      owner: owner,
      name: repo,
    };
    setUserProjects((prevProjects) => {
      const updatedProjects = [...prevProjects, newProject];
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
      }
      return updatedProjects;
    });
  };

  useEffect(() => {
    loadUserProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{
      currentOwner,
      setCurrentOwner,
      currentRepo,
      setCurrentRepo,
      userProjects,
      addUserProject,
      loadUserProjects,
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
