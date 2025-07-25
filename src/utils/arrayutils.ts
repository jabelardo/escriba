import type { Prompt } from "@/types/settings";

export const addOrUpdatePrompt = (
  prompt: Prompt,
  prompts: Prompt[],
): Prompt[] => {
  const index = prompts.findIndex((f: Prompt) => prompt.id === f.id);
  //Not found, add on end.
  if (-1 === index) {
    return [...prompts, prompt];
  }
  //found, so return:
  //Clone of items before item being update.
  //updated item
  //Clone of items after item being updated.
  return [...prompts.slice(0, index), prompt, ...prompts.slice(index + 1)];
};

export const removePrompt = (promptId: string, prompts: Prompt[]): Prompt[] => {
  const index = prompts.findIndex((f: Prompt) => promptId === f.id);
  //Not found, return same reference.
  if (-1 === index) {
    return prompts;
  }
  //Return clone of items before and clone of items after.
  return [...prompts.slice(0, index), ...prompts.slice(index + 1)];
};
