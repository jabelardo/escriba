'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Welcome, {session.user?.name}</h1>
        <Link href="/dashboard" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
          Go to Dashboard
        </Link>
        <button
          onClick={() => signOut()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Sign Out
        </button>
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
