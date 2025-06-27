

'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import MarkdownEditor from "@/components/MarkdownEditor"
import { loadConfig } from "@/lib/configStorage"

interface RepoFile {
  name: string
  path: string
  type: string
}

import { useParams } from "next/navigation"

export default function Project() {
  const params = useParams();
  const projectName = params.projectName as string;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })
  const [files, setFiles] = useState<RepoFile[]>([])
  const [selectedFileContent, setSelectedFileContent] = useState("")
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedFileSha, setSelectedFileSha] = useState<string | null>(null)
  const [selectedContextFiles, setSelectedContextFiles] = useState<string[]>([])

  useEffect(() => {
    if (session) {
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
  }, [session, params.projectName])

  useEffect(() => {
    if (selectedFilePath && session) {
      const fetchFileContent = async () => {
        const res = await fetch(
          `/api/repos/${session.user?.username}/${params.projectName}/${selectedFilePath}`
        )
        if (res.ok) {
          const data = await res.json()
          setSelectedFileContent(data.content)
          setSelectedFileSha(data.sha)
        }
      }
      fetchFileContent()
    }
  }, [selectedFilePath, session, params.projectName])

  const handleFileClick = (file: RepoFile) => {
    if (file.type === "file") {
      setSelectedFilePath(file.path)
    }
  }

  const handleContextToggle = (filePath: string) => {
    setSelectedContextFiles((prevSelected) =>
      prevSelected.includes(filePath)
        ? prevSelected.filter((path) => path !== filePath)
        : [...prevSelected, filePath]
    )
  }

  const handleSave = async () => {
    if (selectedFilePath && selectedFileSha && session) {
      const res = await fetch(
        `/api/repos/${session.user?.username}/${params.projectName}/${selectedFilePath}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: selectedFileContent,
            sha: selectedFileSha,
            message: `Update ${selectedFilePath}`,
          }),
        }
      )

      if (res.ok) {
        alert("File saved and pull request created!")
      } else {
        alert("Error saving file.")
      }
    }
  }

  const handleLLMInteraction = async (promptType: "continue" | "review") => {
    const llmConfig = loadConfig(); // Load config from local storage

    // TODO: Fetch content of selectedContextFiles
    const res = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedContextFiles,
        currentContent: selectedFileContent,
        promptType,
        userPrompt: "", // User can add specific prompt later
        llmConfig, // Pass the config to the server
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setSelectedFileContent(data.generatedText)
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
        <MarkdownEditor
          value={selectedFileContent}
          onChange={setSelectedFileContent}
        />
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save Changes
          </button>
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

