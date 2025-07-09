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
import { ProjectInfo } from './ProjectInfo'
import { ProjectTree } from './ProjectTree'
import { RemoveProjectButton } from './RemoveProjectButton'
import { AddProjectForm } from './AddProjectForm'
import { CreateProjectForm } from './CreateProjectForm'
import { ColorModeButton } from "@/components/ui/color-mode"

export const SidebarActions = () => {
  return (
    <VStack align='start' gap={2}>
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

      <Button size='sm' variant="ghost" onClick={() => alert('Project Browser')}>📁 Project Browser</Button>
      <Button size='sm' variant="ghost" onClick={() => alert('Open Settings')}>🛠️ Settings</Button>
      <Button size='sm' variant="ghost" onClick={() => alert('Logout')}>🔒 Logout</Button>
    </VStack>
  )
}

export const Sidebar = () => {
  return (
    <Box w="280px" p={4} bg="gray.100" _dark={{ bg: "gray.800" }} h="100%">
      <VStack align="start" gap={4}>
        <Box w='full'>
          <Heading size='md'>📚 Escriba</Heading>
        </Box>
        <SidebarActions />
        <Separator />
        <ProjectInfo />
        <Separator />
        <Text mt={4}>📝 files:</Text>
        <ProjectTree />
        <RemoveProjectButton />
        <Separator />
        <ColorModeButton />
      </VStack>
    </Box>
  )
}
