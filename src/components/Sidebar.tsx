"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useMarkdown } from "@/context/MarkdownContext";
import { useProject } from "@/context/ProjectContext";
import { loadConfig, saveConfig } from "@/lib/configStorage";
import { useRouter } from "next/navigation";

interface FileContent {
  name: string;
  path: string;
  type: "file" | "dir";
  sha?: string;
}

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  }
  protected: boolean;
}

export default function Sidebar() {
  const router = useRouter(); // Initialize the router
  const { data: session } = useSession();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [openRouterModel, setOpenRouterModel] = useState<string>(() => {
    const config = loadConfig();
    return config.openRouterModel || "openrouter/auto";
  });
  const [modelTemperature, setModelTemperature] = useState<number>(() => {
    const config = loadConfig();
    return config.modelTemperature || 1; // Default temperature
  });
  const [outputLimit, setOutputLimit] = useState<string>(() => {
    const config = loadConfig();
    return config.outputLimit || "512"; // Default output limit
  });

  // Fetch available models dynamically from OpenRouter
  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        const config = loadConfig(); // Load the OpenRouter API key from configStorage
        const openRouterApiKey = config.openRouterApiKey;

        if (!openRouterApiKey) {
          console.error("OpenRouter API key is missing.");
          setAvailableModels([]);
          return;
        }

        const response = await fetch("https://openrouter.ai/api/v1/models", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`, // Use the API key for authentication
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("OpenRouter API response:", data); // Debug the response structure

        // Extract model IDs from the `data` array and sort them alphabetically
        const models = data.data
          .map((model: { id: string; name: string }) => model.id)
          .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
        setAvailableModels(models);
      } catch (error) {
        console.error("Error fetching available models:", error);
        setAvailableModels([]); // Fallback to an empty array if the fetch fails
      }
    };

    fetchAvailableModels();
  }, []);

  const handleModelChange = (model: string) => {
    setOpenRouterModel(model);
    const config = loadConfig();
    saveConfig({ ...config, openRouterModel: model });
  };

  const handleTemperatureChange = (temperature: number) => {
    setModelTemperature(temperature);
    const config = loadConfig();
    saveConfig({ ...config, modelTemperature: temperature });
  };

  const handleOutputLimitChange = (limit: string) => {
    setOutputLimit(limit);
    const config = loadConfig();
    saveConfig({ ...config, outputLimit: limit });
  };

  const { setMarkdownContent, setCurrentFilePath, setCurrentFileSha, markdownContent, currentBranch, setCurrentBranch, selectedContextFiles, toggleContextFile } = useMarkdown();
  const { currentOwner, currentRepo, setCurrentOwner, setCurrentRepo, userProjects, addUserProject, loadUserProjects } = useProject();
  const [, setRepoContents] = useState<FileContent[]>([]);
  const [folderContents, setFolderContents] = useState<Map<string, FileContent[]>>(new Map());
  const [, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);
  const [newFileParentFolder, setNewFileParentFolder] = useState<"books" | "references">("books");

  // Fetch repo contents
  const fetchRepoContents = useCallback(async (path = "", owner = currentOwner, repo = currentRepo) => {
    if (!session?.accessToken || !owner || !repo) return [];

    try {
      const response = await fetch(`/api/repos/${owner}/${repo}/${path}?ref=${currentBranch}`);
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

  const createFolderInRepo = async (owner: string, repo: string, folderName: string) => {
    if (!session?.accessToken) return;
    const filePath = `${folderName}/.gitkeep`; // Create a .gitkeep file to represent the folder
    try {
      const response = await fetch(`/api/repos/${owner}/${repo}/${filePath}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "", // Empty content for .gitkeep
          message: `Create ${folderName} folder`,
          directPush: true, // Direct push for folder creation
          branch: currentBranch, // Use current branch
        }),
      });

      if (response.ok) {
        alert(`Folder '${folderName}' created successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error creating folder '${folderName}': ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error creating folder '${folderName}':`, error);
      alert(`Error creating folder '${folderName}'.`);
    }
  };

  const fetchBranches = useCallback(async () => {
    if (!session?.accessToken || !currentOwner || !currentRepo) return;
    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/branches`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Branch[] = await response.json();
      setBranches(data);
      if (data.length > 0) {
        const defaultBranch = data.find((branch: Branch) => branch.name === 'main') || data[0];
        setCurrentBranch(defaultBranch.name); // Select 'main' or the first branch by default
        setSelectedBranch(defaultBranch.name); // Also update the selectedBranch state for the dropdown
      } else {
        setCurrentBranch(''); // Set to empty string if no branches
        setSelectedBranch(''); // Set to empty string if no branches
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setCurrentBranch(''); // Set to empty string on error
      setSelectedBranch(''); // Set to empty string on error
    }
  }, [session, currentOwner, currentRepo, setCurrentBranch]);

  useEffect(() => {
    loadUserProjects();
  }, [loadUserProjects]);

  useEffect(() => {
    const loadProjectData = async () => {
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

    loadProjectData();
  }, [fetchRepoContents, fetchBranches, currentOwner, currentRepo]);

  useEffect(() => {
    if (userProjects.length > 0 && !currentOwner && !currentRepo) {
      // Automatically select the first project if none is selected
      setCurrentOwner(userProjects[0].owner);
      setCurrentRepo(userProjects[0].name);
    }
  }, [userProjects, currentOwner, currentRepo, setCurrentOwner, setCurrentRepo]);

  const handleAddProject = async () => {
    if (!session?.accessToken || !newProjectName.trim()) {
      alert("Please enter a project name (owner/repo-name).");
      return;
    }
    const [owner, repo] = newProjectName.trim().split('/');
    if (!owner || !repo) {
      alert("Invalid project name format. Please use owner/repo-name.");
      return;
    }

    // Add project to local storage via context
    addUserProject(owner, repo);
    setNewProjectName('');

    try {
      const repoRootContents = await fetchRepoContents('', owner, repo);
      const hasBooks = repoRootContents.some(item => item.name === "books" && item.type === "dir");
      const hasReferences = repoRootContents.some(item => item.name === "references" && item.type === "dir");

      if (!hasBooks) {
        const confirmCreate = confirm("'books' folder not found. Do you want to create it?");
        if (confirmCreate) {
          await createFolderInRepo(owner, repo, "books");
        }
      }
      if (!hasReferences) {
        const confirmCreate = confirm("'references' folder not found. Do you want to create it?");
        if (confirmCreate) {
          await createFolderInRepo(owner, repo, "references");
        }
      }
      const updatedContents = await fetchRepoContents();
      setRepoContents(updatedContents);
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Error adding project.");
    }
  };

  const handleProjectSelect = useCallback(async (owner: string, repo: string) => {
    setCurrentOwner(owner);
    setCurrentRepo(repo);
    // Clear existing content and reset loading state for the new project
    setRepoContents([]);
    setFolderContents(new Map());
    setOpenFolders(new Set());
    setLoading(true);
    // These will be triggered by the useEffect that watches currentOwner/currentRepo
  }, [setCurrentOwner, setCurrentRepo]);


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

  const handleLoadMd = async (filePath: string) => {
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

      // Navigate to the home page after loading the markdown file
      router.push("/");
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
    const parentFolder = fullPath.substring(0, fullPath.lastIndexOf('/')); // Get the parent folder path

    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/${fullPath}`, {
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
      });

      if (response.ok) {
        alert(`File ${fullPath} created and ${directPush ? 'pushed directly' : 'pull request created'}!`);
        setNewFilePath(''); // Clear the input
        setShowCreateFileDialog(false); // Close the dialog

        // Refresh the folder contents for the parent folder
        const updatedContents = await fetchRepoContents(parentFolder);
        setFolderContents((prev) => new Map(prev).set(parentFolder, updatedContents));
      } else {
        alert("Error creating file.");
      }
    } catch (error) {
      console.error("Error creating new markdown file:", error);
      alert("Error creating new markdown file.");
    }
  };

  const handleCreateBranch = async () => {
    if (!session?.accessToken || !newBranchName.trim() || !currentOwner || !currentRepo) {
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
          newBranchName: newBranchName.trim(),
          baseBranch: currentBranch, // Create from the currently selected branch
        }),
      });

      if (response.ok) {
        alert(`Branch ${newBranchName.trim()} created successfully!`);
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

  const handleToggleSection = async (section: "books" | "references") => {
    if (section === "books") {
      setIsBooksOpen((prev) => !prev);
      if (!isBooksOpen) { // If it's about to open, fetch contents
        await toggleFolder("books");
      }
    } else if (section === "references") {
      setIsReferencesOpen((prev) => !prev);
      if (!isReferencesOpen) { // If it's about to open, fetch contents
        await toggleFolder("references");
      }
    }
  };

  const renderFileTree = (contents: FileContent[]) => {
    return (
      <ul className="ml-4">
        {contents.filter(item => item.type === "dir" || item.name.endsWith(".md")).map((item) => (
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
                <div className="text-xs space-x-1">
                  <button
                    onClick={() => toggleContextFile(item.path)}
                    className={`px-2 py-1 rounded ${selectedContextFiles.includes(item.path) ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
                  >
                    LLM
                  </button>
                  <button
                    onClick={() => handleLoadMd(item.path)}
                    className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded"
                  >
                    Load
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="w-64 bg-gray-800 text-white p-4 space-y-4 h-full overflow-y-auto"
    >
      {!session ? (
        <div className="flex flex-col items-center justify-center h-full">
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
          {/* OpenRouter Model Dropdown */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-300">Select OpenRouter Model:</label>
            <select
              value={openRouterModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white text-sm mb-2"
            >
              {availableModels.length > 0 ? (
                availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No models available
                </option>
              )}
            </select>
          </div>

          {/* Model Temperature Input */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-300">Model Temperature:</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={modelTemperature}
              onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 text-white text-sm mb-2"
            />
          </div>

          {/* Output Limit Dropdown */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-300">Output Limit:</label>
            <select
              value={outputLimit}
              onChange={(e) => handleOutputLimitChange(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white text-sm mb-2"
            >
              <option value="64">Micro (64)</option>
              <option value="128">Very Short (128)</option>
              <option value="256">Short (256)</option>
              <option value="512">Average (512)</option>
              <option value="1024">Above Average (1024)</option>
              <option value="2048">Long (2048)</option>
              <option value="4096">Very Long (4096)</option>
              <option value="8192">Max (8192)</option>
              <option value="16384">Super Max (16384)</option>
            </select>
          </div>

          {/* Other Sidebar Content */}
          <div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-300">Current Project:</label>
              {currentOwner && currentRepo ? (
                <p className="text-sm text-blue-300">{currentOwner}/{currentRepo}</p>
              ) : (
                <p className="text-sm text-gray-400">No project selected</p>
              )}
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-300">Select Project:</label>
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
                            onClick={() => handleProjectSelect(project.owner, project.name)}
                            className="block w-full text-left hover:bg-gray-600 p-1 rounded"
                          >
                            {project.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No projects found.</p>
                  )}
                </div>
              )}
            </div>
            {currentOwner && currentRepo ? (
              <>
                <div className="mb-2">
                  <label htmlFor="branch-select" className="block text-sm font-medium text-gray-300">Select Project Branch:</label>
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
                <div className="mb-2">
                  <label htmlFor="new-branch-name" className="block text-sm font-medium text-gray-300">Create New Project Branch:</label>
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
              </>
            ) : null }

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-300">Add Project:</label>
              <input
                type="text"
                placeholder="owner/repo-name"
                className="w-full p-2 rounded bg-gray-700 text-white text-sm mb-2"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value.trim())}
              />
              <button
                onClick={handleAddProject}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
              >
                Add Project
              </button>
            </div>
            <div className="mt-2">
              <Link href="/projects/new-project" className="block hover:bg-gray-700 p-2 rounded">
                    Create New Project
                  </Link>
            </div>
          </div>

          {/* Project Specific Content */}
          {currentOwner && currentRepo && (
            <>
              {/* Books Section */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-300">Select/Create File:</label>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleToggleSection("books")}
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
                    {folderContents.has("books") ? (
                      renderFileTree(folderContents.get("books") || [])
                    ) : (
                      <p className="text-sm text-gray-400">Loading...</p>
                    )}
                  </div>
                )}
              </div>

              {/* References Section */}
              <div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleToggleSection("references")}
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
                    {folderContents.has("references") ? (
                      renderFileTree(folderContents.get("references") || [])
                    ) : (
                      <p className="text-sm text-gray-400">Loading...</p>
                    )}
                  </div>
                )}
              </div>

             
            </>
          )}

          {/* Create New File Dialog */}
          {showCreateFileDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Create New Markdown File</h3>
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

          {/* General Navigation */}
          <nav>
            <ul className="space-y-2">
          
              <li>
                <Link href="/settings" className="block hover:bg-gray-700 p-2 rounded">
                  Settings
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left hover:bg-gray-700 p-2 rounded"
                >
                  Logout
                </button>
              </li>
            </ul>
            <div className="flex flex-col items-center justify-center h-full">
              <Link
                href="https://github.com/jabelardo/escriba"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-blue-400 hover:underline"
              >
                Project GitHub
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}