'use client'

import {
  Button,
  Dialog,
  Portal,
  Textarea,
  VStack,
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
  const [promptId, setPromtId] = useState('')
  const [promtValue, setPromtValue] = useState('')

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
                    selectedPrompt={{ id: promptId, value: promtValue }}
                    onChange={(promt) => {
                        console.log(promt)
                        setPromtId(promt.id)
                        setPromtValue(promt.value)
                    }}
                />
                <Text fontWeight='bold'>Content</Text>
                <Textarea
                    placeholder='Prompt content...'
                    value={promtValue}
                    onChange={e => {
                        setPromtValue(e.target.value)
                    }}
                />
                <Button
                    onClick={() => {
                        console.log(promptId, promtValue)
                        updatePrompts({ id: promptId, value: promtValue })
                    }}
                    disabled={!promptId || !promtValue}
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