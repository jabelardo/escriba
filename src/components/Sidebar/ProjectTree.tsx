"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Box, Flex, Text, Checkbox } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { Octokit } from "@octokit/rest";
import { fetchProjectFileTree, type FileTreeNode } from "@/lib/github/filetree";

interface ProjectTreeProps {
  onFileSelect?: (fileId: string) => void;
}

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  contextFiles: Set<string>;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onToggleContext: (fileId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  contextFiles,
  onToggle,
  onSelect,
  onToggleContext,
}) => {
  const isFolder = node.type === "folder";
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = useCallback(() => {
    if (isFolder) {
      onToggle(node.id);
    } else {
      onSelect(node.id);
    }
  }, [isFolder, node.id, onToggle, onSelect]);

  const handleCheckboxClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onToggleContext(node.id);
    },
    [node.id, onToggleContext],
  );

  return (
    <>
      <Flex
        align="center"
        py="1"
        px="2"
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          cursor: "pointer",
          borderRadius: "var(--radius-2)",
          backgroundColor: isSelected ? "var(--accent-3)" : "transparent",
        }}
        onClick={handleClick}
        className="hover:bg-[var(--gray-3)] transition-colors"
      >
        {isFolder && hasChildren && (
          <Box mr="1">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Box>
        )}

        {!isFolder && <Box width="16px" mr="1" />}

        <Box mr="2">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen size={16} />
            ) : (
              <Folder size={16} />
            )
          ) : (
            <File size={16} />
          )}
        </Box>

        <Text
          size="2"
          weight={isSelected ? "medium" : "regular"}
          style={{ flex: 1 }}
        >
          {node.name}
        </Text>

        {!isFolder && (
          <Box onClick={handleCheckboxClick}>
            <Checkbox checked={contextFiles.has(node.id)} size="1" />
          </Box>
        )}
      </Flex>

      {isFolder && isExpanded && hasChildren && (
        <Box>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={isExpanded}
              isSelected={isSelected}
              contextFiles={contextFiles}
              onToggle={onToggle}
              onSelect={onSelect}
              onToggleContext={onToggleContext}
            />
          ))}
        </Box>
      )}
    </>
  );
};

export const ProjectTree = ({ onFileSelect }: ProjectTreeProps) => {
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const token = useAuthStore((s) => s.githubToken);
  const [contextFiles, setContextFiles] = useState<Set<string>>(new Set());
  const [rootNode, setRootNode] = useState<FileTreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const toggleContext = useCallback((fileId: string) => {
    setContextFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }, []);

  const toggleNode = useCallback((nodeId: string) => {
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

  const selectNode = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
      onFileSelect?.(nodeId);
    },
    [onFileSelect],
  );

  useEffect(() => {
    const load = async () => {
      if (!selectedProject || !token) return;
      const octokit = new Octokit({ auth: token });
      const children = await fetchProjectFileTree(
        octokit,
        selectedProject.owner,
        selectedProject.repo,
        (name) => name.endsWith(".md"),
      );
      const root: FileTreeNode = {
        id: "ROOT",
        name: "",
        type: "folder",
        children,
      };
      setRootNode(root);

      // Auto-expand root
      setExpandedNodes(new Set(["ROOT"]));
    };
    load();
  }, [selectedProject, token]);

  const renderTree = useMemo(() => {
    if (!rootNode || !rootNode.children) return null;

    return rootNode.children.map((node) => (
      <TreeNode
        key={node.id}
        node={node}
        level={0}
        isExpanded={expandedNodes.has(node.id)}
        isSelected={selectedNode === node.id}
        contextFiles={contextFiles}
        onToggle={toggleNode}
        onSelect={selectNode}
        onToggleContext={toggleContext}
      />
    ));
  }, [
    rootNode,
    expandedNodes,
    selectedNode,
    contextFiles,
    toggleNode,
    selectNode,
    toggleContext,
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
    <Box style={{ maxWidth: "320px" }}>
      <Box
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid var(--gray-6)",
          borderRadius: "var(--radius-2)",
        }}
      >
        {renderTree}
      </Box>
    </Box>
  );
};
