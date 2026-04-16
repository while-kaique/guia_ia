"use client";

import { useCallback, useRef, useState } from "react";
import type {
  AgentPhase,
  AnalysisOutput,
  ChatMessage,
  ChatResponse,
  OnboardingData,
  Recommendation,
} from "@/lib/types";

interface AgentOutputs {
  analysisOutput?: AnalysisOutput;
  recommendation?: Recommendation;
}

interface UseChatReturn {
  messages: ChatMessage[];
  currentPhase: AgentPhase;
  isLoading: boolean;
  agentOutputs: AgentOutputs;
  sendMessage: (text: string) => Promise<void>;
  initChat: (sessionId: string, onboardingData: OnboardingData) => void;
}

function createMessage(role: "user" | "assistant", content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

async function postChat(
  sessionId: string,
  message: string,
  phase: AgentPhase,
  isFirstMessage?: boolean,
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, phase, isFirstMessage }),
  });

  if (!res.ok) {
    throw new Error("Erro ao se comunicar com o agente");
  }

  return res.json() as Promise<ChatResponse>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<AgentPhase>("onboarding");
  const [isLoading, setIsLoading] = useState(false);
  const [agentOutputs, setAgentOutputs] = useState<AgentOutputs>({});

  const sessionIdRef = useRef<string>("");

  const handleAgentResponse = useCallback(
    async (response: ChatResponse) => {
      // Adiciona a mensagem do agente ao chat
      setMessages((prev) => [...prev, createMessage("assistant", response.message)]);

      // Se o agente finalizou a fase, guarda os outputs e transiciona
      if (response.status === "phase_complete" && response.nextPhase) {
        // Guarda outputs estruturados
        if (response.analysisOutput) {
          setAgentOutputs((prev) => ({
            ...prev,
            analysisOutput: response.analysisOutput,
          }));
        }
        if (response.recommendation) {
          setAgentOutputs((prev) => ({
            ...prev,
            recommendation: response.recommendation,
          }));
        }

        // Atualiza a fase
        const nextPhase = response.nextPhase;
        setCurrentPhase(nextPhase);

        // Dispara primeira mensagem pro próximo agente automaticamente
        // (não dispara para "learning" — os cards de recomendação assumem)
        if (nextPhase === "recommendation") {
          setIsLoading(true);
          const nextResponse = await postChat(
            sessionIdRef.current,
            "",
            nextPhase,
            true,
          );
          setMessages((prev) => [
            ...prev,
            createMessage("assistant", nextResponse.message),
          ]);

          // Se o próximo agente também completou de primeira
          if (nextResponse.status === "phase_complete" && nextResponse.nextPhase) {
            if (nextResponse.recommendation) {
              setAgentOutputs((prev) => ({
                ...prev,
                recommendation: nextResponse.recommendation,
              }));
            }
            setCurrentPhase(nextResponse.nextPhase);
          }

          setIsLoading(false);
        }
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      // Adiciona mensagem do usuário
      setMessages((prev) => [...prev, createMessage("user", text)]);
      setIsLoading(true);

      try {
        const response = await postChat(
          sessionIdRef.current,
          text,
          currentPhase,
        );
        await handleAgentResponse(response);
      } catch {
        setMessages((prev) => [
          ...prev,
          createMessage("assistant", "Ops, algo deu errado. Pode tentar de novo?"),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPhase, isLoading, handleAgentResponse],
  );

  const initChat = useCallback(
    (sessionId: string, onboardingData: OnboardingData) => {
      sessionIdRef.current = sessionId;
      setCurrentPhase("understanding");
      setIsLoading(true);

      // Primeira chamada pro Agente 1 — ele inicia a conversa
      postChat(sessionId, "", "understanding", true)
        .then((response) => {
          setMessages([createMessage("assistant", response.message)]);

          if (response.status === "phase_complete" && response.nextPhase) {
            setCurrentPhase(response.nextPhase);
          }
        })
        .catch(() => {
          setMessages([
            createMessage(
              "assistant",
              "Ops, tive um problema ao iniciar. Pode recarregar a página?",
            ),
          ]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [],
  );

  return {
    messages,
    currentPhase,
    isLoading,
    agentOutputs,
    sendMessage,
    initChat,
  };
}
