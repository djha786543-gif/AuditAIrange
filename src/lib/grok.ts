export async function callGrok(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const apiKey = localStorage.getItem('auditai-grok-key');
  if (!apiKey) throw new Error('GROK_KEY_MISSING');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-4-latest',
        messages,
        stream: false,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Grok API Error: ${response.status} ${response.statusText} - ${body}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch (error) {
    if (error instanceof Error && error.message === 'GROK_KEY_MISSING') throw error;
    throw new Error(`Failed to call Grok: ${error instanceof Error ? error.message : String(error)}`);
  }
}
