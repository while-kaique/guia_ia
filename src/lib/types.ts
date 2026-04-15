export type AIUsageLevel = "low" | "occasional" | "high";

export type UserIntent = "automate" | "explore" | "stuck";

export interface OnboardingData {
  aiUsageLevel: AIUsageLevel | null;
  currentTools: string[];
  customTools: string;
  intent: UserIntent | null;
}

export type OnboardingStep = "welcome" | "usage" | "tools" | "intent" | "transition";

export interface TrackingEvent {
  event: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// --- Chat / Agents ---

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type AgentPhase =
  | "onboarding"
  | "understanding"
  | "recommendation"
  | "learning"
  | "escalation"
  | "resolved";

export interface ChatRequest {
  session_id: string;
  message: string;
  phase: AgentPhase;
  isFirstMessage?: boolean;
}

export interface RecommendedTool {
  name: string;
  category: string;
  reason: string;
  useCase: string;
  howToStart: string;
  effort: "low" | "medium" | "high";
  effortLabel: string;
  cost: "free" | "freemium" | "paid";
  costLabel: string;
  link: string;
}

export interface AnalysisOutput {
  problemSummary: string;
  category: string;
  currentProcess: string;
  painPoints: string[];
  desiredOutcome: string;
  userTechLevel: string;
  toolsAlreadyUsed: string[];
  confidence: string;
  turnCount: number;
  skipSuggestion: string;
}

export interface Recommendation {
  topPick: string;
  summary: string;
  tools: RecommendedTool[];
  chosenTool: string | null;
}

export interface ChatResponse {
  status: "continue" | "phase_complete";
  message: string;
  phase: AgentPhase;
  nextPhase?: AgentPhase;
  analysisOutput?: AnalysisOutput;
  recommendation?: Recommendation;
}
