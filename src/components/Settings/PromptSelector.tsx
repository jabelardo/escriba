'use client'

import {
  Box,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import type { Prompt } from '@/types/settings'

type PromptSelectorProps = {
    label: string
    items: Prompt[]
    selectedPrompt: Prompt | undefined
    onChange: (prompt: Prompt) => void
  }
  
export const PromptSelector = ({
    label,
    items,
    selectedPrompt,
    onChange,
  }: PromptSelectorProps) =>{
    const collection = useMemo(
      () =>
        createListCollection({
          items,
          itemToValue: i => i.id,
          itemToString: i => i.name,
        }),
      [items]
    )
  
    const selected = collection.items.find(i => i.id === selectedPrompt?.id)
  
    return (
      <Box mb={4}>
        <Select.Root
          collection={collection}
          value={[selected?.id || '']}
          onValueChange={v => {
            const prompt = v?.items?.[0]
            if (prompt) onChange(prompt)
          }}
          size='sm'
          width='100%'
        >
          <Select.HiddenSelect />
          <Select.Label>{label}</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder={`Select ${label}`} />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {collection.items.map(item => (
                  <Select.Item item={item} key={item.id}>
                    {item.name}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Box>
    )
  }