"use client";

import { useState, useEffect } from "react";
import GithubAuthSetup from "@/components/GithubAuthSetup";
import Provider from "./Provider";
import { ProjectProvider } from "@/context/ProjectContext";
import { MarkdownProvider } from "@/context/MarkdownContext";
import Sidebar from "@/components/Sidebar";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasGithubCredentials, setHasGithubCredentials] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkGithubCredentials = async () => {
    try {
      const response = await fetch("/api/check-github-credentials");
      const data = await response.json();
      setHasGithubCredentials(data.hasGithubCredentials);
    } catch (error) {
      console.error("Failed to check GitHub credentials:", error);
      setHasGithubCredentials(false); // Assume no credentials on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkGithubCredentials();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!hasGithubCredentials) {
    return <GithubAuthSetup onSetupComplete={checkGithubCredentials} />;
  }

  return (
    <Provider>
      <ProjectProvider>
        <MarkdownProvider>
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </MarkdownProvider>
      </ProjectProvider>
    </Provider>
  );
}
