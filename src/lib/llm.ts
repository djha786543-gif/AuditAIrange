export type LlmProvider = 'grok' | 'groq';

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model?: string;
}

export const PROVIDER_DEFAULTS: Record<LlmProvider, { endpoint: string; defaultModel: string; label: string; keyPrefix: string; consoleUrl: string }> = {
  grok: {
    endpoint: 'https://api.x.ai/v1/chat/completions',
    defaultModel: 'grok-4-latest',
    label: 'xAI Grok',
    keyPrefix: 'xai-',
    consoleUrl: 'https://console.x.ai/',
  },
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    label: 'Groq',
    keyPrefix: 'gsk_',
    consoleUrl: 'https://console.groq.com/keys',
  },
};

export const GROQ_MODELS: Array<{ id: string; label: string; hint: string }> = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile', hint: 'Best general quality' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant', hint: 'Fastest, lower quality' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', hint: 'Long-context MoE' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B', hint: 'Google instruct-tuned' },
];

export const GROK_MODELS: Array<{ id: string; label: string; hint: string }> = [
  { id: 'grok-4-latest', label: 'Grok 4 (latest)', hint: 'Default' },
  { id: 'grok-3', label: 'Grok 3', hint: 'Stable' },
];

export async function callLlm(
  config: LlmConfig,
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const { provider, apiKey } = config;
  if (!apiKey) throw new Error('LLM_KEY_MISSING');

  const defaults = PROVIDER_DEFAULTS[provider];
  const model = config.model || defaults.defaultModel;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(defaults.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${defaults.label} API error: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    if (error instanceof Error && error.message === 'LLM_KEY_MISSING') throw error;
    throw new Error(`Failed to call ${defaults.label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
