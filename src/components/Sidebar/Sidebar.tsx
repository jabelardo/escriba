'use client'

import { 
  Box, 
  Button,
  CloseButton,
  Dialog,
  Heading,
  Portal,
  Separator,
  Tabs,
  Text,
  VStack
} from "@chakra-ui/react";
import { ProjectTree } from './ProjectTree'
import { RemoveProjectButton } from './RemoveProjectButton'
import { AddProjectForm } from './AddProjectForm'
import { CreateProjectForm } from './CreateProjectForm'
import { SelectProjectDialog } from './SelectProjectDialog'
import { Octokit } from '@octokit/rest'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { fetchProjectFileContent } from '@/lib/github/files'
import { SettingsPanel } from "../Settings/SettingsPanel";
import ErrorBoundary from "../ErrorBoundary";

const AddCreateProjectDialog = () => {
  return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button size='sm' variant="ghost">+ Add / Create Project</Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Manage Project</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Tabs.Root defaultValue='add'>
                  <Tabs.List>
                    <Tabs.Trigger value='add'>Add Existing</Tabs.Trigger>
                    <Tabs.Trigger value='create'>Create New</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value='add'>
                    <AddProjectForm />
                  </Tabs.Content>
                  <Tabs.Content value='create'>
                    <CreateProjectForm />
                  </Tabs.Content>
                </Tabs.Root>
              </Dialog.Body>
              <Dialog.Footer>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Footer />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
  )
}

const SettingsDialog = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size='sm' variant="ghost">🛠️ Settings</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="640px">
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <SettingsPanel />
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
} 

export const Sidebar = () => {
  const selectedProject = useProjectStore((s) => s.selectedProject)
    const token = useAuthStore((s) => s.githubToken)
  return (
    <Box w="280px" p={4} bg="gray.100" _dark={{ bg: "gray.800" }} h="100%">
      <VStack align="start" gap={4}>
        <Box w='full'>
          <Heading size='md'>📚 Escriba</Heading>
        </Box>
        <Text mt={4}>★ Project:</Text>
        <AddCreateProjectDialog />
        <SelectProjectDialog />
        <RemoveProjectButton />
        <Separator />
        <Text mt={4}>📝 Files:</Text>
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
        <Button size='sm' variant="ghost" onClick={() => alert('Logout')}>🔒 Logout</Button>
      </VStack>
    </Box>
  )
}
