"use client";

import { useCallback, useReducer } from "react";
import type { AIUsageLevel, OnboardingData, OnboardingStep, UserIntent } from "@/lib/types";
import { trackEvent } from "@/lib/tracking";

interface OnboardingState {
  step: OnboardingStep;
  data: OnboardingData;
  stepStartTime: number;
}

type OnboardingAction =
  | { type: "START_ONBOARDING" }
  | { type: "SET_USAGE_LEVEL"; payload: AIUsageLevel }
  | { type: "SET_TOOLS"; payload: { tools: string[]; customTools: string } }
  | { type: "SET_INTENT"; payload: UserIntent }
  | { type: "GO_BACK" }
  | { type: "START_TRANSITION" };

const initialState: OnboardingState = {
  step: "welcome",
  data: {
    aiUsageLevel: null,
    currentTools: [],
    customTools: "",
    intent: null,
  },
  stepStartTime: Date.now(),
};

function getNextStep(state: OnboardingState, action: OnboardingAction): OnboardingStep {
  switch (action.type) {
    case "START_ONBOARDING":
      return "usage";
    case "SET_USAGE_LEVEL": {
      // Se uso é baixo, pula a tela de ferramentas
      if (action.payload === "low") return "intent";
      return "tools";
    }
    case "SET_TOOLS":
      return "intent";
    case "SET_INTENT":
    case "START_TRANSITION":
      return "transition";
    default:
      return state.step;
  }
}

function getPreviousStep(currentStep: OnboardingStep, data: OnboardingData): OnboardingStep {
  switch (currentStep) {
    case "usage":
      return "welcome";
    case "tools":
      return "usage";
    case "intent":
      // Se uso era baixo, volta pra usage (pulou tools)
      if (data.aiUsageLevel === "low") return "usage";
      return "tools";
    case "transition":
      return "intent";
    default:
      return "welcome";
  }
}

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  const timeSpent = Date.now() - state.stepStartTime;

  switch (action.type) {
    case "GO_BACK": {
      const previousStep = getPreviousStep(state.step, state.data);
      trackEvent("onboarding_step_back", {
        from: state.step,
        to: previousStep,
      });
      return {
        ...state,
        step: previousStep,
        stepStartTime: Date.now(),
      };
    }
    case "START_ONBOARDING": {
      trackEvent("onboarding_started");
      return {
        ...state,
        step: "usage",
        stepStartTime: Date.now(),
      };
    }
    case "SET_USAGE_LEVEL": {
      trackEvent("onboarding_usage_level", {
        level: action.payload,
        timeSpentMs: timeSpent,
      });
      return {
        ...state,
        step: getNextStep(state, action),
        data: { ...state.data, aiUsageLevel: action.payload },
        stepStartTime: Date.now(),
      };
    }
    case "SET_TOOLS": {
      trackEvent("onboarding_tools_selected", {
        tools: action.payload.tools,
        customTools: action.payload.customTools,
        count: action.payload.tools.length,
        timeSpentMs: timeSpent,
      });
      return {
        ...state,
        step: getNextStep(state, action),
        data: {
          ...state.data,
          currentTools: action.payload.tools,
          customTools: action.payload.customTools,
        },
        stepStartTime: Date.now(),
      };
    }
    case "SET_INTENT": {
      trackEvent("onboarding_intent", {
        intent: action.payload,
        timeSpentMs: timeSpent,
      });
      return {
        ...state,
        step: "transition",
        data: { ...state.data, intent: action.payload },
        stepStartTime: Date.now(),
      };
    }
    case "START_TRANSITION": {
      trackEvent("onboarding_completed", {
        totalData: state.data,
      });
      return {
        ...state,
        step: "transition",
        stepStartTime: Date.now(),
      };
    }
    default:
      return state;
  }
}

export function useOnboarding() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startOnboarding = useCallback(() => dispatch({ type: "START_ONBOARDING" }), []);
  const setUsageLevel = useCallback(
    (level: AIUsageLevel) => dispatch({ type: "SET_USAGE_LEVEL", payload: level }),
    []
  );
  const setTools = useCallback(
    (tools: string[], customTools: string) =>
      dispatch({ type: "SET_TOOLS", payload: { tools, customTools } }),
    []
  );
  const setIntent = useCallback(
    (intent: UserIntent) => dispatch({ type: "SET_INTENT", payload: intent }),
    []
  );
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);

  const canGoBack = state.step !== "welcome" && state.step !== "transition";

  // Progresso: welcome=0, usage=1, tools=2, intent=3, transition=4
  const stepIndex = ["welcome", "usage", "tools", "intent", "transition"].indexOf(state.step);
  const totalSteps = state.data.aiUsageLevel === "low" ? 3 : 4;
  const progress = Math.min(stepIndex / totalSteps, 1);

  return {
    step: state.step,
    data: state.data,
    progress,
    canGoBack,
    startOnboarding,
    setUsageLevel,
    setTools,
    setIntent,
    goBack,
  };
}
