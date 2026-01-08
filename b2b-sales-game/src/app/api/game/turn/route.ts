import { generateObject } from 'ai';
import { azureAnthropic, GAME_MODEL_ID } from '@/lib/ai';
import { GAME_MASTER_SYSTEM_PROMPT } from '@/lib/prompts';
import { resolveTurnToolSchema } from '@/lib/tools';
import { GameState, TurnAction, NPC, Stage, Opportunity } from '@/types';

function getSystemDirectives(gameState: GameState): string {
  const directives: string[] = [];
  
  // Find the main opportunity (assuming the first one or we track it)
  // For now, we assume there is at least one potential opportunity to be revealed.
  
  gameState.npcs.forEach(npc => {
    if (npc.is_key_decision_maker) {
        // Check if linked opportunity exists
        // We assume an opportunity is linked if its requirements include this NPC
        const linkedOpp = gameState.opportunities.find(o => 
            o.requirements?.some(r => r.npc_id === npc.id)
        );

        // TRIGGER 1: Reveal Opportunity (Stage 1 -> Stage 2)
        // Condition: Trust > 2
        if (npc.trust_score > 2) {
            if (!linkedOpp) {
                directives.push(`CRITICAL RULE [Stage 1->2]: NPC '${npc.name}' (${npc.role_type}) has reached Trust ${npc.trust_score}. You MUST use 'opportunity_updates' to CREATE a new 'revealed' Opportunity based on their hidden agenda. This triggers the transition to Stage 2 (Validation).`);
            } else if (linkedOpp.status === 'unrevealed') {
                 directives.push(`CRITICAL RULE [Stage 1->2]: NPC '${npc.name}' has reached Trust ${npc.trust_score}. You MUST set existing opportunity '${linkedOpp.title}' to status 'revealed'.`);
            }
        }
        
        // TRIGGER 2: Achieve Opportunity (Stage 2 -> Stage 3)
        // Condition: Trust >= 4 AND Opportunity is Revealed
        if (npc.trust_score >= 4 && linkedOpp && linkedOpp.status === 'revealed') {
             directives.push(`GAME RULE [Stage 2->3]: NPC '${npc.name}' has Trust ${npc.trust_score} >= 4. If the current action is relevant (e.g. Demonstration), you SHOULD mark opportunity '${linkedOpp.title}' as 'achieved'. This triggers the transition to Stage 3 (Closing/Won).`);
        }
    }
  });
  
  if (directives.length > 0) {
      return "\n--- SYSTEM RULES (HIGHEST PRIORITY) ---\n" + directives.join("\n") + "\n---------------------------------------\n";
  }
  return "";
}

// Helper function to update game state based on tool output
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateGameState(currentState: GameState, updates: any, actionCost: number, playerAction?: TurnAction, cardName?: string): GameState {
  const newState = { ...currentState };

  // 1. Deduct Action Points
  newState.action_points = Math.max(0, newState.action_points - actionCost);

  // Identify primary NPC involved (if any)
  let primaryNpcId = playerAction?.target_npc_id;
  // If not targeted, try to infer from updates (e.g. who spoke)
  if (!primaryNpcId && updates.npc_updates && updates.npc_updates.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const speaker = updates.npc_updates.find((u: any) => u.dialogue);
      if (speaker) primaryNpcId = speaker.npc_id;
  }

  // 2. Update NPCs
  if (updates.npc_updates) {
    newState.npcs = newState.npcs.map((npc: NPC) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update = updates.npc_updates.find((u: any) => u.npc_id === npc.id);
      if (update) {
        // Define Trust Caps based on Round (turn_count)
        // Round 1: Cap 2
        // Round 2: Cap 4
        // Round 3+: Cap 5
        let trustCap = 5;
        if (newState.turn_count === 1) trustCap = 2;
        else if (newState.turn_count === 2) trustCap = 4;

        // Clamp trust score between 0 and cap
        // Apply difficulty multiplier if trust is increasing
        const change = update.trust_change;
        const multiplier = currentState.difficulty_multiplier || 1.0;
        const actualChange = change > 0 ? change * multiplier : change;

        const newTrust = Math.min(trustCap, Math.max(0, npc.trust_score + actualChange));
        
        // Update status based on trust (0-5 scale)
        let newStatus = npc.status;
        if (newTrust >= 4) newStatus = 'Friendly';
        else if (newTrust <= 1) newStatus = 'Hostile';
        else newStatus = 'Neutral';

        return {
          ...npc,
          trust_score: newTrust,
          status: newStatus
        };
      }
      return npc;
    });
  }

  // 3. Update Opportunities & Sync Game Stage
  let anyOppRevealed = false;
  let anyOppAchieved = false;

  if (updates.opportunity_updates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates.opportunity_updates.forEach((oppUpdate: any) => {
      const existingOppIndex = newState.opportunities.findIndex(o => o.id === oppUpdate.id);
      
      if (existingOppIndex >= 0) {
        // Update existing
        const updatedOpp = {
          ...newState.opportunities[existingOppIndex],
          status: oppUpdate.status,
          ...(oppUpdate.title && { title: oppUpdate.title }),
          ...(oppUpdate.description && { description: oppUpdate.description }),
          ...(oppUpdate.requirements && { requirements: oppUpdate.requirements }),
          ...(oppUpdate.status === 'revealed' && !newState.opportunities[existingOppIndex].discovered_at && { discovered_at: newState.turn_count })
        };
        newState.opportunities[existingOppIndex] = updatedOpp;
        
        if (updatedOpp.status === 'revealed') anyOppRevealed = true;
        if (updatedOpp.status === 'achieved') anyOppAchieved = true;

      } else {
        // Add new Opportunity
        const newOpp = {
            id: oppUpdate.id,
            title: oppUpdate.title || 'New Opportunity',
            description: oppUpdate.description || '',
            status: oppUpdate.status,
            requirements: oppUpdate.requirements || [],
            discovered_at: newState.turn_count
        };
        newState.opportunities.push(newOpp);
        
        if (newOpp.status === 'revealed') anyOppRevealed = true;
        if (newOpp.status === 'achieved') anyOppAchieved = true;
      }
    });
  }

  // Check existing opportunities if no updates
  if (!anyOppRevealed && newState.opportunities.some(o => o.status === 'revealed')) anyOppRevealed = true;
  if (!anyOppAchieved && newState.opportunities.some(o => o.status === 'achieved')) anyOppAchieved = true;

  // 4. Update Solution
  if (updates.solution_update && newState.solution) {
    newState.solution = {
      ...newState.solution,
      quality_score: Math.min(100, Math.max(0, newState.solution.quality_score + updates.solution_update.quality_change)),
      history: [
        ...newState.solution.history,
        {
          turn: newState.turn_count,
          action: updates.solution_update.new_feature || 'Solution Improved'
        }
      ]
    };
    if (updates.solution_update.new_feature) {
        newState.solution.features.push(updates.solution_update.new_feature);
    }
  }

  // 5. Update Game Status & Stage based on Opportunity Logic (Stage 1/2/3)
  if (anyOppAchieved) {
      newState.current_stage = 'Closing'; // Stage 3
      // Optionally set status to 'won' if this was the main goal
      // For now, let AI decide 'game_status_update' or we infer it
      // Let's rely on AI for explicit 'won', but advance stage.
  } else if (anyOppRevealed) {
      newState.current_stage = 'Validation'; // Stage 2
  } else {
      newState.current_stage = 'Discovery'; // Stage 1
  }

  if (updates.game_status_update) {
    newState.status = updates.game_status_update;
  }

  // Explicit stage transition override from AI (if needed)
  if (updates.stage_transition && updates.stage_transition.should_advance) {
    if (updates.stage_transition.next_stage_name) {
       newState.current_stage = updates.stage_transition.next_stage_name as Stage;
    }
  }

  // 6. Update History
  if (updates.npc_updates) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updates.npc_updates.forEach((u: any) => {
          if (u.dialogue) {
              newState.history.push({
                  role: 'assistant',
                  content: u.dialogue,
                  timestamp: Date.now(),
                  metadata: {
                      npc_id: u.npc_id,
                      action_card_id: playerAction?.card_id,
                      action_card_name: cardName,
                      type: 'dialogue'
                  }
              });
          }
      });
  }

  if (updates.narrative) {
    newState.history.push({
      role: 'system',
      content: updates.narrative,
      timestamp: Date.now(),
      metadata: {
        type: 'narrative',
        visual_cues: updates.visual_cues,
        turn_summary: updates
      }
    });
  }
  
  return newState;
}

export async function POST(req: Request) {
  try {
    // Allow cost and cardName to be passed
    const { gameState, playerAction, cardCost, cardName }: { gameState: GameState; playerAction: TurnAction; cardCost?: number; cardName?: string } = await req.json();

    if (!gameState || !playerAction) {
      return new Response(JSON.stringify({ error: 'Missing gameState or playerAction' }), { status: 400 });
    }
    
    // Default cost if not provided
    const cost = cardCost !== undefined ? cardCost : 1;

    // Calculate System Directives based on Game Rules (e.g. Opportunity Triggers)
    const systemDirectives = getSystemDirectives(gameState);

    // Prepare difficulty instruction
    const isDetailed = gameState.game_mode === 'detailed';
    const difficultyInstruction = isDetailed 
        ? "DIFFICULTY: HARD/REALISTIC. The user is playing 'Deep Dive' mode. You MUST be extremely skeptical. Reduce all positive trust gains by 50% compared to normal. NPCs should only increase trust if the argument is very specific and highly relevant to their hidden agenda. If the player makes a generic pitch, give 0 or negative trust."
        : "DIFFICULTY: STANDARD. Evaluate actions normally based on the '5333' model.";

    // Prepare preset dialogues if NPC is targeted
    let presetDialogueContext = "";
    if (playerAction.target_npc_id) {
        const targetNPC = gameState.npcs.find(n => n.id === playerAction.target_npc_id);
        if (targetNPC && targetNPC.dialogues) {
            // Determine available dialogues based on Round (turn_count)
            const maxIndex = Math.min(6, gameState.turn_count * 2);
            const availableDialogues = targetNPC.dialogues.slice(0, maxIndex);
            
            presetDialogueContext = `
            AVAILABLE PRESET DIALOGUES for ${targetNPC.name}:
            ${JSON.stringify(availableDialogues)}
            
            INSTRUCTION: You SHOULD try to incorporate one of these lines (or a variation of them) into the NPC's response if it fits the context. 
            Prioritize lines that haven't been used yet.
            `;
        }
    }

    // Use generateObject with JSON mode to avoid "Tool input_schema.type" error on Azure Anthropic
    const { object: updates } = await generateObject({
      model: azureAnthropic(GAME_MODEL_ID),
      system: GAME_MASTER_SYSTEM_PROMPT,
      schema: resolveTurnToolSchema,
      mode: 'json',
      messages: [
        {
          role: 'user',
          content: `
            Current Game Context: ${JSON.stringify(gameState)}
            
            Player Action: ${JSON.stringify(playerAction)}

            ${systemDirectives}

            ${difficultyInstruction}

            ${presetDialogueContext}

            IMPORTANT: All narrative and dialogue output MUST be in ${gameState.language === 'cn' ? 'Simplified Chinese (简体中文)' : 'English'}.
            
            Analyze the action using the '5333' model and resolve the turn.
            Return a valid JSON object matching the schema.
          `
        }
      ]
    });

    const newState = updateGameState(gameState, updates, cost, playerAction, cardName);

    return new Response(JSON.stringify({
      type: 'TURN_RESOLVED',
      payload: updates,
      newState: newState
    }), { status: 200 });

  } catch (error) {
    console.error('Game Turn Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
