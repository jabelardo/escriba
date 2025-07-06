'use client'

import React, { useEffect, useState, useRef } from 'react'
import { 
  MDXEditor,
  MDXEditorMethods,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
  DialogButton,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  UndoRedo, 
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { ArchiveIcon, MagicWandIcon, StopIcon } from "@radix-ui/react-icons"
import { loadConfig } from "@/lib/configStorage";

interface MarkdownEditorProps {
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  handleSaveFile: () => void;
}

export default function MarkdownEditor({ markdownContent, setMarkdownContent, isDirty, setIsDirty, handleSaveFile }: MarkdownEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [originalMarkdownContent, setOriginalMarkdownContent] = React.useState(markdownContent);

  const handleGenerateText = async () => {
    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const config = loadConfig(); // Load configuration from configStorage
      const openRouterApiKey = config.openRouterApiKey;
      const openRouterModel = config.openRouterModel || "openrouter/auto"; // Default model
      const modelTemperature = config.modelTemperature || 1; // Default temperature
      const outputLimit = config.outputLimit || "512"; // Default output limit

      if (!openRouterApiKey) {
        alert("OpenRouter API Key is not set in settings.");
        return;
      }

      const prompt = `${config.continuePrompt || ""}\n\n${markdownContent}`; // Combine continuePrompt and markdown content

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: "user", content: prompt },
          ],
          temperature: modelTemperature,
          max_tokens: parseInt(outputLimit, 10), // Convert outputLimit to an integer
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || "";
      const newMarkdownContent = `${markdownContent}\n\n${generatedText}`; // Append generated text to markdown content
      mdxEditorRef.current?.setMarkdown(newMarkdownContent); // Directly update the MDXEditor content
      setMarkdownContent(newMarkdownContent); // Keep the context state in sync
      setIsDirty(true);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Text generation stopped by user.');
      } else {
        console.error("Error generating text:", error);
        alert(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerateText = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  const handleEditorChange = (markdown: string, initialMarkdownNormalize: boolean) => {
    setMarkdownContent(markdown);
    if (initialMarkdownNormalize) {
      setOriginalMarkdownContent(markdown);
    } else {
      const newIsDirty = markdown !== originalMarkdownContent;
      setIsDirty(newIsDirty);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full _markdown-editor-container">
      <MDXEditor 
        ref={mdxEditorRef}
        markdown={markdownContent} 
        onChange={handleEditorChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          tablePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(), // you need the corresponding plugins for the markdown blocks listed before markdownShortcutPlugin() to enable support.
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <BlockTypeSelect />
                <InsertTable />
                <InsertThematicBreak />
                <Separator />
                <ButtonWithTooltip 
                  children={<MagicWandIcon />}
                  onClick={handleGenerateText}
                  disabled={isGenerating}
                  title={isGenerating ? "Generating..." : "Generate Text"}
                />
                <ButtonWithTooltip 
                  children={<StopIcon />}
                  onClick={handleStopGenerateText}
                  disabled={!isGenerating}
                  title={"Stop Generating"}
                />
                <Separator />
                <ButtonWithTooltip 
                  children={<ArchiveIcon />}
                  onClick={handleSaveFile}
                  disabled={!isDirty}
                  title={"Save File"}
                />
              </>
            )
          }),
        ]} 
      />
    </div>
  )
}
