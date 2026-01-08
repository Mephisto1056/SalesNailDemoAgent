# Project Name: B2B Sales Simulator (Claude-Powered AVG)

## 1. 项目概述 (Project Overview)
本项目是一个基于 **Claude 4.5 (或高性能 LLM)** 的 B2B 销售模拟 AVG 游戏。
*   **核心玩法**：基于“5333模型”生成的文字冒险 + 卡牌策略。
*   **双 Agent 架构**：
    *   **Agent A (Game Master)**：负责生成剧情、扮演 NPC、判定卡牌效果、维护游戏数值。
    *   **Agent B (Observer)**：负责实时监控日志，游戏结束后生成多维度的销售能力评估报告。
*   **目标体验**：强视觉代入感（Visual Novel 风格），高拟真的销售博弈。

---

## 2. 核心数据模型 (Data Schema: 5333 Model)

**注意：** 所有与 LLM 交互的数据必须遵循以下 JSON 结构。

### 2.1 Game Context (全局状态)
```typescript
interface GameState {
  company_profile: string; // 用户输入的公司背景
  current_project: Project; // 当前选中的项目
  current_stage: 'Discovery' | 'Validation' | 'Closing'; // 3个阶段
  turn_count: number;
  npcs: NPC[]; // 3个决策人
  history: ChatLog[]; // 对话历史
  status: 'active' | 'won' | 'lost' | 'no_decision'; // 结局状态
}
```

### 2.2 NPC Model (3个决策人)
```typescript
interface NPC {
  id: string;
  role_type: 'Economic_Buyer' | 'Technical_Buyer' | 'Coach' | 'Anti_Champion';
  name: string;
  avatar_prompt: string; // 用于生成图像的描述
  personality: string; // e.g., "Skeptical, Detail-oriented"
  trust_score: number; // 0-100
  hidden_agenda: string; // 隐藏痛点，需要探测
  status: 'Neutral' | 'Friendly' | 'Hostile';
}
```

### 2.3 Card Model (卡牌系统)
```typescript
interface Card {
  id: string;
  type: 'Talk' | 'Asset' | 'Social';
  name: string; // e.g., "SPIN Question", "Send Whitepaper"
  description: string;
  target_required: boolean; // 是否需要指定目标 NPC
  stage_unlock: string[]; // 在哪些阶段可用
}
```

---

## 3. 双 Agent 系统架构 (System Architecture)

### 3.1 Tech Stack
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion (用于动画).
*   **Backend**: Next.js Server Actions (或 Python FastAPI).
*   **AI Engine**: Anthropic Claude 3.5 Sonnet / 4.5 (via API).
*   **State Management**: Zustand (Frontend), Redis/Memory (Session storage).

### 3.2 Agent A: The Game Master (Main Loop)
*   **Function**: 处理玩家回合。
*   **Input**:
    *   Current Game State (JSON)
    *   Player Action (Card Played + Target NPC)
*   **System Prompt Strategy**:
    *   必须强制返回 **JSON** 格式。
    *   包含 `narrative` (剧情描述), `dialogue` (NPC台词), `state_updates` (数值变更), `visual_cue` (表情/背景变化指令).

### 3.3 Agent B: The Analyst (Post-Game)
*   **Function**: 游戏结束分析。
*   **Input**: Full Gameplay Log (User Actions + Agent A Responses).
*   **Output**: Structured Analysis Report (JSON).
    *   `radar_chart_data`: { logic: 80, empathy: 40, closing: 60 ... }
    *   `key_moments`: Array of strings (highlighting mistakes).
    *   `coaching_advice`: Specific actionable tips based on sales methodology (MEDDIC/SPIN).

---

## 4. 功能需求清单 (Feature Requirements)

### Phase 1: Game Setup (Initialization)
1.  **User Input Form**:
    *   Input: `Your Company Name`, `Product Description`, `Target Customer Industry`.
2.  **Scenario Generation (Agent A)**:
    *   根据 Input 生成 5 个潜在项目 (List of 5 titles + summaries).
    *   用户选择 1 个项目。
    *   Agent A 生成完整的初始化数据 (3 NPCs, Background Story).

### Phase 2: Main Gameplay (The Loop)
1.  **Scene Rendering**:
    *   显示背景图 (可以是静态预设或 AI 生成)。
    *   显示 3 个 NPC 立绘 (基于状态改变表情，如 `Normal`, `Happy`, `Angry`).
2.  **Card System**:
    *   玩家手牌区显示 3-5 张随机/固定卡牌。
    *   拖拽卡牌到指定 NPC 身上触发交互。
3.  **Interaction Resolution**:
    *   调用 Agent A API。
    *   前端解析返回的 JSON。
    *   **Visual Effects**: 屏幕震动 (如果 NPC 生气), 粒子效果 (如果成交), 更新信任条 (Progress Bar).
    *   **Text Output**: 打字机效果显示剧情和对话。
4.  **Stage Transition**:
    *   当满足特定条件 (如 Total Trust > 80)，弹窗提示进入下一阶段。

### Phase 3: Analytics (The Report)
1.  **Game Over Trigger**:
    *   达到 `Won` / `Lost` / `No Decision` 条件。
2.  **Report Generation**:
    *   Loading 界面 (提示 "AI Sales Coach is analyzing your calls...").
    *   调用 Agent B API。
    *   渲染分析页面：雷达图 (Chart.js), 时间轴复盘, 改进建议文本。

---

## 5. API 接口定义 (API Endpoints)

### `POST /api/game/init`
*   **Body**: `{ company_info: string, customer_industry: string }`
*   **Response**: `{ projects: [{id: 1, title: "..."} ... ] }`

### `POST /api/game/start`
*   **Body**: `{ selected_project_id: string }`
*   **Response**: `{ game_state: GameState, assets: { npc_images: [...] } }`

### `POST /api/game/turn`
*   **Body**:
    ```json
    {
      "history": [...],
      "current_state": {...},
      "action": { "card_id": "demo_call", "target_npc_id": "npc_1" }
    }
    ```
*   **Response (Expected from Agent A)**:
    ```json
    {
      "narrative": "王总看了一眼Demo，皱起了眉头...",
      "dialogue": { "npc_id": "npc_1", "text": "这虽然看起来不错，但部署太麻烦了。" },
      "state_changes": { "npc_1": { "trust": -10, "mood": "skeptical" } },
      "game_status_update": "active"
    }
    ```

### `POST /api/analyze`
*   **Body**: `{ full_game_log: [...] }`
*   **Response**: `{ score: 85, dimensions: {...}, feedback: "..." }`

---

## 6. 开发步骤 (Development Plan for AI)

请按以下顺序指示 AI 进行代码编写：

### Step 1: Project Skeleton & Types
*   Create Next.js project.
*   **Crucial**: Define `types.ts` first containing all the Interfaces (GameState, NPC, Card) defined in Section 2.

### Step 2: Agent A Logic (Backend)
*   Set up Anthropic API client.
*   Create the **System Prompt** for the Game Master. Focus on role-playing rules and strict JSON output format.
*   Implement `/api/game/turn` endpoint to handle the logic flow.

### Step 3: Frontend UI - Core Game
*   Build the Layout: NPC Stage (Top), Text Area (Middle), Card Hand (Bottom).
*   Create `NPCCard` component (displaying Avatar + Trust Bar).
*   Create `ActionCard` component.
*   Connect UI to `/api/game/turn`.

### Step 4: Game Flow Control
*   Implement Phase transitions (Discovery -> Validation -> Closing).
*   Implement Win/Loss logic check.

### Step 5: Agent B Integration
*   Create System Prompt for the Analyst (Focus on MEDDIC/SPIN methodology).
*   Build the Report Page UI (using a chart library).

### Step 6: Visual Polish (The "Vibe")
*   Add animations (Framer Motion).
*   Style with a dark, professional "Cyberpunk" or "High-end Corporate" theme.

---

## 7. 给 AI 的核心 Prompt 示例 (Core Prompts)

**Tips for User:** 在开发过程中，将以下 Prompt 片段喂给你的 Coding Agent 以确保逻辑正确。

**For Agent A (Game Master Logic):**
> "You are the Game Engine. You must output ONLY valid JSON. Do not include markdown formatting.
> Calculate the result of the card played based on the NPC's persona.
> If the card matches the NPC's hidden agenda, boost trust significantly.
> If the card is generic and the NPC is skeptical, reduce trust.
> Update the 'stage' only if all NPCs have trust > 60."

**For Agent B (Analyst Logic):**
> "Analyze the user's sales performance based on the provided logs.
> Use the 'SPIN Selling' framework.
> Did the user ask 'Problem Questions' before offering solutions?
> Rate them on: Empathy, Logic, Product Knowledge, Closing Skills."

## 8. Tool Call / Function Calling 架构规范 (Critical Update)

### 8.1 为什么要用 Tool Call？
*   **结构化保证**：不再依赖 Prompt 乞求 AI 返回 JSON，而是通过定义工具强制 AI 输出符合 Schema 的数据。
*   **状态控制权**：将游戏数值计算（如“信任度+10”）的决策权交给 AI，但执行权交给代码。
*   **多模态触发**：允许 AI 在剧情高潮时主动调用绘图 API 生成新场景。

### 8.2 Agent A (Game Master) 的核心工具定义
Agent A 不应直接返回文本，而应总是调用以下工具之一来推进游戏。

#### Tool 1: `resolve_turn_outcome` (核心回合结算)
这是游戏主循环中最常用的工具。当玩家打出一张牌后，Claude 必须调用此工具来提交结果。

```typescript
// Tool Definition for LLM
const resolveTurnTool = {
  name: "resolve_turn_outcome",
  description: "Call this function to process the player's card action, update NPC stats, and advance the narrative.",
  parameters: {
    type: "object",
    properties: {
      narrative: {
        type: "string",
        description: "The storytelling text describing what happened after the card was played."
      },
      npc_updates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            npc_id: { type: "string" },
            trust_change: { type: "number", description: "Change in trust score (e.g., +10, -5)" },
            mood_update: { type: "string", enum: ["Happy", "Neutral", "Angry", "Thinking", "Surprised"] },
            dialogue: { type: "string", description: "What this specific NPC says in response" }
          },
          required: ["npc_id", "trust_change", "mood_update"]
        }
      },
      stage_transition: {
        type: "object",
        properties: {
            should_advance: { type: "boolean" },
            next_stage_name: { type: "string" }
        },
        description: "Only set this if the players have met the criteria to move to the next sales stage."
      },
      visual_cues: {
        type: "array",
        items: { type: "string", enum: ["screen_shake", "confetti", "darken_bg", "spotlight"] },
        description: "Special effects to trigger on the frontend."
      }
    },
    required: ["narrative", "npc_updates"]
  }
};
```

#### Tool 2: `request_scene_generation` (视觉生成)
当剧情发生重大转折，或者进入新阶段时，Agent A 可以主动调用此工具来请求生成新的背景图或人物立绘。

```typescript
const requestSceneTool = {
  name: "request_scene_generation",
  description: "Call this when the location changes or a new visual context is needed.",
  parameters: {
    type: "object",
    properties: {
      prompt_description: {
        type: "string",
        description: "Detailed visual description for Stable Diffusion/Midjourney (e.g., 'Cyberpunk boardroom, tense atmosphere, blue lighting')."
      },
      asset_type: {
        type: "string",
        enum: ["background", "npc_avatar", "item_closeup"]
      }
    },
    required: ["prompt_description", "asset_type"]
  }
};
```

---

### 8.3 开发实现逻辑 (Implementation Flow)

告诉你的 AI Coding Agent (Cursor/Windsurf) 采用以下流程实现后端逻辑，推荐使用 **Vercel AI SDK (Core)** 或原生 SDK：

#### 1. 后端处理流程 (`/api/game/turn`)

```typescript
// Pseudo-code for Next.js Server Action / API Route
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai'; // Or anthropic provider

export async function handleGameTurn(gameState, playerAction) {
  
  // 1. 构建 Prompt，包含当前状态和玩家动作
  const systemPrompt = `
    You are the Dungeon Master for a B2B Sales RPG.
    Current Context: ${JSON.stringify(gameState)}
    Player Action: ${JSON.stringify(playerAction)}
    
    Evaluate the action based on the '5333' model.
    You MUST call the 'resolve_turn_outcome' tool to finalize the turn.
  `;

  // 2. 调用 LLM 并强制使用 Tool
  const { toolCalls } = await generateText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    system: systemPrompt,
    tools: {
      resolve_turn_outcome: resolveTurnTool, // 上面定义的 Schema
      request_scene_generation: requestSceneTool
    },
    toolChoice: 'required', // 强制 AI 必须调用工具，不能只闲聊
    maxSteps: 5, // 允许 AI 进行多步思考 (CoT)
  });

  // 3. 执行工具逻辑 (Execute Logic)
  const result = toolCalls[0]; 
  
  if (result.toolName === 'resolve_turn_outcome') {
    // 这里是关键：AI 只是"建议"修改数值，后端代码负责"真正"更新数据库/状态
    const updates = result.args;
    const newState = updateGameState(gameState, updates); 
    
    return {
      type: 'TURN_RESOLVED',
      payload: updates, // 前端拿去渲染剧情和动画
      newState: newState
    };
  }
  
  // Handle other tools...
}
```

---

### 8.4 针对 Tool Call 的 Prompt 优化

为了让 Agent A 更好地使用工具，需要在 System Prompt 中加入针对性的指导（请复制给 AI 编程助手）：

**Add this to Agent A's System Prompt:**

> **Tool Usage Protocol:**
> 1.  **Do not output raw markdown or text.** You communicate ONLY through `tool_calls`.
> 2.  **Logic over Fluff:** Before calling `resolve_turn_outcome`, analyze the `trust_score` logic.
>     *   If `trust_score` < 30 and Player tries to "Close Deal", the `mood_update` MUST be "Angry" and `trust_change` MUST be negative.
> 3.  **Visual Consistency:** Use `visual_cues` sparingly. Only use "screen_shake" for major mistakes (Trust -20 or more) and "confetti" for Stage Completion.
> 4.  **Dialogue:** Ensure the `dialogue` field in the tool matches the NPC's persona defined in the context.

---

### 8.5 Agent B (Observer) 是否需要 Tool？

Agent B 主要是分析师，通常不需要复杂的 Tool Call，但为了生成结构化报告，建议使用一个 `submit_analysis_report` 工具。

```typescript
const submitReportTool = {
  name: "submit_analysis_report",
  description: "Finalize the game analysis and generate the report.",
  parameters: {
    type: "object",
    properties: {
      scores: {
        type: "object",
        properties: {
          logic: { type: "number" },
          empathy: { type: "number" },
          closing: { type: "number" }
        }
      },
      feedback_markdown: { type: "string" }, // 详细的长文本建议
      key_mistake_index: { type: "number", description: "Index of the turn where the player lost the most trust." }
    }
  }
};
```