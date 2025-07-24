import type { OpenRouterMessage } from "@/types/openrouter";

export interface ChatCompletionParams {
  apiKey: string;
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export async function fetchChatCompletion({
  apiKey,
  model,
  messages,
  temperature = 1,
  maxTokens = 512,
  signal,
}: ChatCompletionParams): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
