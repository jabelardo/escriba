import { Octokit } from '@octokit/rest'

export interface FileTreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: FileTreeNode[]
}

export async function fetchProjectFileTree(octokit: Octokit, owner: string, repo: string, path = ''): Promise<FileTreeNode[]> {
  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  })

  const entries = Array.isArray(response.data) ? response.data : [response.data]

  const result: FileTreeNode[] = await Promise.all(
    entries.map(async (item) => {
      if (item.type === 'dir') {
        const children = await fetchProjectFileTree(octokit, owner, repo, item.path)
        return {
          id: item.path,
          name: item.name,
          type: 'folder',
          children,
        }
      } else {
        return {
          id: item.path,
          name: item.name,
          type: 'file',
        }
      }
    })
  )

  return result
}