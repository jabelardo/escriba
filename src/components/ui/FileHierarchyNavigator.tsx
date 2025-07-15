import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, FileText, FileCode, FileImage } from 'lucide-react';

// Types
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  extension?: string;
  size?: number;
  modified?: Date;
}

interface FileHierarchyState {
  expandedNodes: Set<string>;
  selectedNode: string | null;
}

// Sample data - replace with your actual file structure
const sampleFileStructure: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          { id: '3', name: 'Button.tsx', type: 'file', extension: 'tsx' },
          { id: '4', name: 'Input.tsx', type: 'file', extension: 'tsx' },
          { id: '5', name: 'Modal.tsx', type: 'file', extension: 'tsx' },
        ]
      },
      {
        id: '6',
        name: 'utils',
        type: 'folder',
        children: [
          { id: '7', name: 'helpers.ts', type: 'file', extension: 'ts' },
          { id: '8', name: 'constants.ts', type: 'file', extension: 'ts' },
        ]
      },
      { id: '9', name: 'App.tsx', type: 'file', extension: 'tsx' },
      { id: '10', name: 'main.tsx', type: 'file', extension: 'tsx' },
    ]
  },
  {
    id: '11',
    name: 'public',
    type: 'folder',
    children: [
      { id: '12', name: 'index.html', type: 'file', extension: 'html' },
      { id: '13', name: 'favicon.ico', type: 'file', extension: 'ico' },
      {
        id: '14',
        name: 'assets',
        type: 'folder',
        children: [
          { id: '15', name: 'logo.png', type: 'file', extension: 'png' },
          { id: '16', name: 'background.jpg', type: 'file', extension: 'jpg' },
        ]
      }
    ]
  },
  { id: '17', name: 'package.json', type: 'file', extension: 'json' },
  { id: '18', name: 'tsconfig.json', type: 'file', extension: 'json' },
  { id: '19', name: 'vite.config.ts', type: 'file', extension: 'ts' },
  { id: '20', name: 'README.md', type: 'file', extension: 'md' },
];

// File icon component
const FileIcon: React.FC<{ extension?: string; className?: string }> = ({ extension, className = "w-4 h-4" }) => {
  const getIcon = () => {
    if (!extension) return <File className={className} />;
    
    switch (extension.toLowerCase()) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return <FileCode className={`${className} text-blue-500`} />;
      case 'json':
        return <FileText className={`${className} text-yellow-500`} />;
      case 'html':
        return <FileCode className={`${className} text-orange-500`} />;
      case 'md':
        return <FileText className={`${className} text-gray-600`} />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage className={`${className} text-purple-500`} />;
      default:
        return <File className={className} />;
    }
  };
  
  return getIcon();
};

// File node component
const FileNodeComponent: React.FC<{
  node: FileNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}> = ({ node, level, isExpanded, isSelected, onToggle, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(node.id);
    if (node.type === 'folder') {
      onToggle(node.id);
    }
  }, [node.id, node.type, onSelect, onToggle]);

  const paddingLeft = level * 20 + 8;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 transition-colors ${
          isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
        }`}
        style={{ paddingLeft }}
        onClick={handleClick}
      >
        {node.type === 'folder' && (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        )}
        
        <div className="mr-2">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-600" />
            ) : (
              <Folder className="w-4 h-4 text-blue-600" />
            )
          ) : (
            <FileIcon extension={node.extension} />
          )}
        </div>
        
        <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
          {node.name}
        </span>
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main file hierarchy navigator component
const FileHierarchyNavigator: React.FC<{
  fileStructure?: FileNode[];
  onFileSelect?: (node: FileNode) => void;
  className?: string;
}> = ({ 
  fileStructure = sampleFileStructure, 
  onFileSelect,
  className = ""
}) => {
  const [state, setState] = useState<FileHierarchyState>({
    expandedNodes: new Set(['1']), // Start with root folder expanded
    selectedNode: null,
  });

  const toggleNode = useCallback((id: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedNodes);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { ...prev, expandedNodes: newExpanded };
    });
  }, []);

  const selectNode = useCallback((id: string) => {
    setState(prev => ({ ...prev, selectedNode: id }));
    
    // Find the selected node and call onFileSelect if provided
    const findNode = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const selectedNode = findNode(fileStructure);
    if (selectedNode && onFileSelect) {
      onFileSelect(selectedNode);
    }
  }, [fileStructure, onFileSelect]);

  const renderNodes = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <FileNodeComponent
        key={node.id}
        node={node}
        level={level}
        isExpanded={state.expandedNodes.has(node.id)}
        isSelected={state.selectedNode === node.id}
        onToggle={toggleNode}
        onSelect={selectNode}
      />
    ));
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="border-b bg-gray-50 px-4 py-2">
        <h3 className="text-sm font-medium text-gray-900">File Explorer</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {renderNodes(fileStructure)}
      </div>
    </div>
  );
};

export default FileHierarchyNavigator;