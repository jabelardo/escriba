'use client'

import {
  TreeView,
  createTreeCollection,
  Checkmark,
  useTreeViewNodeContext
} from '@chakra-ui/react'
import { LuFile, LuFolder } from 'react-icons/lu'
import { useEffect, useMemo, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { Octokit } from '@octokit/rest'
import { fetchProjectFileTree, type FileTreeNode } from '@/lib/github/filetree'

interface ProjectTreeProps {
  onFileSelect?: (fileId: string) => void
}

export const ProjectTree = ({ onFileSelect }: ProjectTreeProps) => {
  const selectedProject = useProjectStore((s) => s.selectedProject)
  const token = useAuthStore((s) => s.githubToken)
  const [contextFiles, setContextFiles] = useState<Set<string>>(new Set())
  const [rootNode, setRootNode] = useState<FileTreeNode | null>(null)

  const toggleContext = (fileId: string) => {
    setContextFiles((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
  }

  useEffect(() => {
    const load = async () => {
      if (!selectedProject || !token) return
      const octokit = new Octokit({ auth: token })
      const children = await fetchProjectFileTree(
        octokit,
        selectedProject.owner, 
        selectedProject.repo,
        (name) => name.endsWith('.md'))
      setRootNode({
        id: 'ROOT',
        name: '',
        type: 'folder',
        children,
      })
    }
    load()
  }, [selectedProject, token])

  const collection = useMemo(() => {
    if (!rootNode) return createTreeCollection({ rootNode: { id: '', name: '', type: 'folder', children: [] } })
    return createTreeCollection<FileTreeNode>({
      rootNode,
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
    })
  }, [rootNode])

  const TreeNodeCheckbox = (props: TreeView.NodeCheckboxProps) => {
    const nodeState = useTreeViewNodeContext()
    return (
      <TreeView.NodeCheckbox aria-label="check node" {...props}>
        <Checkmark
          bg={{
            base: 'bg',
            _checked: 'colorPalette.solid',
            _indeterminate: 'colorPalette.solid',
          }}
          size="sm"
          checked={nodeState.checked === true}
          indeterminate={nodeState.checked === 'indeterminate'}
        />
      </TreeView.NodeCheckbox>
    )
  }

  if (!selectedProject) {
    return <div>Select a project to view its files</div>
  }
  
  return (
    <TreeView.Root collection={collection} maxW="sm">
   
      <TreeView.Tree>
        <TreeView.Node
          indentGuide={<TreeView.BranchIndentGuide />}
          render={({ node, nodeState }) =>
            nodeState.isBranch ? (
              <TreeView.BranchControl>
                <LuFolder />
                <TreeView.BranchText>{node.name}</TreeView.BranchText>
              </TreeView.BranchControl>
            ) : (
              <TreeView.Item onClick={() => {
                onFileSelect?.(node.id)
              }}>              
                <LuFile />
                <TreeView.ItemText>{node.name}</TreeView.ItemText>
                <TreeNodeCheckbox onClick={() => toggleContext(node.id)} />
              </TreeView.Item>
            )
          }
        />
      </TreeView.Tree>
    </TreeView.Root>
  )
}
