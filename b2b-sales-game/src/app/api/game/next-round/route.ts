import { GameState } from '@/types';

export async function POST(req: Request) {
  try {
    const { gameState }: { gameState: GameState } = await req.json();

    if (!gameState) {
      return new Response(JSON.stringify({ error: 'Missing gameState' }), { status: 400 });
    }

    const newState = { ...gameState };

    // Increment round
    newState.turn_count += 1;

    // Reset Action Points
    // Use max_action_points from state to support both Quick (10) and Detailed (20) modes
    newState.action_points = newState.max_action_points;

    // Check for Game Over (Max Turns reached)
    if (newState.turn_count > newState.max_turns) {
        // Simple logic for now: if not won, maybe lost or no decision?
        // But usually win/loss is determined by trust/stage.
        // Let's just mark it as finished if not already.
        if (newState.status === 'active') {
             newState.status = 'no_decision'; // Default to no decision if time runs out
        }
    } else {
        // Add a system log for new round
        let roundInfo = `--- Round ${newState.turn_count} Started ---`;
        
        // Reveal Org Description if available
        // Round 1 uses index 0, Round 2 uses index 1, etc.
        const orgDesc = newState.current_project.org_description_stages?.[newState.turn_count - 1];
        if (orgDesc) {
            roundInfo += `\n\n[ORGANIZATION INTEL]: ${orgDesc}`;
        }

        newState.history.push({
            role: 'system',
            content: roundInfo,
            timestamp: Date.now(),
            metadata: { type: 'system' }
        });
    }

    return new Response(JSON.stringify({ newState }), { status: 200 });

  } catch (error) {
    console.error('Next Round Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
