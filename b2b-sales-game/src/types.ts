/**
 * B2B Sales Simulator - Core Type Definitions
 * Based on PRD Section 2 (Data Schema) and Section 8 (Tool Definitions)
 */

// --- Core Enums & Unions ---

export type Stage = 'Discovery' | 'Validation' | 'Closing';

export type GameStatus = 'active' | 'won' | 'lost' | 'no_decision';

export type NPCRole = 'Economic_Buyer' | 'Technical_Buyer' | 'Coach' | 'Anti_Champion' | 'Staff' | 'Gatekeeper';

export type NPCStatus = 'Neutral' | 'Friendly' | 'Hostile';

export type CardType = 'Interaction' | 'Opportunity' | 'Scheme' | 'Demonstrate' | 'System';

export type Mood = 'Happy' | 'Neutral' | 'Angry' | 'Thinking' | 'Surprised';

export type OpportunityStatus = 'unrevealed' | 'revealed' | 'achieved';

export type GameMode = 'quick' | 'detailed';

// --- Interfaces ---

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: OpportunityStatus;
  requirements: {
    npc_id: string;
    min_trust: number;
  }[];
  discovered_at?: number; // turn number
}

export interface Solution {
  features: string[];
  quality_score: number; // 0-100, based on how well it matches opportunities
  history: {
    turn: number;
    action: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  org_description_stages: string[]; // 3 parts of organization description, revealed per round
}

export interface ChatLog {
  role: 'user' | 'assistant' | 'system'; // Standard LLM roles
  content: string;
  timestamp: number;
  metadata?: {
    npc_id?: string;
    action_card_id?: string;
    action_card_name?: string;
    visual_cues?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turn_summary?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface NPC {
  id: string;
  role_type: NPCRole;
  title: string; // Job Title e.g. "Senior Manager"
  name: string;
  name_cn?: string;
  title_cn?: string;
  gender: 'Male' | 'Female'; // Added for avatar selection
  avatar: string; // Path to avatar image
  avatar_prompt: string; // Used for image generation description
  personality: string; // e.g., "Skeptical, Detail-oriented"
  personality_cn?: string;
  trust_score: number; // 0-5
  hidden_agenda: string; // Hidden pain point to be probed
  dialogues?: string[]; // Pool of 6 preset dialogues (optional to avoid breaking mock data immediately, but ideally required)
  status: NPCStatus;
  is_key_decision_maker: boolean; // If true, trust is required for stage progression
}

export interface Card {
  id: string;
  type: CardType;
  name: string; // e.g., "SPIN Question", "Send Whitepaper"
  description: string;
  name_cn?: string;
  description_cn?: string;
  type_cn?: string;
  target_required: boolean; // Whether a specific target NPC is required
  stage_unlock: Stage[]; // Available in which stages
  cost: number; // Base Action points cost
  cost_per_target?: number; // Additional cost per target selected
  interaction_type?: number; // For Type 1: 1-6 different text types
}

export interface GameState {
  language: 'en' | 'cn'; // Language preference
  game_mode: GameMode;
  difficulty_multiplier: number;
  company_profile: string; // User input company background
  current_project: Project; // Currently selected project
  current_stage: Stage;
  turn_count: number;
  max_turns: number; // Total turns allowed (e.g. 3)
  action_points: number; // Current action points
  max_action_points: number; // Max action points per turn
  npcs: NPC[]; // 3 Decision Makers
  history: ChatLog[]; // Dialogue history
  status: GameStatus;
  opportunities: Opportunity[];
  solution?: Solution;
}

// --- Tool/Action Interfaces (Based on Section 8) ---

export interface TurnAction {
  card_id: string;
  target_npc_id?: string; // Optional if target_required is false
}

export interface NPCUpdate {
  npc_id: string;
  trust_change: number;
  mood_update: Mood;
  dialogue: string;
}

export interface StageTransition {
  should_advance: boolean;
  next_stage_name?: string;
}

export interface TurnOutcome {
  narrative: string;
  npc_updates: NPCUpdate[];
  stage_transition?: StageTransition;
  visual_cues?: string[]; // e.g. ["screen_shake", "confetti"]
}

// --- Analysis Interfaces (Based on Section 8.5) ---

export interface AnalysisScore {
  logic: number;
  empathy: number;
  closing: number;
}

export interface KeyNode {
  turn: number;
  action_name: string;
  npc_name?: string;
  result: 'Positive' | 'Negative' | 'Neutral';
  description: string;
}

export interface TrustTrend {
  turn: number;
  npc_name: string;
  trust_score: number;
}

export interface AnalysisReport {
  scores: AnalysisScore;
  feedback_markdown: string;
  key_nodes: KeyNode[];
  trust_trends: TrustTrend[];
  key_mistake_index?: number;
}
