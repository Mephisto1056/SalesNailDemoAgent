import { generateObject } from 'ai';
import { z } from 'zod';
import { azureAnthropic, GAME_MODEL_ID } from '@/lib/ai';
import { SCENARIO_GENERATION_SYSTEM_PROMPT } from '@/lib/prompts';
import { GameState } from '@/types';
import { selectAvatar } from '@/lib/avatars';

// Schema for the AI generated content
const scenarioSchema = z.object({
  project: z.object({
    title: z.string(),
    summary: z.string(),
    org_description_stages: z.array(z.string()).length(3).describe("3 paragraphs of company background, revealing deeper problems/politics in each stage."),
  }),
  npcs: z.array(z.object({
    name: z.string(),
    role_type: z.enum(['Economic_Buyer', 'Technical_Buyer', 'Coach', 'Anti_Champion', 'Staff', 'Gatekeeper']),
    title: z.string(),
    gender: z.enum(['Male', 'Female']),
    personality: z.string(),
    trust_score: z.number().min(0).max(5),
    hidden_agenda: z.string(),
    dialogues: z.array(z.string()).length(6).describe("6 preset lines of dialogue. 0-1 for Round 1 (Guarded), 2-3 for Round 2 (Open), 4-5 for Round 3 (Candid)."),
    avatar_prompt: z.string().describe("Visual description for the character"),
    is_key_decision_maker: z.boolean().describe("True if this NPC is one of the 3 Key Decision Makers required to win"),
  })).length(9),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, product, target, language, gameMode = 'quick' } = body;

    if (!industry || !product || !target) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Default to Chinese if not specified, or respect input
    const lang = language || 'cn'; 
    
    // Set parameters based on Game Mode
    const isDetailed = gameMode === 'detailed';
    const maxActionPoints = isDetailed ? 20 : 10;
    const difficultyMultiplier = isDetailed ? 0.5 : 1.0;

    const { object: scenarioData } = await generateObject({
      model: azureAnthropic(GAME_MODEL_ID),
      system: SCENARIO_GENERATION_SYSTEM_PROMPT,
      schema: scenarioSchema,
      mode: 'json',
      prompt: `
        Player Company Industry: ${industry}
        Player Product: ${product}
        Target Customer: ${target}
        
        Generate a challenging sales scenario.
        IMPORTANT: Output all content in ${lang === 'cn' ? 'Simplified Chinese (简体中文)' : 'English'}.
        
        Note: trust_score is on a 0-5 scale. Initial trust should be low (0-2).
        
        Requirements:
        1. Generate 3 stages of 'org_description_stages'. Stage 1: Public info. Stage 2: Internal challenges. Stage 3: Deep crisis/politics.
        2. Generate 6 'dialogues' for EACH NPC. 
           - Lines 0-1: Basic info/polite refusal. (For Round 1)
           - Lines 2-3: Specific pain points/complaints. (For Round 2)
           - Lines 4-5: Secrets/Hidden Agenda hints. (For Round 3)
      `,
    });

    // Construct full initial GameState
    const initialState: GameState = {
      language: lang,
      game_mode: gameMode,
      difficulty_multiplier: difficultyMultiplier,
      company_profile: `Industry: ${industry}. Product: ${product}`,
      current_project: {
        id: 'gen_' + Date.now(),
        title: scenarioData.project.title,
        summary: scenarioData.project.summary,
        org_description_stages: scenarioData.project.org_description_stages,
      },
      current_stage: 'Discovery',
      turn_count: 1,
      max_turns: 3,
      action_points: maxActionPoints,
      max_action_points: maxActionPoints,
      status: 'active',
      npcs: scenarioData.npcs.map((npc, idx) => ({
        id: `npc_${idx + 1}`,
        ...npc,
        avatar: selectAvatar(npc.role_type, npc.gender),
        // Status mapping: 0-1 Hostile, 2-3 Neutral, 4-5 Friendly
        status: npc.trust_score >= 4 ? 'Friendly' : npc.trust_score <= 1 ? 'Hostile' : 'Neutral',
        is_key_decision_maker: npc.is_key_decision_maker
      })),
      history: [],
      opportunities: [],
      solution: {
        features: [],
        quality_score: 10, // Starts low
        history: []
      }
    };

    return new Response(JSON.stringify(initialState), { status: 200 });

  } catch (error) {
    console.error('Scenario Generation Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate scenario' }), { status: 500 });
  }
}
