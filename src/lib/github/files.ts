export async function fetchProjectFileContent(
    octokit: Octokit,
    owner: string,
    repo: string,
    path: string,
    branch = 'main'
  ): Promise<string> {
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
    const utf8 = new TextDecoder('utf-8').decode(
      Uint8Array.from([...decoded].map(char => char.charCodeAt(0)))
    )
  
    return utf8
  }
  