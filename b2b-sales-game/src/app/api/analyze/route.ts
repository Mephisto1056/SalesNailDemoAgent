import { generateObject } from 'ai';
import { azureAnthropic, GAME_MODEL_ID } from '@/lib/ai';
import { ANALYST_SYSTEM_PROMPT } from '@/lib/analyst-prompts';
import { submitReportToolSchema } from '@/lib/tools';
import { ChatLog } from '@/types';

export async function POST(req: Request) {
  try {
    const { history }: { history: ChatLog[] } = await req.json();

    if (!history || history.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing game history' }), { status: 400 });
    }

    // Use generateObject with JSON mode
    const { object: report } = await generateObject({
      model: azureAnthropic(GAME_MODEL_ID),
      system: ANALYST_SYSTEM_PROMPT,
      schema: submitReportToolSchema,
      mode: 'json',
      messages: [
        {
          role: 'user',
          content: `
            Analyze this sales game session log:
            ${JSON.stringify(history)}
            
            Return a valid JSON report matching the schema.
          `
        }
      ]
    });

    return new Response(JSON.stringify(report), { status: 200 });

  } catch (error) {
    console.error('Analysis Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}