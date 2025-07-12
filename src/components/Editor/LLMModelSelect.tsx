import {
  Select,
  createListCollection,
  Spinner,
  Portal,
} from '@chakra-ui/react'
import { useProjectStore } from '@/store/projectStore'
import { fetchOpenRouterModels } from '@/lib/openrouter'
import type { OpenRouterModel } from '@/types/openrouter'
import { useAsync } from 'react-use'
import { useMemo } from 'react'

export const LLMModelSelect = () => {
  const selectedModel = useProjectStore(s => s.selectedProject?.model)
  const setSelectedModel = useProjectStore(s => s.setSelectedModel)

  const state = useAsync(() =>
    fetchOpenRouterModels(import.meta.env.VITE_OPENROUTER_KEY)
  , [])

  const collection = useMemo(() => {
    return createListCollection<OpenRouterModel>({
      items: state.value ?? [],
      itemToString: m => m.name,
      itemToValue: m => m.id,
    })
  }, [state.value])

  // If not ready or model not found, don't pass `value`
  const shouldRenderSelect = collection.items.length > 0
  
  if (!shouldRenderSelect) {
    return (
      <Select.Root collection={collection} size='sm' width='260px'>
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder='Loading models…' />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Spinner size='xs' borderWidth='1.5px' color='fg.muted' />
          </Select.IndicatorGroup>
        </Select.Control>
      </Select.Root>
    )
  }
  const modelInCollection = collection.items.find(m => m.id === selectedModel)
  return (
    <Select.Root
      collection={collection}
     value={[modelInCollection?.id || '']}
      onValueChange={(v) => {
        const newModel = v?.items[0]
        if (newModel.id !== selectedModel) setSelectedModel(newModel.id)
      }}
      size='sm'
      width='260px'
    >
      <Select.HiddenSelect />
      <Select.Label>Select Model</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder='Select Model' />
        </Select.Trigger>
        <Select.IndicatorGroup>
          {state.loading && (
            <Spinner size='xs' borderWidth='1.5px' color='fg.muted' />
          )}
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((model) => (
              <Select.Item item={model} key={model.id}>
                {model.name}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}