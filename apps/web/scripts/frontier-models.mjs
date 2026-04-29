/**
 * Frontier model allowlist, used by fetch-frontier-cost.mjs.
 * Update quarterly (or when a new generation drops).
 *
 * The fetcher hits OpenRouter's public /api/v1/models endpoint, filters
 * by these prefixes, and picks the cheapest blended (prompt+completion)/2
 * cost as today's "frontier price floor."
 */

export const FRONTIER_MODEL_PREFIXES = [
  'anthropic/claude-opus-',
  'anthropic/claude-sonnet-4',
  'openai/gpt-5',
  'openai/o4',
  'google/gemini-2.5-pro',
  'google/gemini-3',
  'xai/grok-4',
  'meta-llama/llama-4-',
  'deepseek/deepseek-v3',
];
