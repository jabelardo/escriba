"use client";

import { Button, Dialog, TextArea, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import type { Prompt } from "@/types/settings";
import { PromptCombobox } from "./PromptCombobox";

export const PromptManagerDialog = ({
  category,
  prompts,
  updatePrompts,
}: {
  category: "system" | "continue" | "revise";
  prompts: Prompt[];
  updatePrompts: (prompt: Prompt) => void;
}) => {
  const [promptId, setPromtId] = useState("");
  const [promtValue, setPromtValue] = useState("");

  return (
    <Dialog.Root flex-grow="1">
      <Dialog.Trigger>
        <Button size="2" variant="surface">
          Manage {category} prompts
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Manage {category} Prompts</Dialog.Title>
        <Dialog.Description />
        <Flex direction="column" gap="3">
          <PromptCombobox
            label="Name"
            items={prompts}
            selectedPrompt={{ id: promptId, value: promtValue }}
            onChange={(promt) => {
              console.log(promt);
              setPromtId(promt.id);
              setPromtValue(promt.value);
            }}
          />
          <Text as="div" size="2" mb="1" weight="bold">
            Content
          </Text>
          <TextArea
            placeholder="Prompt content..."
            value={promtValue}
            onChange={(e) => {
              setPromtValue(e.target.value);
            }}
          />
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              onClick={() => {
                console.log(promptId, promtValue);
                updatePrompts({ id: promptId, value: promtValue });
              }}
              disabled={!promptId || !promtValue}
            >
              Save Prompt
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
