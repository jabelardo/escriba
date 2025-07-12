'use client'

import { Box, Flex } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { 
  MDXEditor,
  type MDXEditorMethods,
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
import { ArchiveIcon, MagicWandIcon, StopIcon } from "@radix-ui/react-icons"
import { EditorTopBar } from './EditorTopBar'

import '@mdxeditor/editor/style.css'

export const EditorPanel = () => {
  const selectedFile = useProjectStore(s => s.selectedFile)
  const markdownContent = useProjectStore(s => s.selectedFile?.content || '')
  const setMarkdownContent = useProjectStore(s => s.setSelectedFileContent)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFileChanged, setIsFileChanged] = useState(false);
  const [originalMarkdownContent, setOriginalMarkdownContent] = useState(markdownContent);


  useEffect(() => {
    setOriginalMarkdownContent(markdownContent)
    setIsFileChanged(false)
  }, [selectedFile?.filePath])


  const handleGenerateText = async () => {
    setIsGenerating(true)
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {

      /*
      const prompt = `${config.continuePrompt || ""}\n\n${markdownContent}`; 
      const data = await operouterChatCompletions(prompt);
      const generatedText = data.choices[0]?.message?.content || "";
      */

      // Simulate a text generation process by waiting for 2 seconds
      let generatedText
      setTimeout(() => {
        if (controller.signal.aborted) return
        alert('Text generation completed!')
        generatedText = `\n\n## Generated Content\n\nThis is some generated content based on your input.`

      }, 2000);

      const newMarkdownContent = `${markdownContent}\n\n${generatedText}`
      setMarkdownContent(newMarkdownContent)
      setIsFileChanged(true)
      
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleStopGenerateText = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleSaveFile = () => {
    alert('Function not implemented.')
  }

  const handleEditorChange = (markdown: string, initialMarkdownNormalize: boolean) => {
    setMarkdownContent(markdown)
    if (initialMarkdownNormalize) {
      setOriginalMarkdownContent(markdown)
    } else {
      setIsFileChanged(markdown !== originalMarkdownContent)
    }
  }

  return (
    <Flex direction='column' h='100%' overflow='hidden'>
      <EditorTopBar
        filePath={selectedFile?.filePath}
      />
      <Box flex='1' overflow='auto' p={2}>
        <MDXEditor
          className="dark-theme dark-editor" 
          key={selectedFile?.filePath}
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
                    disabled={!isFileChanged}
                    title={"Save File"}
                  />
                </>
              )
            }),
          ]} 
        />
      </Box>
    </Flex>
  )
}