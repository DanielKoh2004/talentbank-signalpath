import { ZodSchema } from "zod";

// =============================================================================
// Provider-agnostic AI adapter
// Prompts call this adapter, never the provider directly.
// Swap providers by changing env vars — no code changes needed.
// =============================================================================

export interface AIAdapter {
  /**
   * Generate a structured JSON response conforming to a Zod schema.
   * The adapter handles prompt formatting, parsing, and validation.
   */
  generateJson<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;

  /**
   * Generate a plain text response.
   */
  generateText(prompt: string): Promise<string>;
}

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getConfig(overrides?: Partial<AIConfig>): AIConfig {
  return {
    apiKey: overrides?.apiKey ?? process.env.AI_API_KEY ?? "",
    baseUrl: overrides?.baseUrl ?? process.env.AI_BASE_URL ?? "",
    model: overrides?.model ?? process.env.AI_MODEL ?? "",
  };
}

/**
 * OpenAI-compatible chat completion request.
 * Works with any provider that implements the OpenAI API format.
 */
async function chatCompletion(
  config: AIConfig,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "unknown error");
    throw new Error(
      `AI API error ${response.status}: ${errorBody}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function createOpenAICompatibleAdapter(overrides?: Partial<AIConfig>): AIAdapter {
  const config = getConfig(overrides);

  return {
    async generateJson<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
      const systemPrompt = [
        "You are a structured data extraction assistant.",
        "You MUST respond with valid JSON only. No markdown, no explanation, no code fences.",
        "Parse the user's request and return the structured data.",
      ].join("\n");

      const response = await chatCompletion(config, [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ]);

      // Strip any markdown code fences the model might add despite instructions
      const cleaned = response
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    },

    async generateText(prompt: string): Promise<string> {
      const response = await chatCompletion(config, [
        { role: "user", content: prompt },
      ]);

      return response.trim();
    },
  };
}

// =============================================================================
// Factory — reads env to create the adapter
// =============================================================================

let _adapter: AIAdapter | null = null;

/**
 * Get the AI adapter singleton.
 * Uses environment variables by default. Pass overrides for testing.
 */
export function createAIAdapter(overrides?: Partial<AIConfig>): AIAdapter {
  if (overrides) {
    return createOpenAICompatibleAdapter(overrides);
  }

  if (!_adapter) {
    _adapter = createOpenAICompatibleAdapter();
  }

  return _adapter;
}

/**
 * Convenience: get the default adapter.
 */
export function getAI(): AIAdapter {
  return createAIAdapter();
}
