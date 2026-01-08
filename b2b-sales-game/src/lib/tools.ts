import { z } from 'zod';

// Tool 1: resolve_turn_outcome
export const resolveTurnToolSchema = z.object({
  narrative: z.string().describe("The storytelling text describing what happened after the card was played."),
  npc_updates: z.array(
    z.object({
      npc_id: z.string(),
      trust_change: z.number().describe("Change in trust score (e.g., +1, -1)"),
      mood_update: z.enum(["Happy", "Neutral", "Angry", "Thinking", "Surprised"]),
      dialogue: z.string().describe("What this specific NPC says in response")
    })
  ),
  game_status_update: z.enum(["active", "won", "lost", "no_decision"]).optional().describe("Update the game status if the game ends."),
  stage_transition: z.object({
    should_advance: z.boolean(),
    next_stage_name: z.string().optional()
  }).describe("Only set this if the players have met the criteria to move to the next sales stage.").optional(),
  opportunity_updates: z.array(z.object({
    id: z.string(),
    status: z.enum(['unrevealed', 'revealed', 'achieved']),
    title: z.string().optional(),
    description: z.string().optional(),
    requirements: z.array(z.object({
      npc_id: z.string(),
      min_trust: z.number()
    })).optional()
  })).optional().describe("Update opportunities status or discover new ones."),
  solution_update: z.object({
    quality_change: z.number().describe("Change in solution quality score"),
    new_feature: z.string().optional().describe("New feature added to solution")
  }).optional().describe("Update solution details."),
  visual_cues: z.array(z.enum(["screen_shake", "confetti", "darken_bg", "spotlight"]))
    .describe("Special effects to trigger on the frontend.")
    .optional()
});

// Tool 2: request_scene_generation
export const requestSceneToolSchema = z.object({
  prompt_description: z.string().describe("Detailed visual description for Stable Diffusion/Midjourney (e.g., 'Cyberpunk boardroom, tense atmosphere, blue lighting')."),
  asset_type: z.enum(["background", "npc_avatar", "item_closeup"])
});

// Tool 3: submit_analysis_report
export const submitReportToolSchema = z.object({
  scores: z.object({
    logic: z.number().describe("Score 0-100 for Logic/Methodology"),
    empathy: z.number().describe("Score 0-100 for Empathy/Trust"),
    closing: z.number().describe("Score 0-100 for Closing/Results")
  }),
  feedback_markdown: z.string().describe("Detailed advice in markdown format"),
  key_nodes: z.array(z.object({
    turn: z.number(),
    action_name: z.string(),
    npc_name: z.string().optional(),
    result: z.enum(['Positive', 'Negative', 'Neutral']),
    description: z.string().describe("Short explanation of why this was a key moment")
  })).describe("List of critical turning points in the game"),
  trust_trends: z.array(z.object({
    turn: z.number(),
    npc_name: z.string(),
    trust_score: z.number()
  })).describe("Trend data for trust scores of each NPC over turns"),
  key_mistake_index: z.number().optional().describe("Index of the turn where the player lost the most trust.")
});
