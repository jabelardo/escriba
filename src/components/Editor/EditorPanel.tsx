"use client";

import { Callout, Flex } from "@radix-ui/themes";
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
  useCellValue,
  realmPlugin,
  createRootEditorSubscription$,
} from "@mdxeditor/editor";
import {
  $copyNode,
  $createParagraphNode,
  $createTabNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  ParagraphNode,
  TextNode,
  type NodeKey,
} from "lexical";
import { brown } from "@radix-ui/colors";
import {
  ArchiveIcon,
  MagicWandIcon,
  StopIcon,
  CheckIcon,
  Cross2Icon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { EditorTopBar } from "./EditorTopBar";
import { fetchChatCompletion } from "@/lib/openrouter/chat";
import { saveProjectFileContent } from "@/lib/github/files";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useRevisionStore, type Revision } from "@/store/revisionStore";

import "@mdxeditor/editor/style.css";
import "./EditorPanel.css";
import {
  DEFAULT_CONTINUE_PROMPT,
  DEFAULT_REVISION_PROMPT,
} from "@/utils/consts";

interface TextGeneratorProps {
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  abortControllerRef: React.RefObject<AbortController | null>;
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  selectedFileId: string;
}

const TextGenerator: React.FC<TextGeneratorProps> = ({
  isGenerating,
  setIsGenerating,
  abortControllerRef,
  markdownContent,
  setMarkdownContent,
}) => {
  const [activeEditor, readSelection] = useCellValues(
    activeEditor$,
    currentSelection$,
  );
  const activeSystemPromptId = useSettingsStore((s) => s.activeSystemPrompt);
  const activeContinuePromptId = useSettingsStore(
    (s) => s.activeContinuePrompt,
  );
  const activeRevisePromptId = useSettingsStore((s) => s.activeRevisePrompt);
  const systemPrompts = useSettingsStore((s) => s.systemPrompts);
  const continuePrompts = useSettingsStore((s) => s.continuePrompts);
  const revisePrompts = useSettingsStore((s) => s.revisePrompts);

  const handleGenerateText = async () => {
    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const buildPromptContext = () => {
      const promptContext = useProjectStore
        .getState()
        .contextFileContents?.map((file) => {
          return `[${file.filePath}:Start]\n${file.content}\n[${file.filePath}:End]`;
        });
      return promptContext?.join("\n") + "\n" || "";
    };

    try {
      const systemPrompt =
        systemPrompts.find((p) => p.id === activeSystemPromptId)?.value || "";
      const continuePrompt =
        continuePrompts.find((p) => p.id === activeContinuePromptId)?.value ||
        DEFAULT_CONTINUE_PROMPT;
      const revisePromptTemplate =
        revisePrompts.find((p) => p.id === activeRevisePromptId)?.value ||
        DEFAULT_REVISION_PROMPT;
      const model =
        useProjectStore.getState().selectedProject?.model || "openrouter/auto";
      const apiKey = import.meta.env.VITE_OPENROUTER_KEY;
      const temperature =
        useProjectStore.getState().selectedProject?.temperature || 1;
      const maxTokens =
        useProjectStore.getState().selectedProject?.maxTokens || 512;

      if (!apiKey) {
        alert("OpenRouter API key is missing");
        return;
      }

      const isRevision =
        readSelection &&
        activeEditor &&
        !readSelection.isCollapsed() &&
        $isRangeSelection(readSelection);

      if (isRevision) {
        const { selectedText, fullText } = activeEditor.read(() => {
          const selectedText = readSelection.getTextContent().trim();
          const fullText = $getRoot().getTextContent();
          return { selectedText, fullText };
        });

        // Find the position of selected text
        const selectedIndex = fullText.indexOf(selectedText);
        const textBeforeSelection =
          selectedIndex !== -1 ? fullText.substring(0, selectedIndex) : "";

        const previousTextContext =
          textBeforeSelection.length > 0
            ? `[CONTEXT:begin]${textBeforeSelection}[CONTEXT:end]\n`
            : "";

        const context = buildPromptContext() + previousTextContext;

        const userInput = prompt("Enter your instructions for the revision:");

        const revisePrompt = revisePromptTemplate
          ?.replace("{{userInput}}", userInput || "")
          ?.replace("{{selectedText}}", selectedText)
          ?.replace("{{context}}", context);
        const promptText = `${systemPrompt}\n${revisePrompt}`;

        const llmResult = await fetchChatCompletion({
          apiKey,
          model,
          messages: [{ role: "user", content: promptText }],
          temperature: temperature,
          maxTokens: maxTokens,
          signal: controller.signal,
        });
        const revised = llmResult.trim();
        if (!revised) {
          console.log("No text generated. Please try again.");
          return;
        }
        activeEditor.update(
          () => {
            const writeSelection = $getSelection();
            if (!$isRangeSelection(writeSelection)) {
              return;
            }
            const inRevisionNodeKeys = writeSelection
              .getNodes()
              .map((node) => node.getKey());
            const previousEditorState = activeEditor.getEditorState().toJSON();

            const endPoint = writeSelection.isBackward()
              ? writeSelection.anchor
              : writeSelection.focus;

            const parts = revised.split(/(\r?\n|\t)/);
            const length = parts.length;
            let paragraphNode = $createParagraphNode();
            const paragraphNodes: ParagraphNode[] = [paragraphNode];
            const revisedNodeKeys: NodeKey[] = [paragraphNode.getKey()];
            const parent = endPoint.getNode().getParent() || $getRoot();
            parent.insertAfter(paragraphNode);
            for (let i = 0; i < length; i++) {
              const part = parts[i];
              if (part === "\n" || part === "\r\n") {
                paragraphNodes.push(paragraphNode);
                const newParagraphNode = $createParagraphNode();
                revisedNodeKeys.push(newParagraphNode.getKey());
                paragraphNode.insertAfter(newParagraphNode);
                paragraphNode = newParagraphNode;
              } else if (part === "\t") {
                paragraphNode.append($createTabNode());
              } else {
                // TODO: Handle markdown formatting
                paragraphNode.append($createTextNode(part));
              }
            }

            useRevisionStore.getState().setRevision({
              previousEditorState,
              inRevisionNodeKeys,
              revisedNodeKeys,
            });
          },
          { discrete: true },
        );
      } else {
        const context = buildPromptContext();
        const promptText = `${systemPrompt}\n${continuePrompt}\n${context}${markdownContent}`;
        const generatedText = await fetchChatCompletion({
          apiKey,
          model,
          messages: [{ role: "user", content: promptText }],
          temperature: temperature,
          maxTokens: maxTokens,
          signal: controller.signal,
        });

        const newMarkdown = `${markdownContent}\n\n${generatedText}`;
        setMarkdownContent(newMarkdown);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Generation aborted by user");
      } else {
        console.error(err);
        alert(
          `Failed to generate text: ${
            err instanceof Error ? err.message : String(err)
          }`,
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

interface ApproveRevisionProps {
  activeRevision: Revision;
  selectedFileId: string;
}

const ApproveRevision: React.FC<ApproveRevisionProps> = ({
  activeRevision,
}) => {
  const activeEditor = useCellValue(activeEditor$);
  const handleApproveRevision = () => {
    if (!activeRevision || !activeEditor) {
      return;
    }
    activeEditor?.update(() => {
      activeRevision.inRevisionNodeKeys.forEach((key) => {
        const inRevisionNode = $getNodeByKey(key);
        inRevisionNode?.remove();
      });

      activeRevision.revisedNodeKeys.forEach((key) => {
        const node = $getNodeByKey(key);
        if (node instanceof ParagraphNode) {
          const newNode = $createParagraphNode();
          newNode.append(...node.getChildren().map($copyNode));
          node.replace(newNode);
        }
      });
    });
    useRevisionStore.getState().clearRevision();
  };

  return (
    <ButtonWithTooltip title="Approve Revision" onClick={handleApproveRevision}>
      <CheckIcon />
    </ButtonWithTooltip>
  );
};

interface RejectRevisionProps {
  activeRevision: Revision;
  selectedFileId: string;
}

const RejectRevision: React.FC<RejectRevisionProps> = ({ activeRevision }) => {
  const activeEditor = useCellValue(activeEditor$);
  const handleRejectRevision = () => {
    if (!activeRevision) {
      return;
    }
    activeEditor?.update(() => {
      const original = activeEditor.parseEditorState(
        activeRevision.previousEditorState,
      );
      activeEditor.setEditorState(original);
    });
    useRevisionStore.getState().clearRevision();
  };

  return (
    <ButtonWithTooltip title="Reject Revision" onClick={handleRejectRevision}>
      <Cross2Icon />
    </ButtonWithTooltip>
  );
};

export const EditorPanel = () => {
  const mdxEditorRef = useRef<MDXEditorMethods | null>(null);
  const selectedFile = useProjectStore((s) => s.selectedFile);
  const setMarkdownContent = useProjectStore((s) => s.setSelectedFileCurrentContent);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isFileChanged = useProjectStore((s) => s.isSelectedFileChanged());
  const token = useAuthStore((s) => s.githubToken);

  const markdownContent = selectedFile?.currentContent || "";

  const originalMarkdownRef = useRef(markdownContent);

  const selectedFileId = `${
    useProjectStore.getState().selectedProject?.repo || ""
  }/${selectedFile?.filePath || ""}`;
  const activeRevision = useRevisionStore((s) => s.revision);

  useEffect(() => {
    if (markdownContent && mdxEditorRef.current) {
      mdxEditorRef.current.setMarkdown(markdownContent);
      originalMarkdownRef.current = markdownContent;
    }
  }, [selectedFile?.filePath, markdownContent]);

  const handleStopGenerateText = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !token) {
      return;
    }

    const project = useProjectStore.getState().selectedProject;
    if (!project) {
      return;
    }

    try {
      await saveProjectFileContent({
        auth: token,
        owner: project.owner,
        repo: project.repo,
        path: selectedFile.filePath,
        content: selectedFile.currentContent,
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
    markdown: string
  ) => {
    setMarkdownContent(markdown);
  };

  const revisionStylePlugin = realmPlugin({
    update(realm) {
      realm.pub(createRootEditorSubscription$, (theEditor) => {
        return theEditor.registerNodeTransform(
          ParagraphNode,
          (paragraphNode: ParagraphNode) => {
            if (
              activeRevision?.revisedNodeKeys.includes(paragraphNode.getKey())
            ) {
              for (const child of paragraphNode.getChildren()) {
                if (child instanceof TextNode) {
                  child.setStyle(`background-color: ${brown.brown10};`);
                }
              }
            }
          },
        );
      });
    },
  });

  return (
    <Flex direction="column" height="100%" overflow="hidden" width="100%">
      <EditorTopBar filePath={selectedFile?.filePath} />
      {selectedFile?.filePath ? (
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
            revisionStylePlugin(),
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
                  <TextGenerator
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                    abortControllerRef={abortControllerRef}
                    markdownContent={markdownContent}
                    setMarkdownContent={setMarkdownContent}
                    selectedFileId={selectedFileId}
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
                  {activeRevision && (
                    <>
                      <Separator />
                      <ApproveRevision
                        activeRevision={activeRevision}
                        selectedFileId={selectedFileId}
                      />
                      <RejectRevision
                        activeRevision={activeRevision}
                        selectedFileId={selectedFileId}
                      />
                    </>
                  )}
                </>
              ),
            }),
          ]}
        />
      ) : (
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Please select a file to edit. Use the sidebar to navigate your
            project files.
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
};
