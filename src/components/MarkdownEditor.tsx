'use client'

import React, { useEffect, useState } from 'react'
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
import { MagicWandIcon } from "@radix-ui/react-icons"
import { loadConfig } from "@/lib/configStorage";

interface MarkdownEditorProps {
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
}

export default function MarkdownEditor({ markdownContent, setMarkdownContent }: MarkdownEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);
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
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || "";
      setMarkdownContent((prev) => `${prev}\n\n${generatedText}`); // Append generated text to markdown content
      mdxEditorRef.current?.insertMarkdown(markdownContent);
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
      </div>
        <MDXEditor 
          ref={mdxEditorRef}
          markdown={markdownContent} 
          onChange={setMarkdownContent}
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
