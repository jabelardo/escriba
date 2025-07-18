import type { OpenRouterModel } from "@/types/openrouter";

export async function fetchOpenRouterModels(
  apiKey: string,
): Promise<OpenRouterModel[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status}`);
  }

  const json = await res.json();

  return (json.data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    context_length:
      item.context_length ?? item.top_provider?.context_length ?? 0,
    pricing: {
      prompt: item.pricing?.prompt ?? "0",
      completion: item.pricing?.completion ?? "0",
      image: item.pricing?.image ?? "0",
      request: item.pricing?.request ?? "0",
      web_search: item.pricing?.web_search ?? "0",
      internal_reasoning: item.pricing?.internal_reasoning ?? "0",
    },
  }));
}
