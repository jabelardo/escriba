'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useMarkdown } from "@/context/MarkdownContext"
import MarkdownEditor from "@/components/MarkdownEditor"

export default function Home() {
  const { data: session } = useSession()
  const { markdownContent, setMarkdownContent } = useMarkdown()

  if (session) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <MarkdownEditor
            markdownContent={markdownContent}
            setMarkdownContent={setMarkdownContent}
          />
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Sign Out
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Escriba</h1>
      <p className="text-lg">Your AI writing assistant</p>
      <button
        onClick={() => signIn("github")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Sign in with GitHub
      </button>
    </main>
  )
}
