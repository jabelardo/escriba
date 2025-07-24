"use client";

import { Select, Spinner, Text } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";
import { fetchOpenRouterModels } from "@/lib/openrouter/models";
import type { OpenRouterModel } from "@/types/openrouter";
import { useSettingsStore } from "@/store/settingsStore";
import { useAsync } from "react-use";

export const LLMModelSelect = () => {
  const selectedModel = useProjectStore((s) => s.selectedProject?.model);
  const setSelectedModel = useProjectStore((s) => s.setSelectedModel);
  const favoriteModels = useSettingsStore((s) => s.favoriteModels);

  const state = useAsync(
    () => fetchOpenRouterModels(import.meta.env.VITE_OPENROUTER_KEY as string),
    [],
  );

  if (state.loading) {
    return (
      <Select.Root value={""} disabled>
        <Select.Trigger>
          <Spinner size="1" />
          <Text size="2" color="gray">
            Loading models...
          </Text>
        </Select.Trigger>
      </Select.Root>
    );
  }

  if (state.error) {
    return (
      <Select.Root value={""} disabled>
        <Select.Trigger>
          <Text size="2" color="red">
            Error loading models
          </Text>
        </Select.Trigger>
      </Select.Root>
    );
  }

  const models: OpenRouterModel[] = state.value || [];

  const favoriteOpenRouterModels: OpenRouterModel[] = [];
  const otherOpenRouterModels: OpenRouterModel[] = [];

  models.forEach((model) => {
    if (favoriteModels.includes(model.id)) {
      favoriteOpenRouterModels.push(model);
    } else {
      otherOpenRouterModels.push(model);
    }
  });

  favoriteOpenRouterModels.sort((a, b) => a.name.localeCompare(b.name));
  otherOpenRouterModels.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Select.Root
      value={selectedModel ?? ""}
      onValueChange={setSelectedModel}
      size="2"
    >
      <Select.Trigger placeholder="Select a model..." />
      <Select.Content>
        {favoriteOpenRouterModels.length > 0 && (
          <Select.Group>
            <Select.Label>Favorites</Select.Label>
            {favoriteOpenRouterModels.map((model) => (
              <Select.Item key={model.id} value={model.id}>
                {model.name}
              </Select.Item>
            ))}
          </Select.Group>
        )}
        {otherOpenRouterModels.length > 0 && (
          <Select.Group>
            <Select.Label>Other Models</Select.Label>
            {otherOpenRouterModels.map((model) => (
              <Select.Item key={model.id} value={model.id}>
                {model.name}
              </Select.Item>
            ))}
          </Select.Group>
        )}
      </Select.Content>
    </Select.Root>
  );
};
