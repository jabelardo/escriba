'use client'

import {
  Select,
  createListCollection,
  Spinner,
  Portal,
} from '@chakra-ui/react'
import { useSettingsStore } from '@/store/settingsStore'
import { fetchOpenRouterModels } from '@/lib/openrouter/models'
import type { OpenRouterModel } from '@/types/openrouter'
import { useAsync } from 'react-use'
import { useMemo } from 'react'

export const FavoritesModelSelect = () => {
  const favoriteModels = useSettingsStore((s) => s.favoriteModels)
  const setFavoriteModels = useSettingsStore((s) => s.setFavoriteModels)

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
      <Select.Root collection={collection} size='sm' width='100%'>
        <Select.HiddenSelect />
        <Select.Label>Favorite Models</Select.Label>
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
  

  return (
    <Select.Root
      collection={collection}
      key={collection.items.length}
      value={favoriteModels}
      onValueChange={(v) => setFavoriteModels(v.items.map((i: any) => i.id))}
      multiple
      size="sm"
      width="100%"
    >
      <Select.HiddenSelect />
      <Select.Label>Favorite Models</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={`${favoriteModels.length || 0} selected`} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
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
    </Select.Root>
  )
}
