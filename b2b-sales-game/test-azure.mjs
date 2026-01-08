import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// 1. Load Environment Variables from .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
    console.log("✅ Loaded .env.local");
  } else {
    console.warn("⚠️ .env.local not found. Relying on existing environment variables.");
  }
} catch (error) {
  console.error("Error loading .env.local:", error);
}

// 2. Check Key
const apiKey = process.env.AZURE_ANTHROPIC_API_KEY;
if (!apiKey || apiKey.includes('your_real_key')) {
  console.error("❌ Error: AZURE_ANTHROPIC_API_KEY is missing or invalid in .env.local");
  process.exit(1);
}

// 3. Configure Azure Anthropic (matching src/lib/ai.ts)
const AZURE_ANTHROPIC_BASE_URL = 'https://tui-0002-resource.services.ai.azure.com/anthropic/v1';
const GAME_MODEL_ID = 'claude-opus-4-5';

const azureAnthropic = createAnthropic({
  baseURL: AZURE_ANTHROPIC_BASE_URL,
  apiKey: apiKey,
});

// 4. Run Test
async function testConnection() {
  console.log(`🔄 Testing connection to Azure (${AZURE_ANTHROPIC_BASE_URL})...`);
  console.log(`🤖 Model: ${GAME_MODEL_ID}`);
  
  try {
    const { object } = await generateObject({
      model: azureAnthropic(GAME_MODEL_ID),
      prompt: 'Generate a JSON object with a message "Connection Successful!"',
      schema: z.object({
        message: z.string()
      }),
      mode: 'json',
    });

    console.log("\n🎉 Test Result:");
    console.log(object.message);
  } catch (error) {
    console.error("\n❌ Connection Failed:");
    console.error(error);
  }
}

testConnection();