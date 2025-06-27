"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

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
  const [currentOwner, _setCurrentOwner] = useState<string | null>(null);
  const [currentRepo, _setCurrentRepo] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);

  const LOCAL_STORAGE_KEY_PROJECTS = "escriba_user_projects";
  const LOCAL_STORAGE_KEY_CURRENT_OWNER = "escriba_current_owner";
  const LOCAL_STORAGE_KEY_CURRENT_REPO = "escriba_current_repo";

  const loadUserProjects = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (storedProjects) {
        setUserProjects(JSON.parse(storedProjects));
      }
      const storedOwner = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_OWNER);
      const storedRepo = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_REPO);
      if (storedOwner) {
        _setCurrentOwner(storedOwner);
      }
      if (storedRepo) {
        _setCurrentRepo(storedRepo);
      }
    }
  }, [setUserProjects, _setCurrentOwner, _setCurrentRepo]);

  const setCurrentOwner = useCallback((owner: string | null) => {
    _setCurrentOwner(owner);
    if (typeof window !== "undefined") {
      if (owner) {
        localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_OWNER, owner);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_OWNER);
      }
    }
  }, []);

  const setCurrentRepo = useCallback((repo: string | null) => {
    _setCurrentRepo(repo);
    if (typeof window !== "undefined") {
      if (repo) {
        localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_REPO, repo);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_REPO);
      }
    }
  }, []);

  const addUserProject = useCallback((owner: string, repo: string) => {
    const newProject: UserProject = {
      id: `${owner}/${repo}`,
      owner: owner,
      name: repo,
    };
    setUserProjects((prevProjects) => {
      const updatedProjects = [...prevProjects, newProject];
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
      }
      return updatedProjects;
    });
  }, [setUserProjects, LOCAL_STORAGE_KEY_PROJECTS]);

  useEffect(() => {
    loadUserProjects();
  }, [loadUserProjects]);

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
