'use client'

import { 
  Flex, 
  Heading, 
  Text, 
  Separator, 
  Button, 
  Dialog,
} from "@radix-ui/themes"

import { RemoveProjectButton } from './RemoveProjectButton'
import { SelectProjectDialog } from './SelectProjectDialog'
import { Octokit } from '@octokit/rest'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { fetchProjectFileContent } from '@/lib/github/files'
import { SettingsPanel } from "../Settings/SettingsPanel";
import ErrorBoundary from "../ErrorBoundary";
import AddOrCreateProjectDialog from "./AddOrCreateProjectDialog"
import { ProjectTree } from "./ProjectTree"



const SettingsDialog = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button size='2' variant="ghost">🛠️ Settings</Button>
      </Dialog.Trigger>
          <Dialog.Content maxWidth="640px">
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description />
              <SettingsPanel />
              <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button size="2" >
                Close
              </Button>
            </Dialog.Close>
            </Flex>
          </Dialog.Content>
    </Dialog.Root>
  )
} 


export const Sidebar = () => {
    const selectedProject = useProjectStore((s) => s.selectedProject)
    const token = useAuthStore((s) => s.githubToken)
    
  return (
    <Flex width="280px" p="4" height="100%" align="start" gap="4" direction="column">
        
        <Heading size='6'>📚 Escriba</Heading>
        
        <Text mt="4">★ Project:</Text>
        <AddOrCreateProjectDialog />
        <SelectProjectDialog />
        <RemoveProjectButton />
        <Separator />
        <Text mt="4">📝 Files:</Text>
        <ProjectTree
          onFileSelect={async (filePath) => {
            if (!selectedProject || !token) return
            const octokit = new Octokit({ auth: token })
            const content = await fetchProjectFileContent(
              octokit,
              selectedProject.owner,
              selectedProject.repo,
              filePath
            )
            useProjectStore.getState().setSelectedFile({filePath, content: content.content, sha: content.sha})
          }}
        />
        <Separator />
        <ErrorBoundary>
        <SettingsDialog />
        </ErrorBoundary>
        <Button size='2' variant="ghost" onClick={() => alert('Logout')}>🔒 Logout</Button>
    </Flex>
  )
}