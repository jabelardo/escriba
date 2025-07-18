"use client";

import { Text, Flex, TextField } from "@radix-ui/themes";
import { useSettingsStore } from "@/store/settingsStore";
import { PromptSelector } from "./PromptSelector";
import { PromptManagerDialog } from "./PromptManagerDialog";
import { FavoritesModelSelect } from "./FavoritesModelSelect";

export const SettingsPanel = () => {
  const {
    systemPrompts,
    continuePrompts,
    revisePrompts,
    activeSystemPrompt,
    activeContinuePrompt,
    activeRevisePrompt,
    openrouterKey,
    githubToken,
    setActiveSystemPrompt,
    setActiveContinuePrompt,
    setActiveRevisePrompt,
    setOpenrouterKey,
    setGithubToken,
    updateContinuePrompts,
    updateSystemPrompts,
    updateRevisePrompts,
  } = useSettingsStore();

  return (
    <Flex direction="column" gap={"3"} p={"1em 0"} maxWidth="600px">
      <FavoritesModelSelect />

      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          Current System Promp
        </Text>
        <Flex direction="row" gap="3" align={"center"} width={"100%"}>
          <PromptSelector
            label="System Prompt"
            items={systemPrompts}
            selectedPrompt={activeSystemPrompt}
            onChange={setActiveSystemPrompt}
          />
          <PromptManagerDialog
            category="system"
            prompts={systemPrompts}
            updatePrompts={updateSystemPrompts}
          />
        </Flex>
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          Current Continue Promp
        </Text>
        <Flex direction="row" gap="3" align={"center"} width={"100%"}>
          <PromptSelector
            label="Continue Prompt"
            items={continuePrompts}
            selectedPrompt={activeContinuePrompt}
            onChange={setActiveContinuePrompt}
          />
          <PromptManagerDialog
            category="continue"
            prompts={continuePrompts}
            updatePrompts={updateContinuePrompts}
          />
        </Flex>
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          Current Revise Promp
        </Text>
        <Flex direction="row" gap="3" align={"center"} width={"100%"}>
          <PromptSelector
            label="Revise Prompt"
            items={revisePrompts}
            selectedPrompt={activeRevisePrompt}
            onChange={setActiveRevisePrompt}
          />
          <PromptManagerDialog
            category="revise"
            prompts={revisePrompts}
            updatePrompts={updateRevisePrompts}
          />
        </Flex>
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          OpenRouter API Key
        </Text>
        <TextField.Root
          type="password"
          value={openrouterKey}
          onChange={(e) => setOpenrouterKey(e.target.value)}
        />
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          GitHub Token
        </Text>
        <TextField.Root
          type="password"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
        />
      </label>
    </Flex>
  );
};
