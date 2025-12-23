const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  message: ChatMessage;
  done: boolean;
}

const HEALTH_SYSTEM_PROMPT = `You are QR Health Assistant, an AI health advisor created by Quantum Rishi (SV Enterprises). 

Your role is to:
- Help users understand their health records
- Provide general health information and wellness tips
- Answer questions about medical terminology
- Suggest when users should consult healthcare professionals

IMPORTANT GUIDELINES:
- Always recommend consulting a doctor for specific medical advice
- Never diagnose conditions or prescribe treatments
- Be empathetic and supportive
- Protect user privacy - never ask for unnecessary personal information
- If unsure, say so and recommend professional consultation

You have access to the user's uploaded health records context when provided.`;

export async function chatWithOllama(
  messages: ChatMessage[],
  healthContext?: string
): Promise<string> {
  const systemPrompt = healthContext
    ? `${HEALTH_SYSTEM_PROMPT}\n\nUser's Health Record Context:\n${healthContext}`
    : HEALTH_SYSTEM_PROMPT;

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: fullMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Ollama chat error:', error);
    throw new Error('Failed to get response from AI assistant');
  }
}

export async function streamChatWithOllama(
  messages: ChatMessage[],
  healthContext?: string,
  onChunk: (chunk: string) => void = () => {}
): Promise<string> {
  const systemPrompt = healthContext
    ? `${HEALTH_SYSTEM_PROMPT}\n\nUser's Health Record Context:\n${healthContext}`
    : HEALTH_SYSTEM_PROMPT;

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            fullResponse += data.message.content;
            onChunk(data.message.content);
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Ollama stream error:', error);
    throw new Error('Failed to stream response from AI assistant');
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}