"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  File,
  FilePlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Box, Flex, Text, Checkbox, IconButton } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { useFileTreeStore } from "@/store/fileTreeStore";
import { fetchProjectFileContent, createProjectFile } from "@/lib/github/files";
import { CreateFileDialog } from "./CreateFileDialog";
import { useNotificationStore } from "@/store/notificationStore";
import type { FileTreeNode } from "@/lib/github/filetree";

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  contextFiles: Set<string>;
  expandedNodes: Set<string>;
  selectedNode: string | null;
  onToggleFolder: (nodeId: string) => void;
  onSelectFile: (nodeId: string) => void;
  onToggleContext: (fileId: string) => void;
  onCreateFile: (nodeId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  contextFiles,
  expandedNodes,
  selectedNode,
  onToggleFolder,
  onSelectFile,
  onToggleContext,
  onCreateFile,
}) => {
  const isFolder = node.type === "folder";
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNode === node.id;

  const handleNavigationClick = useCallback(() => {
    if (isFolder) {
      onToggleFolder(node.id);
    } else {
      onSelectFile(node.id);
    }
  }, [isFolder, node.id, onToggleFolder, onSelectFile]);

  const handleSelectFileClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onToggleContext(node.id);
    },
    [node.id, onToggleContext],
  );

  const handleCreateFileClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onCreateFile(node.id);
    },
    [node.id, onCreateFile],
  );

  return (
    <>
      <Flex
        align="center"
        justify={"start"}
        py="1"
        px="2"
        gap={"2"}
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          cursor: "pointer",
        }}
        onClick={handleNavigationClick}
        className="hover:bg-[var(--gray-3)] transition-colors"
      >
        <Flex gap={"2"} align="center" wrap="wrap">
          {isFolder && hasChildren && (
            <>
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </>
          )}
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={16} />
            ) : (
              <Folder size={16} />
            )
          ) : (
            <File size={16} />
          )}

          <Text
            size="2"
            weight={isSelected ? "medium" : "regular"}
            style={{ flex: 1 }}
          >
            {node.name}
          </Text>
        </Flex>
        {isFolder ? (
          <IconButton onClick={handleCreateFileClick} variant="ghost">
            <FilePlus />
          </IconButton>
        ) : (
          <Checkbox
            onClick={handleSelectFileClick}
            checked={contextFiles.has(node.id)}
            size="1"
          />
        )}
      </Flex>

      {isFolder && isExpanded && hasChildren && (
        <>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              contextFiles={contextFiles}
              expandedNodes={expandedNodes}
              selectedNode={selectedNode}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onToggleContext={onToggleContext}
              onCreateFile={onCreateFile}
            />
          ))}
        </>
      )}
    </>
  );
};

export const ProjectTree = () => {
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const contextFileContents = useProjectStore((s) => s.contextFileContents);
  const token = useAuthStore((s) => s.githubToken);
  const { addNotification } = useNotificationStore();
  const [contextFiles, setContextFiles] = useState<Set<string>>(new Set());
  const { fileTree, fetchFileTree } = useFileTreeStore();
  const rootNode = fileTree;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isCreateFileDialogOpen, setCreateFileDialogOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  const toggleContext = useCallback((filePath: string) => {
    setContextFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const loadNewFiles = async () => {
      if (!selectedProject || !token) {
        return;
      }
      const currentLoadedFiles = Array.isArray(contextFileContents)
        ? contextFileContents
        : [];
      const currentLoaded = new Set(currentLoadedFiles.map((f) => f.filePath));

      const filesToLoad = [...contextFiles].filter(
        (file) => !currentLoaded.has(file),
      );
      const filesToUnload = [...currentLoaded].filter(
        (file) => !contextFiles.has(file),
      );
      // Unload removed files
      const newContextFileContents =
        currentLoadedFiles.filter(
          (file) => !filesToUnload.includes(file.filePath),
        ) || [];

      // Load new files
      for (const filePath of filesToLoad) {
        try {
          const content = await fetchProjectFileContent(
            token,
            selectedProject.owner,
            selectedProject.repo,
            filePath,
          );
          if (!content.content) {
            continue;
          }
          newContextFileContents.push({
            filePath,
            content: content.content,
            sha: content.sha,
          });
        } catch (error) {
          console.error(`Failed to load ${filePath}:`, error);
        }
      }
      if (newContextFileContents !== currentLoadedFiles) {
        useProjectStore
          .getState()
          .setContextFileContents(newContextFileContents);
      }
    };

    loadNewFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextFiles, selectedProject, token]);

  const createFile = useCallback((nodeId: string) => {
    setCurrentNode(nodeId);
    setCreateFileDialogOpen(true);
  }, []);

  const toggleFolder = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleCreateFile = async (filename: string) => {
    if (!selectedProject || !token || !currentNode) {
      return;
    }

    const path =
      currentNode === "ROOT" ? filename : `${currentNode}/${filename}`;

    await createProjectFile({
      auth: token,
      owner: selectedProject.owner,
      repo: selectedProject.repo,
      path,
      content: "",
      message: `feat: create ${path}`,
    });

    // Refresh file tree
    await fetchFileTree(token, selectedProject.owner, selectedProject.repo);
    addNotification({
      type: "success",
      title: "File created",
      message: `File ${path} has been created successfully.`,
    });
  };

  const onFileSelect = useCallback(
    async (filePath: string) => {
      if (!selectedProject || !token) {
        return;
      }
      const content = await fetchProjectFileContent(
        token,
        selectedProject.owner,
        selectedProject.repo,
        filePath,
      );
      useProjectStore.getState().setSelectedFile({
        filePath,
        content: content.content,
        currentContent: content.content,
        sha: content.sha,
      });
    },
    [selectedProject, token],
  );

  const selectFile = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
      onFileSelect(nodeId);
    },
    [onFileSelect],
  );

  useEffect(() => {
    const load = async () => {
      if (!selectedProject || !token) {
        return;
      }
      await fetchFileTree(token, selectedProject.owner, selectedProject.repo);
      // Auto-expand root
      setExpandedNodes(new Set(["ROOT"]));
    };
    load();
  }, [selectedProject, token, fetchFileTree]);

  const renderTree = useMemo(() => {
    if (!rootNode || !rootNode.children) {
      return null;
    }

    return rootNode.children.map((node) => (
      <TreeNode
        key={node.id}
        node={node}
        level={0}
        contextFiles={contextFiles}
        onToggleFolder={toggleFolder}
        onSelectFile={selectFile}
        onToggleContext={toggleContext}
        onCreateFile={createFile}
        expandedNodes={expandedNodes}
        selectedNode={selectedNode}
      />
    ));
  }, [
    rootNode,
    expandedNodes,
    selectedNode,
    contextFiles,
    toggleFolder,
    toggleContext,
    createFile,
    selectFile,
  ]);

  if (!selectedProject) {
    return (
      <Box p="4">
        <Text size="2" color="gray">
          Select a project to view its files
        </Text>
      </Box>
    );
  }

  return (
    <Flex direction="column" justify={"start"}>
      {renderTree}
      <CreateFileDialog
        isOpen={isCreateFileDialogOpen}
        onClose={() => {
          setCreateFileDialogOpen(false);
        }}
        onCreate={handleCreateFile}
      />
    </Flex>
  );
};
