

'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import MarkdownEditor from "@/components/MarkdownEditor"
import { loadConfig } from "@/lib/configStorage"
import { useMarkdown } from "@/context/MarkdownContext"
import { useProject } from "@/context/ProjectContext"

interface RepoFile {
  name: string
  path: string
  type: string
  sha?: string | null
}

import { useParams } from "next/navigation"

export default function Project() {
  const params = useParams();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })
  const { markdownContent, currentFilePath, currentFileSha, setCurrentFilePath, setCurrentFileSha, currentBranch, selectedContextFiles, toggleContextFile } = useMarkdown();
  const { setCurrentOwner, setCurrentRepo } = useProject();
  const [files, setFiles] = useState<RepoFile[]>([])

  useEffect(() => {
    if (session) {
      setCurrentOwner(session.user?.username || null);
      setCurrentRepo(params.projectName);
      const fetchFiles = async () => {
        const res = await fetch(
          `/api/repos/${session.user?.username}/${params.projectName}`
        )
        if (res.ok) {
          const data = await res.json()
          setFiles(data.filter((file: RepoFile) => file.type === "dir" || file.name.endsWith(".md")))
        }
      }
      fetchFiles()
    }
  }, [session, params.projectName, setCurrentOwner, setCurrentRepo])

  const handleFileClick = (file: RepoFile) => {
    if (file.type === "file") {
      setCurrentFilePath(file.path)
      setCurrentFileSha(file.sha || null)
    }
  }

  const handleContextToggle = (filePath: string) => {
    toggleContextFile(filePath);
  }

  const [directPush, setDirectPush] = useState(false);

  const handleSave = async () => {
    if (currentFilePath && currentFileSha && session) {
      const res = await fetch(
        `/api/repos/${session.user?.username}/${params.projectName}/${currentFilePath}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: markdownContent,
            sha: currentFileSha,
            message: `Update ${currentFilePath}`,
            directPush: directPush,
            branch: currentBranch,
          }),
        }
      )

      if (res.ok) {
        alert(`File saved and ${directPush ? 'pushed directly' : 'pull request created'}!`);
      } else {
        alert("Error saving file.")
      }
    }
  }

  const handleLLMInteraction = async (promptType: "continue" | "review") => {
    const llmConfig = loadConfig(); // Load config from local storage

    const contextFilesContent: { path: string; content: string }[] = [];
    for (const filePath of selectedContextFiles) {
      try {
        const res = await fetch(
          `/api/repos/${session?.user?.username}/${params.projectName}/${filePath}?ref=${currentBranch}`
        );
        if (res.ok) {
          const data = await res.json();
          contextFilesContent.push({ path: filePath, content: data.content });
        } else {
          console.error(`Error fetching context file ${filePath}:`, res.statusText);
        }
      } catch (error) {
        console.error(`Error fetching context file ${filePath}:`, error);
      }
    }

    const res = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedContextFiles: contextFilesContent,
        currentContent: markdownContent,
        promptType,
        userPrompt: "", // User can add specific prompt later
        llmConfig, // Pass the config to the server
      }),
    })

    if (res.ok) {
      // const data = await res.json() // This line is commented out as data is not used
      // setMarkdownContent(data.generatedText) // This should update the context
    } else {
      alert("Error interacting with LLM.")
    }
  }

  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-3 bg-gray-100 p-4">
        <h2 className="text-2xl font-bold">{params.projectName}</h2>
        <ul className="mt-4">
          {files.map((file) => (
            <li key={file.path} className="flex items-center space-x-2">
              {file.name.endsWith(".md") && (
                <input
                  type="checkbox"
                  checked={selectedContextFiles.includes(file.path)}
                  onChange={() => handleContextToggle(file.path)}
                />
              )}
              <button onClick={() => handleFileClick(file)}>
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-9 p-4">
        <MarkdownEditor />
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save Changes
          </button>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={directPush}
              onChange={(e) => setDirectPush(e.target.checked)}
              className="form-checkbox"
            />
            <span>Direct Push</span>
          </label>
          <button
            onClick={() => handleLLMInteraction("continue")}
            className="px-4 py-2 bg-purple-500 text-white rounded-md"
          >
            Continue Writing
          </button>
          <button
            onClick={() => handleLLMInteraction("review")}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md"
          >
            Review Content
          </button>
        </div>
      </div>
    </div>
  )
}


