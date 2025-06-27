
'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface GitHubRepo {
  id: number
  name: string
  html_url: string
}

export default function Dashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })

  const [projects, setProjects] = useState<GitHubRepo[]>([])

  useEffect(() => {
    if (session) {
      const fetchProjects = async () => {
        const res = await fetch("/api/user/repos")
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      }
      fetchProjects()
    }
  }, [session])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            href="/settings"
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Settings
          </Link>
          <p className="text-lg">Welcome, {session?.user?.name}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <Link
            href="/dashboard/new-project"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            New Project
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/project/${project.name}`}
                className="text-blue-600 hover:underline"
              >
                {project.name.replace("escriba-", "")}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
