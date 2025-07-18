// src/types/openrouter.ts

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    web_search: string;
    internal_reasoning: string;
  };
}

export interface OpenRouterMessage {
  role: "system" | "developer" | "user" | "assistant" | "tool";
  content: string;
}
