"use client";

import { Flex } from "@radix-ui/themes";
import { useState, useRef, useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import {
  MDXEditor,
  type MDXEditorMethods,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
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
  quotePlugin,
  useCellValues,
  currentSelection$,
  activeEditor$,
} from "@mdxeditor/editor";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import {
  ArchiveIcon,
  MagicWandIcon,
  StopIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { EditorTopBar } from "./EditorTopBar";
import { fetchChatCompletion } from "@/lib/openrouter/chat";
import { saveProjectFileContent } from "@/lib/github/files";
import { Octokit } from "@octokit/rest";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useRevisionStore } from "@/store/revisionStore";

import "@mdxeditor/editor/style.css";

export const EditorPanel = () => {
  const mdxEditorRef = useRef<MDXEditorMethods | null>(null);
  const selectedFile = useProjectStore((s) => s.selectedFile);
  const setMarkdownContent = useProjectStore((s) => s.setSelectedFileContent);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFileChanged, setIsFileChanged] = useState(false);
  const token = useAuthStore((s) => s.githubToken);

  const activeSystemPrompt = useSettingsStore((s) => s.activeSystemPrompt);
  const activeContinuePrompt = useSettingsStore((s) => s.activeContinuePrompt);
  const activeRevisePrompt = useSettingsStore((s) => s.activeRevisePrompt);

  const markdownContent = useProjectStore((s) => {
    const c = s.selectedFile?.content;
    return typeof c === "string" ? c : "";
  });

  const originalMarkdownRef = useRef(markdownContent);

  const selectedFileId = `${useProjectStore.getState().selectedProject?.repo}/${selectedFile?.filePath}`;
  const activeRevision = useRevisionStore((s) => s.revisions[selectedFileId]);

  useEffect(() => {
    originalMarkdownRef.current = markdownContent;
    setIsFileChanged(false);
  }, [selectedFile?.filePath]);

  useEffect(() => {
    if (markdownContent && mdxEditorRef.current) {
      mdxEditorRef.current.setMarkdown(markdownContent);
      originalMarkdownRef.current = markdownContent;
    }
  }, [selectedFile?.filePath, markdownContent]);

  const TextGenerator = () => {
    const [activeEditor, currentSelection] = useCellValues(
      activeEditor$,
      currentSelection$,
    );

    const handleGenerateText = async () => {
      setIsGenerating(true);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const systemPromp = activeSystemPrompt?.value || "";
        const continuePrompt = activeContinuePrompt?.value || "";
        const revisePromptTemplate = activeRevisePrompt?.value || "";
        const model =
          useProjectStore.getState().selectedProject?.model ||
          "openrouter/auto";
        const apiKey = import.meta.env.VITE_OPENROUTER_KEY;
        const temperature = 1;
        const maxTokens = 512;

        if (!apiKey) {
          alert("OpenRouter API key is missing");
          return;
        }

        const isRevision =
          currentSelection && activeEditor && !currentSelection.isCollapsed();

        if (isRevision) {
          activeEditor.update(async () => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const selectedText = selection.getTextContent();
              const fullText = $getRoot().getTextContent();

              // Find the position of selected text
              const selectedIndex = fullText.indexOf(selectedText);
              const textBeforeSelection =
                selectedIndex !== -1
                  ? fullText.substring(0, selectedIndex)
                  : "";

              const context = textBeforeSelection;
              const revisePrompt = revisePromptTemplate
                ?.replace("{{selectedText}}", selectedText)
                ?.replace("{{context}}", context);
              const promptText = `${systemPromp}\n${revisePrompt}`;

              const revised = await fetchChatCompletion({
                apiKey,
                model,
                messages: [{ role: "user", content: promptText }],
                temperature: temperature,
                maxTokens: maxTokens,
                signal: controller.signal,
              });

              useRevisionStore.getState().setRevision(selectedFileId, {
                original: selectedText,
                revised: revised,
                editorState: activeEditor.getEditorState().toJSON(),
              });

              selection.removeText();

              // BLUE SKY FUTURE: transform revised into Markdown nodes insteado of inserting it as it is

              //selection.insertText(`[->${revised}<-]`)
              selection.insertRawText(`[->${revised}<-]`);
            }
          });
        } else {
          const promptText = `${systemPromp}\n${continuePrompt}\n\n${markdownContent}`;
          console.log({ "continue promptText": promptText });
          const generatedText = await fetchChatCompletion({
            apiKey,
            model,
            messages: [{ role: "user", content: promptText }],
            temperature: temperature,
            maxTokens: maxTokens,
            signal: controller.signal,
          });

          const newMarkdown = `${markdownContent}\n\n${generatedText}`;
          console.log({ "revision newMarkdown": newMarkdown });
          setMarkdownContent(newMarkdown);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Generation aborted by user");
        } else {
          console.error(err);
          alert(
            `Failed to generate text: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    };

    return (
      <ButtonWithTooltip
        children={<MagicWandIcon />}
        onClick={handleGenerateText}
        disabled={isGenerating}
        title={isGenerating ? "Generating..." : "Generate Text"}
      />
    );
  };

  const handleStopGenerateText = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSaveFile = async () => {
    console.log("Saving file:", { selectedFile, token });
    if (!selectedFile || !token) return;

    const octokit = new Octokit({ auth: token });
    const project = useProjectStore.getState().selectedProject;
    if (!project) return;

    try {
      await saveProjectFileContent({
        octokit,
        owner: project.owner,
        repo: project.repo,
        path: selectedFile.filePath,
        content: selectedFile.content,
        sha: selectedFile.sha,
        message: `Update ${selectedFile.filePath}`,
        branch: project.branch ?? "main",
      });
      alert("File saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save file");
    }
  };

  const handleEditorChange = (
    markdown: string,
    initialMarkdownNormalize: boolean,
  ) => {
    setMarkdownContent(markdown);
    if (initialMarkdownNormalize) {
      originalMarkdownRef.current = markdown;
      setIsFileChanged(false);
    } else {
      setIsFileChanged(markdown !== originalMarkdownRef.current);
    }
  };

  return (
    <Flex direction="column" height="100%" overflow="hidden" width="100%">
      <EditorTopBar filePath={selectedFile?.filePath} />
      <MDXEditor
        autoFocus
        ref={mdxEditorRef}
        key={selectedFile?.filePath ?? "editor"}
        markdown={markdownContent}
        onChange={handleEditorChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
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
                <TextGenerator />
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

                {activeRevision && (
                  <>
                    <Separator />
                    <ButtonWithTooltip
                      title="Approve Revision"
                      onClick={() => {
                        const markdown =
                          useProjectStore.getState().selectedFile?.content;
                        if (!markdown || !activeRevision) return;
                        const newContent = markdown
                          .replace("[->", "")
                          .replace("<-]", "");
                        useProjectStore
                          .getState()
                          .setSelectedFileContent(newContent);
                        useRevisionStore
                          .getState()
                          .clearRevision(selectedFileId);
                      }}
                    >
                      <CheckIcon />
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                      title="Reject Revision"
                      onClick={() => {
                        const original = activeRevision.original;
                        useProjectStore
                          .getState()
                          .setSelectedFileContent(original);
                        useRevisionStore
                          .getState()
                          .clearRevision(selectedFileId);
                      }}
                    >
                      <Cross2Icon />
                    </ButtonWithTooltip>
                  </>
                )}
              </>
            ),
          }),
        ]}
      />
    </Flex>
  );
};
