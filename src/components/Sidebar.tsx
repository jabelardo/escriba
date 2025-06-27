"use client";

import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useMarkdown } from "@/context/MarkdownContext";
import { useProject } from "@/context/ProjectContext";

interface FileContent {
  name: string;
  path: string;
  type: "file" | "dir";
  sha?: string;
}

export default function Sidebar() {
  const { data: session } = useSession();
  const { setMarkdownContent, setCurrentFilePath, setCurrentFileSha, markdownContent, currentBranch, setCurrentBranch, selectedContextFiles, toggleContextFile } = useMarkdown();
  const { currentOwner, currentRepo, setCurrentOwner, setCurrentRepo } = useProject();
  const [repoContents, setRepoContents] = useState<FileContent[]>([]);
  const [folderContents, setFolderContents] = useState<Map<string, FileContent[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);
  const [newFileParentFolder, setNewFileParentFolder] = useState<"books" | "references">("books");

  const fetchUserProjects = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const response = await fetch("/api/user/repos");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUserProjects(data);
    } catch (error) {
      console.error("Error fetching user projects:", error);
    }
  }, [session]);

  const handleAddProject = async () => {
    if (!session?.accessToken || !newProjectName) {
      alert("Please enter a project name (owner/repo-name).");
      return;
    }
    const [owner, repo] = newProjectName.split('/');
    if (!owner || !repo) {
      alert("Invalid project name format. Please use owner/repo-name.");
      return;
    }

    try {
      // This assumes you have an API endpoint to register/add a project
      // For now, we'll just simulate adding it to the list and clear the input
      // In a real application, you'd make a POST request to your backend
      // to associate this repo with the user.
      alert(`Project ${newProjectName} added (simulated).`);
      setNewProjectName('');
      fetchUserProjects(); // Refresh the list of projects
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Error adding project.");
    }
  };

  const handleProjectSelect = (owner: string, repo: string) => {
    setCurrentOwner(owner);
    setCurrentRepo(repo);
  };

  const fetchRepoContents = useCallback(async (path = "") => {
    if (!session?.accessToken || !currentOwner || !currentRepo) return [];

    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/${path}?ref=${currentBranch}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FileContent[] = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching repo contents for ${path}:`, error);
      return [];
    }
  }, [session, currentOwner, currentRepo, currentBranch]);

  const fetchBranches = useCallback(async () => {
    if (!session?.accessToken || !currentOwner || !currentRepo) return;
    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/branches`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBranches(data);
      if (data.length > 0) {
        setCurrentBranch(data[0].name); // Select the first branch by default
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, [session, currentOwner, currentRepo, setCurrentBranch]);

  

  useEffect(() => {
    const loadInitialData = async () => {
      if (session?.accessToken) {
        await fetchUserProjects();
      }

      if (currentOwner && currentRepo) {
        setLoading(true);
        const contents = await fetchRepoContents();
        setRepoContents(contents);
        await fetchBranches();
        setLoading(false);
      } else {
        setRepoContents([]);
        setBranches([]);
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchRepoContents, fetchBranches, fetchUserProjects, currentOwner, currentRepo, session?.accessToken]);

  

  const toggleFolder = async (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });

    if (!folderContents.has(path)) {
      const data = await fetchRepoContents(path);
      setFolderContents((prev) => new Map(prev).set(path, data));
    }
  };

  const handleLoadMd = async (filePath: string, fileSha?: string) => {
    if (!session?.accessToken || !currentOwner || !currentRepo) return;

    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/${filePath}?ref=${currentBranch}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMarkdownContent(data.content);
      setCurrentFilePath(filePath);
      setCurrentFileSha(data.sha);
    } catch (error) {
      console.error("Error loading markdown file:", error);
    }
  };

  const handleCreateNewMd = async (directPush: boolean) => {
    if (!session?.accessToken || !newFilePath || !currentOwner || !currentRepo) {
      alert("Please provide a file path, select a project, and ensure you are logged in.");
      return;
    }

    const fullPath = `${newFileParentFolder}/${newFilePath}`;

    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/${fullPath}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: markdownContent,
            message: `Create ${fullPath}`,
            directPush: directPush,
            branch: currentBranch, // Use selected branch for new file creation
          }),
        }
      );

      if (response.ok) {
        alert(`File ${fullPath} created and ${directPush ? 'pushed directly' : 'pull request created'}!`);
        setNewFilePath(''); // Clear the input
        setShowCreateFileDialog(false); // Close the dialog
        // Refresh the repo contents to show the new file
        const data = await fetchRepoContents();
        setRepoContents(data);
      } else {
        alert("Error creating file.");
      }
    } catch (error) {
      console.error("Error creating new markdown file:", error);
      alert("Error creating new markdown file.");
    }
  };

  const handleCreateBranch = async () => {
    if (!session?.accessToken || !newBranchName || !currentOwner || !currentRepo) {
      alert("Please provide a new branch name, select a project, and ensure you are logged in.");
      return;
    }
    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newBranchName: newBranchName,
          baseBranch: currentBranch, // Create from the currently selected branch
        }),
      });

      if (response.ok) {
        alert(`Branch ${newBranchName} created successfully!`);
        setNewBranchName('');
        fetchBranches(); // Refresh the branch list
      } else {
        alert("Error creating branch.");
      }
    } catch (error) {
      console.error("Error creating branch:", error);
      alert("Error creating branch.");
    }
  };

  const renderFileTree = (contents: FileContent[]) => {
    return (
      <ul className="ml-4">
        {contents.map((item) => (
          <li key={item.path}>
            {item.type === "dir" ? (
              <div>
                <button
                  onClick={() => toggleFolder(item.path)}
                  className="flex items-center w-full text-left hover:bg-gray-700 p-1 rounded"
                >
                  {openFolders.has(item.path) ? "▼" : "►"} {item.name}
                </button>
                {openFolders.has(item.path) && (
                  <div className="ml-4">
                    {folderContents.has(item.path) ? (
                      renderFileTree(folderContents.get(item.path) || [])
                    ) : (
                      <p className="text-sm text-gray-400">Loading...</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center hover:bg-gray-700 p-1 rounded">
                <span>{item.name}</span>
                {item.name.endsWith(".md") && (
                  <div className="text-xs space-x-1">
                    <button
                      onClick={() => toggleContextFile(item.path)}
                      className={`px-2 py-1 rounded ${selectedContextFiles.includes(item.path) ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
                    >
                      LLM
                    </button>
                    <button
                      onClick={() => handleLoadMd(item.path, item.sha)}
                      className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded"
                    >
                      Load
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 space-y-4 overflow-y-auto">
      {!session ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-center mb-4">Please sign in to access project features.</p>
          <button
            onClick={() => signIn("github")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign in with GitHub
          </button>
          <Link
            href="https://github.com/jabelardo/escriba"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-blue-400 hover:underline"
          >
            Project GitHub
          </Link>
        </div>
      ) : (
        <>
          {/* General Navigation */}
          <nav>
            <ul className="space-y-2">
              <li>
                <Link href="/projects/new-project" className="block hover:bg-gray-700 p-2 rounded">
                  New Project
                </Link>
              </li>
              <li>
                <Link href="/settings" className="block hover:bg-gray-700 p-2 rounded">
                  Settings
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left hover:bg-gray-700 p-2 rounded"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>

          

          {/* Projects Section */}
          <div>
            <button
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="flex items-center w-full text-left hover:bg-gray-700 p-2 rounded"
            >
              {isProjectsOpen ? "▼" : "►"} Projects
            </button>
            {isProjectsOpen && (
              <div className="ml-4 mt-2">
                {userProjects.length > 0 ? (
                  <ul className="space-y-1">
                    {userProjects.map((project) => (
                      <li key={project.id}>
                        <button
                          onClick={() => handleProjectSelect(project.owner.login, project.name)}
                          className="block w-full text-left hover:bg-gray-600 p-1 rounded"
                        >
                          {project.name.replace("escriba-", "")}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No projects found.</p>
                )}
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-1">Add Existing Project</h4>
                  <input
                    type="text"
                    placeholder="owner/repo-name"
                    className="w-full p-2 rounded bg-gray-700 text-white text-sm mb-2"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                  <button
                    onClick={handleAddProject}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Add Project
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-700" />

          {/* Project Specific Content */}
          {currentOwner && currentRepo && (
            <>
              {/* Books Section */}
              <div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setIsBooksOpen(!isBooksOpen)}
                    className="flex items-center w-full text-left hover:bg-gray-700 p-2 rounded"
                  >
                    {isBooksOpen ? "▼" : "►"} Books
                  </button>
                  <button
                    onClick={() => {
                      setNewFileParentFolder("books");
                      setShowCreateFileDialog(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                  >
                    + MD
                  </button>
                </div>
                {isBooksOpen && (
                  <div className="ml-4 mt-2">
                    {loading ? (
                      <p>Loading books...</p>
                    ) : (
                      renderFileTree(repoContents.filter(item => item.path.startsWith("books/")))
                    )}
                  </div>
                )}
              </div>

              {/* References Section */}
              <div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setIsReferencesOpen(!isReferencesOpen)}
                    className="flex items-center w-full text-left hover:bg-gray-700 p-2 rounded"
                  >
                    {isReferencesOpen ? "▼" : "►"} References
                  </button>
                  <button
                    onClick={() => {
                      setNewFileParentFolder("references");
                      setShowCreateFileDialog(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                  >
                    + MD
                  </button>
                </div>
                {isReferencesOpen && (
                  <div className="ml-4 mt-2">
                    {loading ? (
                      <p>Loading references...</p>
                    ) : (
                      renderFileTree(repoContents.filter(item => item.path.startsWith("references/")))
                    )}
                  </div>
                )}
              </div>

              <hr className="border-gray-700" />

              {/* Branch Management */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Branch Management</h3>
                <div className="mb-2">
                  <label htmlFor="branch-select" className="block text-sm font-medium text-gray-300">Select Branch:</label>
                  <select
                    id="branch-select"
                    className="w-full p-2 rounded bg-gray-700 text-white text-sm mt-1"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    {branches.map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="new-branch-name" className="block text-sm font-medium text-gray-300">Create New Branch:</label>
                  <input
                    type="text"
                    id="new-branch-name"
                    placeholder="New branch name"
                    className="w-full p-2 rounded bg-gray-700 text-white text-sm mt-1 mb-2"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                  />
                  <button
                    onClick={handleCreateBranch}
                    className="w-full bg-purple-500 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Create Branch from {selectedBranch || 'main'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Create New File Dialog */}
          {showCreateFileDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Create New Markdown File</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Parent Folder:</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="parentFolder"
                        value="books"
                        checked={newFileParentFolder === "books"}
                        onChange={() => setNewFileParentFolder("books")}
                      />
                      <span className="ml-2">Books</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="parentFolder"
                        value="references"
                        checked={newFileParentFolder === "references"}
                        onChange={() => setNewFileParentFolder("references")}
                      />
                      <span className="ml-2">References</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={`New file path (e.g., my-new-doc.md) in ${newFileParentFolder}/`}
                  className="w-full p-2 rounded bg-gray-700 text-white text-sm mb-4"
                  value={newFilePath}
                  onChange={(e) => setNewFilePath(e.target.value)}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCreateNewMd(false)}
                    className="flex-1 bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Create & PR
                  </button>
                  <button
                    onClick={() => handleCreateNewMd(true)}
                    className="flex-1 bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Create & Push
                  </button>
                  <button
                    onClick={() => setShowCreateFileDialog(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}