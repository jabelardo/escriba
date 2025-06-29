
'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"

import { useProject } from "@/context/ProjectContext"

export default function NewProject() {
  const router = useRouter()
  const { addUserProject } = useProject()
  useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })
  const [projectName, setProjectName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectName }),
    })

    if (res.ok) {
      const repo = await res.json()
      const [owner, name] = repo.full_name.split('/')
      addUserProject(owner, name)
      router.push("/")
    } else {
      // Handle error
      console.error("Error creating project")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">New Project</h1>

      <form onSubmit={handleSubmit} className="mt-8">
        <label htmlFor="projectName" className="block text-lg font-medium">
          Project Name
        </label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Create Project
        </button>
      </form>
    </div>
  )
}
