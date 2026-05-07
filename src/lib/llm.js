/**
 * llm.js — Groq API wrapper for LLAMA 3.3 inference
 *
 * Provides a single `chat()` function that calls the Groq cloud API
 * (OpenAI-compatible endpoint) and returns the assistant's text response.
 *
 * Why Groq? It hosts Meta's open-source LLAMA models with a generous free
 * tier (14 400 requests / day as of 2025) and extremely low latency.
 * Get a free API key at https://console.groq.com
 *
 * Graceful degradation: if VITE_GROQ_API_KEY is absent, `llmEnabled` is
 * false and `chat()` returns null immediately. All AI features are additive
 * — the app is fully usable without them.
 *
 * Security note: VITE_ env vars are bundled into the client. This is
 * acceptable for a personal project, but in production the Groq call
 * should be proxied through a backend endpoint to keep the key private.
 */

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

/** True when a Groq API key is present in the environment. */
export const llmEnabled = !!GROQ_KEY

/**
 * Sends a chat completion request to Groq and returns the response text.
 *
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {object}  [options]
 * @param {number}  [options.maxTokens=120]  Upper bound on response length.
 * @returns {Promise<string|null>}  The assistant's reply, or null on any error.
 *
 * @example
 * const fact = await chat([{
 *   role: 'user',
 *   content: 'One habit-science stat about a 7-day meditation streak. Max 18 words.',
 * }], { maxTokens: 50 })
 */
export async function chat(messages, { maxTokens = 120 } = {}) {
  if (!llmEnabled) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}
