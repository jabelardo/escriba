'use client'

import {
  Field,
  Flex,
  Heading,
  Input,
} from '@chakra-ui/react'
import { useSettingsStore } from '@/store/settingsStore'
import type { Prompt } from '@/types/settings'
import { PromptSelector } from './PromptSelector'
import { FavoritesModelSelect } from './FavoritesModelSelect'


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
  } = useSettingsStore()

  return (
    <Flex direction='column' gap={6} p={6} maxW='600px'>

      <FavoritesModelSelect />
      
      <Heading size='md'>Prompts</Heading>

      <PromptSelector
        label='System Prompt'
        items={systemPrompts}
        selectedPrompt={activeSystemPrompt}
        onChange={setActiveSystemPrompt}
      />

      <PromptSelector
        label='Continue Prompt'
        items={continuePrompts}
        selectedPrompt={activeContinuePrompt}
        onChange={setActiveContinuePrompt}
      />

      <PromptSelector
        label='Revise Prompt'
        items={revisePrompts}
        selectedPrompt={activeRevisePrompt}
        onChange={setActiveRevisePrompt}
      />

      <Heading size='md' mt={8}>
        API Keys
      </Heading>

      <Field.Root>
        <Field.Label>OpenRouter API Key</Field.Label>
        <Input
          type='text'
          value={openrouterKey}
          onChange={e => setOpenrouterKey(e.target.value)}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>GitHub Token</Field.Label>
        <Input
          type='text'
          value={githubToken}
          onChange={e => setGithubToken(e.target.value)}
        />
      </Field.Root>
    </Flex>
  )
}
