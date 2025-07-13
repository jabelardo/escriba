'use client'

import {
  Input,
  Button,
  Stack,
} from '@chakra-ui/react'
import { Toaster } from '@/components/ui/toaster'
import { errorToaster, successToaster } from '@/components/common'
import { useState } from 'react'
import { Octokit } from '@octokit/rest'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'

export const CreateProjectForm = () => {
  const token = useAuthStore(s => s.githubToken)
  const octokit = new Octokit({ auth: token })
  const addProject = useProjectStore(s => s.addProject)

  const [repoName, setRepoName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)

    const repo = repoName.trim()
    if (!/^[\w.-]+$/.test(repo)) {
      errorToaster('Invalid repository name')
      setLoading(false)
      return
    }

    try {
      // Get user info to determine repo owner
      const { data: user } = await octokit.rest.users.getAuthenticated()
      const owner = user.login

      // Create the repo
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repo,
        private: true,
        auto_init: false,
      })

      // Create .gitkeep in books and references
      for (const folder of ['books', 'references']) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo: repo,
          path: `${folder}/.gitkeep`,
          message: `chore: add ${folder}/ folder`,
          content: '',
          branch: 'main',
        })
      }

      addProject({ owner, repo: repo })
      successToaster(`${owner}/${repo} created and initialized successfully.`, 'Project created')
      setRepoName('')
    } catch (e: any) {
      console.log('Repo creation failed', e)
      errorToaster(e?.response?.data?.message || e.message || 'Unknown error')
    }

    setLoading(false)
  }

  return (
    <Stack gap={4}>
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
