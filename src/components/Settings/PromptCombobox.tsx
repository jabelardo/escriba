'use client'

import {
  Box,
  Combobox,
  createListCollection,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import type { Prompt } from '@/types/settings'

type PromptComboboxProps = {
    label: string
    items: Prompt[]
    selectedPrompt: Prompt | undefined | null
    onChange: (prompt: Prompt) => void
  }
  
export const PromptCombobox = ({
    label,
    items,
    selectedPrompt,
    onChange,
  }: PromptComboboxProps) =>{
    const collection = useMemo(
      () =>
        createListCollection({
          items,
          itemToValue: i => i.id,
          itemToString: i => i.id,
        }),
      [items]
    )
  
    const selected = collection.items.find(i => i.id === selectedPrompt?.id)
  
    return (
      <Box mb={4}>
        <Combobox.Root
          collection={collection}
          value={[selected?.id || '']}
          onValueChange={v => {
            const prompt = v?.items?.[0]
            if (prompt) onChange(prompt)
          }}
          size='sm'
          width='100%'
          openOnClick
        >
          <Combobox.Label>{label}</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input placeholder="Select or type a prompt name..." />
            <Combobox.IndicatorGroup>
              <Combobox.ClearTrigger />
              <Combobox.Trigger />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.Empty>New prompt</Combobox.Empty>
              {collection.items.map(item => (
                <Combobox.Item item={item} key={item.id}>
                  {item.id}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Root>
      </Box>
    )
  }