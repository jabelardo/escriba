import {
  CloseButton,
  Stack,
  Input,
  Button,
  Text,
  Spinner,
  Dialog
} from '@chakra-ui/react'
import { Toaster, toaster } from "@/components/ui/toaster"
import { useRef, useState } from 'react'
import { Octokit } from '@octokit/rest'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'

export const AddProjectForm = () => {
  const token = useAuthStore((s) => s.githubToken)
  const addProject = useProjectStore((s) => s.addProject)
  const projects = useProjectStore(s => s.projects)
  const selectProject = useProjectStore(s => s.selectProject)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const octokit = new Octokit({
    auth: token
  })

  const isValidRepo = (input: string) => {
    return /^([\w-]+)\/([\w.-]+)$/.test(input.trim()) || 
         /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/.test(input.trim())
  }
  
  const parseOwnerRepo = (v: string) => {
    const m = v.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (m) return [m[1], m[2]]
    const parts = v.split('/')
    return parts.length === 2 ? [parts[0], parts[1]] : null
  }

  const checkFolders = async (owner: string, repo: string) => {
    const list = ['books', 'references']
    const missingLocal: string[] = []
    for (const folder of list) {
      try {
        await octokit.rest.repos.getContent({ owner, repo, path: folder })
      } catch {
        missingLocal.push(folder)
      }
    }
    return missingLocal
  }

  const createKeep = async (owner: string, repo: string, folder: string) => {
    const path = `${folder}/.gitkeep`
    const message = `chore: ensure ${folder}/ exists`
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: '',
      branch: 'main',
    })
  }

  const handleAdd = async () => {
    setLoading(true)
    setError(null)
    const pr = parseOwnerRepo(input.trim())
    if (!pr) {
      setError('Invalid repo format: owner/repo or GitHub URL')
      setLoading(false)
      return
    }

    const [owner, repo] = pr
    try {
      await octokit.rest.repos.get({ owner, repo })
    } catch (err: any) {
      console.error('GitHub error:', err)
      const errorMessage = err?.response?.data?.message 
        ? err?.response?.data?.message + `: ${owner}/${repo}`
        : 'Unknown GitHub error'
      setError(errorMessage)
      setLoading(false)
      return
    }
    
    const missingFolders = await checkFolders(owner, repo)
    if (missingFolders.length > 0) {
      setMissing(missingFolders)
      onOpen()
    } else {
      const normalized = { 
        owner: owner.toLowerCase(), 
        repo: repo.toLowerCase() 
      }
      const exists = projects.some(
        (p) =>
          p.owner.toLowerCase() === normalized.owner &&
          p.repo.toLowerCase() === normalized.repo
      )
      if (exists) {
        toaster.create({
          title: 'Project already added',
          description: `${owner}/${repo} is already registered.`,
          type: 'warning',
          duration: 3000,
          closable: true,
        })
      } else {
        addProject({ owner, repo })
        toaster.create({
          title: 'Project added',
          description: `${owner}/${repo} has been added successfully.`,
          type: 'success',
          duration: 3000,
          closable: true,
        })
      }
      setInput('')
    }
    setLoading(false)
  }

  const handleCreateFolders = async () => {
    if (!token) return
    const [owner, repo] = parseOwnerRepo(input.trim())!
    setLoading(true)
    try {
      for (const f of missing) await createKeep(owner, repo, f)
      addProject({ owner, repo })
      setMissing([])
      onClose()
    } catch (e: any) {
      setError('Failed to create folders: ' + e.message)
    } finally {
      setLoading(false)
    }
  }
  
  const errorToaster = () => {
    return error 
      ? toaster.create({
          title: 'Error',
          description: error,
          type: "error",
          duration: 3000,
          closable: true,
        }) && setError(null)
      : null
  }
  
  return (
     <Stack gap={4}>
      {errorToaster()}
      <Input
        placeholder='owner/repo or GitHub URL'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        colorPalette='teal'
        onClick={handleAdd}
        loading={loading}
        disabled={!isValidRepo(input) || loading}
      >
        Add Project
      </Button>
      
      <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create missing folders?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                The repository is missing these required folders:{' '}
                <strong>{missing.join(', ')}</strong>.
              </Text>
              <Text mt={2}>
                Escriba requires both <code>books/</code> and <code>references/</code> to function.
                Would you like to create them now with a <code>.gitkeep</code> in each?
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant='outline' onClick={() => { onClose(); setMissing([]) }}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette='teal'
                ml={3}
                onClick={handleCreateFolders}
                loading={loading}
              >
                Create Folders
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
      <Toaster />
     </Stack>
  )
}


