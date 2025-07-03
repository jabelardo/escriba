'use client'

import React, { useEffect, useState } from 'react'
import ReactMde from "react-mde"
import * as Showdown from "showdown"
import 'react-mde/lib/styles/css/react-mde-all.css';
import { loadConfig } from "@/lib/configStorage";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
})

interface MarkdownEditorProps {
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
}

export default function MarkdownEditor({ markdownContent, setMarkdownContent }: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write")
  const [isGenerating, setIsGenerating] = useState(false);

  const getEditorHeight = () => {
    // Adjust this offset based on your layout (e.g., header, footer, padding)
    const offset = 150;
    const editorHeight = window.innerHeight - offset;
    return editorHeight;
  };

  const [editorHeight, setEditorHeight] = React.useState(getEditorHeight());

  useEffect(() => {
    const calculateEditorHeight = () => {
      setEditorHeight(getEditorHeight());
    };

    // Set initial height
    calculateEditorHeight();

    // Add event listener for window resize
    window.addEventListener('resize', calculateEditorHeight);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', calculateEditorHeight);
    };
  }, []);

  const handleGenerateText = async () => {
    setIsGenerating(true);
    try {
      const config = loadConfig();
      const openRouterApiKey = config.openRouterApiKey;
      const openRouterModel = config.openRouterModel || "openrouter/auto"; // Default model

      if (!openRouterApiKey) {
        alert("OpenRouter API Key is not set in settings.");
        return;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: "user", content: markdownContent }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || "";
      setMarkdownContent(prev => prev + "\n\n" + generatedText);

    } catch (error) {
      console.error("Error generating text:", error);
      alert(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <button
          onClick={handleGenerateText}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Text (OpenRouter)"}
        </button>
      </div>
      <ReactMde
        value={markdownContent}
        onChange={setMarkdownContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        initialEditorHeight={editorHeight}
        minEditorHeight={editorHeight}
        minPreviewHeight={editorHeight}
        maxEditorHeight={editorHeight}
      />
    </div>
  )
}
