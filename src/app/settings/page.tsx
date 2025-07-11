
'use client'

import { useState, useEffect } from "react"
import { saveConfig, loadConfig, exportConfig, importConfig } from "@/lib/configStorage"

export default function Settings() {
  const [openRouterApiKey, setOpenRouterApiKey] = useState("")
  const [openRouterModel, setOpenRouterModel] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [continuePrompt, setContinuePrompt] = useState("")
  const [reviewPrompt, setReviewPrompt] = useState("")
  const [githubId, setGithubId] = useState("")
  const [githubSecret, setGithubSecret] = useState("")

  useEffect(() => {
    const config = loadConfig()
    setOpenRouterApiKey(config.openRouterApiKey || "")
    setOpenRouterModel(config.openRouterModel || "")
    setSystemPrompt(config.systemPrompt || "")
    setContinuePrompt(config.continuePrompt || "")
    setReviewPrompt(config.reviewPrompt || "")
    setGithubId(config.githubId || "")
    setGithubSecret(config.githubSecret || "")
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    saveConfig({
      openRouterApiKey,
      openRouterModel,
      systemPrompt,
      continuePrompt,
      reviewPrompt,
      githubId,
      githubSecret,
    })

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubId, githubSecret }),
      })

      if (response.ok) {
        alert("Settings and GitHub credentials saved successfully!")
      } else {
        const errorData = await response.json()
        alert(`Error saving GitHub credentials: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Failed to save GitHub credentials:", error)
      alert("Failed to save GitHub credentials due to a network error.")
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const importedConfig = await importConfig(file)
        setOpenRouterApiKey(importedConfig.openRouterApiKey || "")
        setOpenRouterModel(importedConfig.openRouterModel || "")
        setSystemPrompt(importedConfig.systemPrompt || "")
        setContinuePrompt(importedConfig.continuePrompt || "")
        setReviewPrompt(importedConfig.reviewPrompt || "")
        setGithubId(importedConfig.githubId || "")
        setGithubSecret(importedConfig.githubSecret || "")
        alert("Settings imported successfully!")
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Error importing settings: ${error.message}`)
        } else {
          alert('An unknown error occurred while importing settings.')
        }
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Settings</h1>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold">LLM API Configuration</h2>
          <div>
            <label htmlFor="openRouterApiKey" className="block text-lg font-medium">
              OpenRouter API Key
            </label>
            <input
              type="password"
              id="openRouterApiKey"
              value={openRouterApiKey}
              onChange={(e) => setOpenRouterApiKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="openRouterModel" className="block text-lg font-medium">
              OpenRouter Model (e.g., openrouter/auto)
            </label>
            <input
              type="text"
              id="openRouterModel"
              value={openRouterModel}
              onChange={(e) => setOpenRouterModel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Default Prompts</h2>
          <div>
            <label htmlFor="systemPrompt" className="block text-lg font-medium">
              System Prompt
            </label>
            <textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="continuePrompt" className="block text-lg font-medium">
              Continue Prompt
            </label>
            <textarea
              id="continuePrompt"
              value={continuePrompt}
              onChange={(e) => setContinuePrompt(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="reviewPrompt" className="block text-lg font-medium">
              Review Prompt
            </label>
            <textarea
              id="reviewPrompt"
              value={reviewPrompt}
              onChange={(e) => setReviewPrompt(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">GitHub Configuration</h2>
          <div>
            <label htmlFor="githubId" className="block text-lg font-medium">
              GitHub ID
            </label>
            <input
              type="text"
              id="githubId"
              value={githubId}
              onChange={(e) => setGithubId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="githubSecret" className="block text-lg font-medium">
              GitHub Secret
            </label>
            <input
              type="password"
              id="githubSecret"
              value={githubSecret}
              onChange={(e) => setGithubSecret(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </section>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save Settings
          </button>
          <button
            type="button"
            onClick={exportConfig}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Export Settings
          </button>
          <label className="px-4 py-2 bg-purple-500 text-white rounded-md cursor-pointer">
            Import Settings
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </form>
    </div>
  )
}
