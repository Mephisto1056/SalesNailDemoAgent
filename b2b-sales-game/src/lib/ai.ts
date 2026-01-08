import { createAnthropic } from '@ai-sdk/anthropic';

// Azure Anthropic Configuration
// User provided URL: https://tui-0002-resource.services.ai.azure.com/anthropic/v1/messages
// The SDK usually appends /messages, but Azure endpoints can be tricky.
// Based on standard patterns, we use the base URL.
// Allow overriding via environment variable
const AZURE_ANTHROPIC_BASE_URL = process.env.AZURE_ANTHROPIC_BASE_URL || 'https://tui-0002-resource.services.ai.azure.com/anthropic/v1';

// Check for API Key
if (!process.env.AZURE_ANTHROPIC_API_KEY) {
  console.warn("⚠️ AZURE_ANTHROPIC_API_KEY is not set in environment variables.");
}

export const azureAnthropic = createAnthropic({
  baseURL: AZURE_ANTHROPIC_BASE_URL,
  apiKey: process.env.AZURE_ANTHROPIC_API_KEY || 'dummy-key-for-build', // Prevent build failure if key is missing
});

// Model Name
// Deployment Name provided by user, allow override
export const GAME_MODEL_ID = process.env.GAME_MODEL_ID || 'claude-opus-4-5';
