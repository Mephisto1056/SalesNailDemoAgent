# Game Duration/Difficulty Selection Implementation Plan

## 1. Overview
The user wants to add a "Game Mode" selection to the initial setup screen.
- **Quick Mode (Standard)**: 3 Rounds, standard difficulty (20min).
- **Detailed Mode (Hard/Realistic)**: 3 Rounds, but significantly harder to gain trust, requiring more thoughtful play (60min target, implies more reading/thinking per AP, or more AP per round but lower conversion rate?).

*Correction based on feedback*: Both modes have **3 Rounds**. The difference is in **Difficulty/Complexity**, specifically how "Trust" is gained.

## 2. Specification

### 2.1 Game Modes
| Feature | Quick Mode (Standard) | Detailed Mode (Deep Dive) |
| :--- | :--- | :--- |
| **Total Rounds** | 3 | 3 |
| **Action Points (AP)** | 10 AP / Round | **20 AP / Round** (More actions allowed) |
| **Trust Gain Difficulty**| Standard (Easy) | **Hard** (Requires specific keywords/strategies) |
| **Trust Thresholds** | 2 / 4 / 5 | 2 / 4 / 5 (Same caps) |
| **System Prompt** | Standard AI persona | Strict AI persona (More skeptical, lower trust gains) |

**Logic for "60 min" experience with 3 rounds**:
To extend gameplay to 60 minutes without adding rounds, we need to:
1.  **Increase AP**: Give players more actions (e.g., 20 AP instead of 10) so they do *more* things per round.
2.  **Decrease Effectiveness**: Make each action less effective (lower trust gain) so they *need* those extra actions.
3.  **Strict Evaluation**: The AI should be more critical, requiring players to read the "Org Info" and "Hidden Agendas" carefully.

### 2.2 Difficulty Modifiers
We will introduce a `difficulty_multiplier` in the GameState.
*   **Quick**: Multiplier = 1.0 (Normal trust gains)
*   **Detailed**: Multiplier = 0.5 (Half trust gains, or harder AI evaluation)

## 3. Implementation Steps

### Step 1: Type Updates (`src/types.ts`)
*   Add `GameMode` type: `'quick' | 'detailed'`.
*   Update `GameState`:
    *   `game_mode: GameMode`
    *   `difficulty_multiplier: number` (0.5 to 1.0)

### Step 2: Frontend UI (`src/app/page.tsx`)
*   Add Radio Selection for Mode.
    *   "⚡ Quick Simulation (Standard AP, Normal Difficulty)"
    *   "🧠 Deep Dive (Double AP, Hard Difficulty)"

### Step 3: Initialization Logic (`src/app/api/game/init/route.ts`)
*   Handle `mode` param.
*   If `quick`: `max_action_points` = 10, `difficulty` = 1.0.
*   If `detailed`: `max_action_points` = 20, `difficulty` = 0.5.

### Step 4: Turn Logic Adjustment (`src/app/api/game/turn/route.ts`)
*   **Pass Difficulty to AI**:
    *   In the System Prompt or User Message, explicitly state the difficulty level.
    *   *Prompt Addition*: "DIFFICULTY LEVEL: {mode}. If 'detailed', be extremely skeptical. Reduce trust gains by 50% compared to normal. Only high-quality, specific arguments work."
*   **Code-level Trust Adjustment** (Optional fallback):
    *   We can also mathematically scale the `trust_change` returned by AI if we want to force it. e.g. `final_trust_change = ai_trust_change * difficulty_multiplier`. *Decision: Let's do this to guarantee the effect.*

## 4. File Changes

### `src/types.ts`
```typescript
export type GameMode = 'quick' | 'detailed';

export interface GameState {
  // ...
  game_mode: GameMode;
  difficulty_multiplier: number;
}
```

### `src/app/page.tsx`
*   Add UI for mode selection.

### `src/app/api/game/init/route.ts`
*   Set `max_action_points` and `difficulty_multiplier` based on mode.

### `src/app/api/game/turn/route.ts`
*   Apply `difficulty_multiplier` to `trust_change` in `updateGameState`.
*   Inject difficulty context into AI prompt.
