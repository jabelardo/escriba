'use client'

import {
  Input,
  Button,
  Stack,
  Text,
  Spinner,
  Dialog,
  CloseButton
} from '@chakra-ui/react'
import { Toaster, toaster } from '@/components/ui/toaster'
import { useState, useRef } from 'react'
import { Octokit } from '@octokit/rest'
import { useAuthStore } from '../../store/authStore'
import { useProjectStore } from '../../store/projectStore'

export const CreateProjectForm = () => {
  const token = useAuthStore(s => s.githubToken)
  const octokit = new Octokit({ auth: token })
  const addProject = useProjectStore(s => s.addProject)
  const selectProject = useProjectStore(s => s.selectProject)

  const [repoName, setRepoName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)

    const trimmed = repoName.trim()
    if (!/^[\w.-]+$/.test(trimmed)) {
      setError('Invalid repository name')
      setLoading(false)
      return
    }

    try {
      // Get user info to determine repo owner
      const { data: user } = await octokit.rest.users.getAuthenticated()
      const owner = user.login

      // Create the repo
      await octokit.rest.repos.createForAuthenticatedUser({
        name: trimmed,
        private: true,
        auto_init: false,
      })

      // Create .gitkeep in books and references
      for (const folder of ['books', 'references']) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo: trimmed,
          path: `${folder}/.gitkeep`,
          message: `chore: add ${folder}/ folder`,
          content: '',
          branch: 'main',
        })
      }

      addProject({ owner, repo: trimmed })
      toaster.create({
        title: 'Project created',
        description: `${owner}/${trimmed} created and initialized successfully.`,
        type: 'success',
        duration: 3000,
        closable: true,
      })
      setRepoName('')
    } catch (e: any) {
      console.error('Repo creation failed', e)
      setError(e?.response?.data?.message || e.message || 'Unknown error')
    }

    setLoading(false)
  }

  const errorToaster = () =>
    error &&
    toaster.create({
      title: 'Error',
      description: error,
      type: 'error',
      duration: 3000,
      closable: true,
    })

  return (
    <Stack gap={4}>
      {errorToaster()}
      <Input
        placeholder='New repository name'
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
      />
      <Button
        colorPalette='teal'
        onClick={handleCreate}
        loading={loading}
        disabled={!repoName.trim() || loading}
      >
        Create Project
      </Button>
      <Toaster />
    </Stack>
  )
}
