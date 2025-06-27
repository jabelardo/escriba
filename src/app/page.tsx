'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { useMarkdown } from "@/context/MarkdownContext"
import { useProject } from "@/context/ProjectContext"
import MarkdownEditor from "@/components/MarkdownEditor"

export default function Home() {
  const { data: session } = useSession()
  const { markdownContent, setMarkdownContent, currentFilePath, currentFileSha, currentBranch, isDirty, setIsDirty } = useMarkdown()
  const { currentOwner, currentRepo } = useProject()
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const executeSave = async (directPush: boolean) => {
    if (!session?.accessToken || !currentOwner || !currentRepo || !currentFilePath || currentFileSha === null || currentBranch === null) {
      alert("Cannot save: Missing session, project, file path, SHA, or branch information.");
      return;
    }

    try {
      const response = await fetch(`/api/repos/${currentOwner}/${currentRepo}/${currentFilePath}`, {
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
      });

      if (response.ok) {
        alert(`File saved successfully! ${directPush ? 'Pushed directly.' : 'Pull request created.'}`);
        setIsDirty(false);
        setShowSaveDialog(false); // Close the dialog
        // Optionally, refetch file SHA if GitHub updates it on save
        // const data = await response.json();
        // setCurrentFileSha(data.sha); // Uncomment if your PUT endpoint returns the new SHA
      } else {
        const errorData = await response.json();
        alert(`Error saving file: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving markdown file:", error);
      alert("Error saving markdown file.");
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  if (session) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="p-2 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {currentFilePath ? `Editing: ${currentFilePath}` : "No file selected"}
            {isDirty && <span className="text-red-500 ml-2">*</span>}
          </h2>
          <div className="space-x-2">
            <button
              onClick={handleSave}
              disabled={!isDirty || !currentFilePath}
              className={`px-4 py-2 rounded-md ${isDirty && currentFilePath ? 'bg-green-500 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'} text-white`}
            >
              Save
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <MarkdownEditor
            markdownContent={markdownContent}
            setMarkdownContent={setMarkdownContent}
          />
        </div>

        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Save Markdown File</h3>
              <p className="mb-4">How would you like to save your changes?</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => executeSave(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                >
                  Create Pull Request
                </button>
                <button
                  onClick={() => executeSave(true)}
                  className="flex-1 bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                >
                  Direct Commit
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Escriba</h1>
      <p className="text-lg">Your AI writing assistant</p>
      <p className="text-center mb-4">Please sign in to access project features.</p>
      <button
        onClick={() => signIn("github")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Sign in with GitHub
      </button>
    </main>
  )
}
