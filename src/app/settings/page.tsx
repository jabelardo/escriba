
'use client'

import { useState, useEffect } from "react"
import { saveConfig, loadConfig, exportConfig, importConfig } from "@/lib/configStorage"

export default function Settings() {
  const [openRouterApiKey, setOpenRouterApiKey] = useState("")
  const [openRouterModel, setOpenRouterModel] = useState("")
  const [lmStudioEndpoint, setLmStudioEndpoint] = useState("")
  const [lmStudioModel, setLmStudioModel] = useState("")
  const [ollamaEndpoint, setOllamaEndpoint] = useState("")
  const [ollamaModel, setOllamaModel] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [continuePrompt, setContinuePrompt] = useState("")
  const [reviewPrompt, setReviewPrompt] = useState("")

  useEffect(() => {
    const config = loadConfig()
    setOpenRouterApiKey(config.openRouterApiKey || "")
    setOpenRouterModel(config.openRouterModel || "")
    setLmStudioEndpoint(config.lmStudioEndpoint || "")
    setLmStudioModel(config.lmStudioModel || "")
    setOllamaEndpoint(config.ollamaEndpoint || "")
    setOllamaModel(config.ollamaModel || "")
    setSystemPrompt(config.systemPrompt || "")
    setContinuePrompt(config.continuePrompt || "")
    setReviewPrompt(config.reviewPrompt || "")
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveConfig({
      openRouterApiKey,
      openRouterModel,
      lmStudioEndpoint,
      lmStudioModel,
      ollamaEndpoint,
      ollamaModel,
      systemPrompt,
      continuePrompt,
      reviewPrompt,
    })
    alert("Settings saved!")
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const importedConfig = await importConfig(file)
        setOpenRouterApiKey(importedConfig.openRouterApiKey || "")
        setOpenRouterModel(importedConfig.openRouterModel || "")
        setLmStudioEndpoint(importedConfig.lmStudioEndpoint || "")
        setLmStudioModel(importedConfig.lmStudioModel || "")
        setOllamaEndpoint(importedConfig.ollamaEndpoint || "")
        setOllamaModel(importedConfig.ollamaModel || "")
        setSystemPrompt(importedConfig.systemPrompt || "")
        setContinuePrompt(importedConfig.continuePrompt || "")
        setReviewPrompt(importedConfig.reviewPrompt || "")
        alert("Settings imported successfully!")
      } catch (error: any) {
        alert(`Error importing settings: ${error.message}`)
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
          <div>
            <label htmlFor="lmStudioEndpoint" className="block text-lg font-medium">
              LM Studio Endpoint
            </label>
            <input
              type="text"
              id="lmStudioEndpoint"
              value={lmStudioEndpoint}
              onChange={(e) => setLmStudioEndpoint(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="lmStudioModel" className="block text-lg font-medium">
              LM Studio Model (e.g., local-model)
            </label>
            <input
              type="text"
              id="lmStudioModel"
              value={lmStudioModel}
              onChange={(e) => setLmStudioModel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="ollamaEndpoint" className="block text-lg font-medium">
              Ollama Endpoint
            </label>
            <input
              type="text"
              id="ollamaEndpoint"
              value={ollamaEndpoint}
              onChange={(e) => setOllamaEndpoint(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="ollamaModel" className="block text-lg font-medium">
              Ollama Model (e.g., llama2)
            </label>
            <input
              type="text"
              id="ollamaModel"
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
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
