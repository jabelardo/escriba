"use client";

import { Select } from "@radix-ui/themes";
import { useMemo } from "react";
import type { Prompt } from "@/types/settings";

interface PromptSelectorProps {
  label: string;
  items: Prompt[];
  selectedPrompt: string | undefined;
  onChange: (prompt: Prompt) => void;
}

export const PromptSelector = ({
  label,
  items,
  selectedPrompt,
  onChange,
}: PromptSelectorProps) => {
  const collection = useMemo(() => items, [items]);

  const selected = collection.find((i) => i.id === selectedPrompt);

  const sorted = [...collection].sort((a, b) => {
    const nameA = a.id.toLowerCase();
    const nameB = b.id.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <Select.Root
      value={selected?.id || ""}
      onValueChange={(v) => {
        const prompt = v ? sorted.find((i) => i.id === v) : undefined;
        if (prompt) {
          onChange(prompt);
        }
      }}
      size="2"
      flex-grow="1"
    >
      <Select.Trigger placeholder={`Select ${label}`} />
      <Select.Content>
        {sorted.map((item) => (
          <Select.Item value={item.id} key={item.id}>
            {item.id}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
