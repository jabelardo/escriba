'use client'

import {
  Button,
  Dialog,
  Input,
  Portal,
  Textarea,
  VStack,
  Box,
  Text,
  CloseButton,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { Prompt } from '@/types/settings'
import { PromptCombobox } from './PromptCombobox'


export const PromptManagerDialog = ({ 
    category,
    prompts,
    updatePrompts
}: { 
    category: 'system' | 'continue' | 'revise',
    prompts: Prompt[],
    updatePrompts: (prompt: Prompt) => void
}) => {
  const [newId, setNewId] = useState('')
  const [newValue, setNewValue] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(null as Prompt | null)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size='sm' variant='ghost'>Manage {category} prompts</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Manage {category} Prompts</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' position='absolute' right='2' top='2' />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align='stretch' gap={4}>
                <PromptCombobox
                    label='Name'
                    items={prompts}
                    selectedPrompt={selectedPrompt}
                    onChange={setSelectedPrompt}
                />
                <Text fontWeight='bold'>Content</Text>
                <Textarea
                    placeholder='Prompt content...'
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                />
                <Button
                    onClick={() => {
                        updatePrompts({ id: newId, value: newValue })
                    }}
                    disabled={!newId || !newValue}
                >
                    Save Prompt
                </Button>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}