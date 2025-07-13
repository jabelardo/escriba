import { Octokit } from '@octokit/rest'
import { useProjectStore } from '@/store/projectStore'

export async function fetchProjectFileContent(
    octokit: Octokit,
    owner: string,
    repo: string,
    path: string,
    branch = 'main'
  ): Promise<any> {
    const res = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })
  
    if (!('content' in res.data) || typeof res.data.content !== 'string') {
      throw new Error(`Invalid file response for ${path}`)
    }
  
    const decoded = atob(res.data.content)
    const content = new TextDecoder('utf-8').decode(
      Uint8Array.from([...decoded].map(char => char.charCodeAt(0)))
    )
  
    return {
      content: content ?? '',
      sha: res.data.sha
    }
  }

  export async function saveProjectFileContent({
    octokit,
    owner,
    repo,
    path,
    content,
    message,
    sha,
    branch = 'main',
  }: {
    octokit: Octokit
    owner: string
    repo: string
    path: string
    content: string
    message: string
    sha: string
    branch?: string
  }) {
    const contentEncoded = btoa(content)
    console.log('Saving file:', {content, contentEncoded})
    const result = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      branch,
      message,
      content: contentEncoded,
      sha,
    })
    const newSha = result.data.content?.sha
    if (newSha) {
      useProjectStore.getState().setSelectedFileSha(newSha)
    }
    return result
  }
  