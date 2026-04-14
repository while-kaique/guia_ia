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
