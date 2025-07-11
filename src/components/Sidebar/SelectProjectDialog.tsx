'use client'

import {
  Dialog,
  Button,
  Text,
  Stack,
} from '@chakra-ui/react'
import { useProjectStore } from '@/store/projectStore'
import { useState } from 'react'

export const SelectProjectDialog = () => {
  const [open, setOpen] = useState(false)
  const projects = useProjectStore(s => s.projects)
  const selectProject = useProjectStore(s => s.selectProject)
  const selected = useProjectStore(s => s.selectedProject)

  const sorted = [...projects].sort((a, b) => {
    const nameA = `${a.owner}/${a.repo}`.toLowerCase()
    const nameB = `${b.owner}/${b.repo}`.toLowerCase()
    return nameA.localeCompare(nameB)
  })

  return (
    <>
      <Button size='sm' variant="ghost" onClick={() => setOpen(true)}>
        Select Project
      </Button>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Select a Project</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack spacing={2}>
                {sorted.map((proj) => (
                  <Button
                    key={`${proj.owner}/${proj.repo}`}
                    variant='ghost'
                    justifyContent='flex-start'
                    onClick={() => {
                      selectProject(proj)
                      setOpen(false)
                    }}
                  >
                    {proj.owner}/{proj.repo}
                  </Button>
                ))}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}