"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface MarkdownContextType {
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  currentFilePath: string | null;
  setCurrentFilePath: (path: string | null) => void;
  currentFileSha: string | null;
  setCurrentFileSha: (sha: string | null) => void;
  currentBranch: string | null;
  setCurrentBranch: (branch: string | null) => void;
  selectedContextFiles: string[];
  toggleContextFile: (filePath: string) => void;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const MarkdownProvider = ({ children }: { children: ReactNode }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [currentFileSha, setCurrentFileSha] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);
  const [selectedContextFiles, setSelectedContextFiles] = useState<string[]>([]);

  const toggleContextFile = (filePath: string) => {
    setSelectedContextFiles((prevSelected) =>
      prevSelected.includes(filePath)
        ? prevSelected.filter((path) => path !== filePath)
        : [...prevSelected, filePath]
    );
  };

  return (
    <MarkdownContext.Provider value={{
      markdownContent,
      setMarkdownContent,
      currentFilePath,
      setCurrentFilePath,
      currentFileSha,
      setCurrentFileSha,
      currentBranch,
      setCurrentBranch,
      selectedContextFiles,
      toggleContextFile,
    }}>
      {children}
    </MarkdownContext.Provider>
  );
};

export const useMarkdown = () => {
  const context = useContext(MarkdownContext);
  if (context === undefined) {
    throw new Error('useMarkdown must be used within a MarkdownProvider');
  }
  return context;
};
