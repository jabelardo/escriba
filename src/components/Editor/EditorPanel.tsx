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
import { fetchChatCompletion } from '@/lib/openrouter/chat'
import { saveProjectFileContent } from '@/lib/github/files'
import { Octokit } from '@octokit/rest'
import { useAuthStore } from '@/store/authStore'

import '@mdxeditor/editor/style.css'
import "./my-editor.css";
import "./custom-lexical-theme.css"
import { customLexicalTheme } from "./CustomLexicalTheme";

export const EditorPanel = () => {
  const mdxEditorRef = useRef<MDXEditorMethods | null>(null)
  const selectedFile = useProjectStore(s => s.selectedFile)
  const setMarkdownContent = useProjectStore(s => s.setSelectedFileContent)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFileChanged, setIsFileChanged] = useState(false);
  const token = useAuthStore(s => s.githubToken)
  
  const markdownContent = useProjectStore(s => {
    const c = s.selectedFile?.content
    return typeof c === 'string' ? c : ''
  })  

  const originalMarkdownRef = useRef(markdownContent)

  useEffect(() => {
    originalMarkdownRef.current = markdownContent
    setIsFileChanged(false)
  }, [selectedFile?.filePath])
  
  useEffect(() => {
    if (markdownContent && mdxEditorRef.current) {
      mdxEditorRef.current.setMarkdown(markdownContent)
      originalMarkdownRef.current = markdownContent
    }
  }, [selectedFile?.filePath, markdownContent])


  const handleGenerateText = async () => {
    setIsGenerating(true)
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const config = {
        model: useProjectStore.getState().selectedProject?.model || 'openrouter/auto',
        promptPrefix: '', // customize or load from elsewhere
        apiKey: import.meta.env.VITE_OPENROUTER_KEY,
        temperature: 1,
        maxTokens: 512
      }
  
      if (!config.apiKey) {
        alert('OpenRouter API key is missing')
        return
      }
      const prompt = `${config.promptPrefix}\n\n${markdownContent}`

      const generatedText = await fetchChatCompletion({
        apiKey: config.apiKey,
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        signal: controller.signal
      })

      const newMarkdownContent = `${markdownContent}\n\n${generatedText}`
      setMarkdownContent(newMarkdownContent)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Generation aborted by user')
      } else {
        console.error(err)
        alert(`Failed to generate text: ${err instanceof Error ? err.message : String(err)}`)
      }
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

  const handleSaveFile = async () => {
    console.log('Saving file:', {selectedFile,  token})
    if (!selectedFile || !token) return

    const octokit = new Octokit({ auth: token })
    const project = useProjectStore.getState().selectedProject
    if (!project) return

    try {
      await saveProjectFileContent({
        octokit,
        owner: project.owner,
        repo: project.repo,
        path: selectedFile.filePath,
        content: selectedFile.content,
        sha: selectedFile.sha,
        message: `Update ${selectedFile.filePath}`,
        branch: project.branch ?? 'main',
      })
      alert('File saved!')
    } catch (err) {
      console.error(err)
      alert('Failed to save file')
    }
}

  const handleEditorChange = (markdown: string, initialMarkdownNormalize: boolean) => {
    setMarkdownContent(markdown)
    if (initialMarkdownNormalize) {
      originalMarkdownRef.current = markdown
      setIsFileChanged(false)
    } else {
      setIsFileChanged(markdown !== originalMarkdownRef.current)
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
          autoFocus
          contentEditableClassName="my-editor"
          lexicalTheme={customLexicalTheme}
          ref={mdxEditorRef}
          key={selectedFile?.filePath ?? 'editor'}
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