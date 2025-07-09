'use client'

import {
  TreeView,
  createTreeCollection,
  Checkmark,
  useTreeViewNodeContext
} from '@chakra-ui/react'
import { LuFile, LuFolder } from 'react-icons/lu'
import { useState } from 'react'
import { useProjectStore } from '@/store/projectStore' // update path as needed

interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

// Dummy project structure with nested folders
const rootNode: TreeNode = {
  id: 'ROOT',
  name: '',
  type: 'folder',
  children: [
    {
      id: 'books',
      name: 'books',
      type: 'folder',
      children: [
        { id: 'books/intro.md', name: 'intro.md', type: 'file' },
        {
          id: 'books/chapter1',
          name: 'chapter1',
          type: 'folder',
          children: [
            { id: 'books/chapter1/scene1.md', name: 'scene1.md', type: 'file' },
            { id: 'books/chapter1/scene2.md', name: 'scene2.md', type: 'file' },
          ],
        },
      ],
    },
    {
      id: 'references',
      name: 'references',
      type: 'folder',
      children: [
        { id: 'references/style.md', name: 'style.md', type: 'file' },
        { id: 'references/magic.md', name: 'magic.md', type: 'file' },
      ],
    },
  ],
}

// Create the Chakra tree collection
const collection = createTreeCollection<TreeNode>({
  nodeToValue: node => node.id,
  nodeToString: node => node.name,
  rootNode,
})

export const ProjectTree = () => {
  const { selectedContextFiles, toggleContextFile } = useProjectStore()

  /*const toggleContext = (fileId: string) => {
    setContextFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
  }*/

  const TreeNodeCheckbox = (props: TreeView.NodeCheckboxProps) => {
    const nodeState = useTreeViewNodeContext()
    return (
      <TreeView.NodeCheckbox aria-label="check node" {...props }>
        <Checkmark
          bg={{
            base: "bg",
            _checked: "colorPalette.solid",
            _indeterminate: "colorPalette.solid",
          }}
          size="sm"
          checked={nodeState.checked === true}
          indeterminate={nodeState.checked === "indeterminate"}
        />
      </TreeView.NodeCheckbox>
    )
  }
  
  return (
    <TreeView.Root collection={collection} maxW="sm">
      <TreeView.Label>Tree</TreeView.Label>
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
              <TreeView.Item onClick={() => alert(`Load file: ${node.id}`)} >
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
