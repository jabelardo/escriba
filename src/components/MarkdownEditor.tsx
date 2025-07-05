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
}

export default function MarkdownEditor({ markdownContent, setMarkdownContent, isDirty, setIsDirty }: MarkdownEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const getEditorHeight = () => {
    // Adjust this offset based on your layout (e.g., header, footer, padding)
    const offset = 150;
    const editorHeight = window.innerHeight - offset;
    return editorHeight;
  };

  const [editorHeight, setEditorHeight] = React.useState(getEditorHeight());
  const [originalMarkdownContent, setOriginalMarkdownContent] = React.useState(markdownContent);

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
      setMarkdownContent(newMarkdownContent); // Append generated text to markdown content
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

  const handleSaveFile = () => {
    console.log("Saving file...");
  }

  const handleEditorChange = (markdown: string, initialMarkdownNormalize: boolean) => {
    console.log("initialMarkdownNormalize:", initialMarkdownNormalize);
    setMarkdownContent(markdown);
    if (initialMarkdownNormalize) {
      setOriginalMarkdownContent(markdown);
    } else {
      const newIsDirty = markdown !== originalMarkdownContent;
      console.log("newIsDirty:", newIsDirty);
      setIsDirty(newIsDirty);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
      </div>
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
              toolbarClassName: 'my-classname',
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
{/*       <ReactMde
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
      /> */}
    </div>
  )
}
