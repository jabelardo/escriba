'use client'

import {
  Select,
  Spinner,
  Text,
} from "@radix-ui/themes"
import { useProjectStore } from '@/store/projectStore'
import { fetchOpenRouterModels } from '@/lib/openrouter/models'
import type { OpenRouterModel } from '@/types/openrouter'
import { useAsync } from 'react-use'

export const LLMModelSelect = () => {
  const selectedModel = useProjectStore(s => s.selectedProject?.model)
  const setSelectedModel = useProjectStore(s => s.setSelectedModel)

  const state = useAsync(() =>
    fetchOpenRouterModels(import.meta.env.VITE_OPENROUTER_KEY)
  , [])

  if (state.loading) {
    return (
      <Select.Root disabled>
        <Select.Trigger>
          <Spinner size="1" />
          <Text size="2" color="gray">Loading models...</Text>
        </Select.Trigger>
      </Select.Root>
    )
  }

  if (state.error) {
    return (
      <Select.Root disabled>
        <Select.Trigger>
          <Text size="2" color="red">Error loading models</Text>
        </Select.Trigger>
      </Select.Root>
    )
  }

  const models: OpenRouterModel[] = state.value || [];

  const sorted = [...models].sort((a, b) => {
    const nameA = `${a.name}`.toLowerCase()
    const nameB = `${b.name}`.toLowerCase()
    return nameA.localeCompare(nameB)
  })
  
  return (
    <Select.Root
      value={selectedModel ?? ''}
      onValueChange={setSelectedModel}
      size='2'
    >
      <Select.Trigger placeholder="Select a model..." />
      <Select.Content>
      {sorted.map((model) => (
          <Select.Item key={model.id} value={model.id}>
            {model.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}