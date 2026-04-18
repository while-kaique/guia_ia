"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentPhase,
  AnalysisOutput,
  ChatMessage,
  ChatResponse,
  LearningPath,
  OnboardingData,
  Recommendation,
} from "@/lib/types";

// Mensagem inicial personalizada por nível × intenção
const INITIAL_MESSAGES: Record<string, string> = {
  // Iniciante — curioso, quer ver o que existe
  low_explore:
    "Oi! 👋 Que bom que você quer conhecer o que a IA pode fazer! Me conta um pouquinho sobre o que você faz no dia a dia — assim consigo te mostrar coisas que fazem sentido pra sua rotina.",

  // Iniciante — quer automatizar algo
  low_automate:
    "Oi! 👋 Mesmo sem muita experiência com IA, tem muita coisa que dá pra automatizar fácil. Me conta: o que tá tomando mais tempo no seu dia? Pode ser algo repetitivo, manual, chato de fazer...",

  // Iniciante — tentou e travou
  low_stuck:
    "Oi! 👋 Fica tranquilo, vamos resolver isso juntos! Me conta o que aconteceu — o que você tentou fazer e onde travou? Pode mandar sem medo, mesmo que pareça besteira.",

  // Usa às vezes — curioso pra ir além
  occasional_explore:
    "Oi! 👋 Vi que você já usa IA de vez em quando — bora ver o que mais pode funcionar pra você? Me conta o que você já faz com IA hoje e onde sente que dá pra ir além.",

  // Usa às vezes — quer automatizar
  occasional_automate:
    "Oi! 👋 Você já tem uma base com IA e quer automatizar algo — boa combinação! Me conta qual processo tá te incomodando. Quanto mais detalhe, melhor vai ser a recomendação.",

  // Usa às vezes — travou em algo
  occasional_stuck:
    "Oi! 👋 Às vezes a gente sabe usar IA mas trava num caso específico — é normal. Me conta o que tá acontecendo. Muitas vezes é só questão de usar a ferramenta certa pro problema certo.",

  // Usa bastante — quer explorar novidades
  high_explore:
    "Oi! 👋 Você já manja bastante de IA — massa! Bora ver se tem algo novo que complementa seu arsenal? Me conta o que você já usa e onde sente que ainda tem espaço pra melhorar.",

  // Usa bastante — quer automatizar algo específico
  high_automate:
    "Oi! 👋 Com sua experiência, provavelmente você já tem uma ideia boa do que quer automatizar. Manda o cenário — quanto mais contexto, mais certeira vai ser a recomendação.",

  // Usa bastante — travou em algo
  high_stuck:
    "Oi! 👋 Mesmo quem já usa IA no dia a dia trava às vezes — faz parte. Me conta o problema e vamos achar o melhor caminho juntos.",
};

const FALLBACK_MESSAGE =
  "Oi! 👋 Me conta um pouco sobre o que você faz e como posso te ajudar com IA.";

function getInitialMessage(data: OnboardingData): string {
  if (!data.aiUsageLevel || !data.intent) return FALLBACK_MESSAGE;
  return INITIAL_MESSAGES[`${data.aiUsageLevel}_${data.intent}`] ?? FALLBACK_MESSAGE;
}

interface AgentOutputs {
  analysisOutput?: AnalysisOutput;
  recommendation?: Recommendation;
  learningPath?: LearningPath;
}

interface UseChatReturn {
  messages: ChatMessage[];
  currentPhase: AgentPhase;
  isLoading: boolean;
  isRestored: boolean;
  agentOutputs: AgentOutputs;
  sendMessage: (text: string) => Promise<void>;
  sendToolChoices: (chosenTools: string[]) => Promise<void>;
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
  chosenTools?: string[],
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      phase,
      isFirstMessage,
      chosenTools,
    }),
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
  const [isRestored, setIsRestored] = useState(false);

  const sessionIdRef = useRef<string>("");
  // Quando o auto-trigger da fase recommendation falha, o próximo sendMessage
  // precisa re-enviar com isFirstMessage: true pra Agente 2 recarregar contexto.
  const pendingFirstMessagePhaseRef = useRef<AgentPhase | null>(null);

  // Restaura estado do sessionStorage no mount (client-only, evita hydration mismatch)
  useEffect(() => {
    try {
      const storedMessages = sessionStorage.getItem("chat_messages");
      if (storedMessages) setMessages(JSON.parse(storedMessages));

      const storedPhase = sessionStorage.getItem("chat_phase") as AgentPhase;
      if (storedPhase) setCurrentPhase(storedPhase);

      const storedOutputs = sessionStorage.getItem("chat_agent_outputs");
      if (storedOutputs) setAgentOutputs(JSON.parse(storedOutputs));

      const storedSessionId = sessionStorage.getItem("session_id");
      if (storedSessionId) sessionIdRef.current = storedSessionId;
    } catch {
      // ignore
    }
    setIsRestored(true);
  }, []);

  // Persiste estado no sessionStorage a cada mudança (só após restauração)
  useEffect(() => {
    if (!isRestored) return;
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    sessionStorage.setItem("chat_phase", currentPhase);
  }, [currentPhase, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    sessionStorage.setItem("chat_agent_outputs", JSON.stringify(agentOutputs));
  }, [agentOutputs, isRestored]);

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
        // (não dispara para "learning" — os cards de seleção assumem)
        if (nextPhase === "recommendation") {
          setIsLoading(true);
          try {
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
          } catch {
            pendingFirstMessagePhaseRef.current = nextPhase;
            setMessages((prev) => [
              ...prev,
              createMessage(
                "assistant",
                "Tive um tropeço agora pra gerar as recomendações — o serviço deu uma engasgada. Manda qualquer mensagem aqui que eu tento de novo.",
              ),
            ]);
          } finally {
            setIsLoading(false);
          }
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

      const isRetryFirstMessage =
        pendingFirstMessagePhaseRef.current === currentPhase;

      try {
        const response = await postChat(
          sessionIdRef.current,
          isRetryFirstMessage ? "" : text,
          currentPhase,
          isRetryFirstMessage || undefined,
        );
        if (isRetryFirstMessage) pendingFirstMessagePhaseRef.current = null;
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

  const sendToolChoices = useCallback(
    async (chosenTools: string[]) => {
      if (isLoading || chosenTools.length === 0) return;

      // Mensagem do usuário mostrando a escolha
      const toolList = chosenTools.join(", ");
      setMessages((prev) => [
        ...prev,
        createMessage("user", `Quero aprender: ${toolList}`),
      ]);
      setIsLoading(true);

      try {
        const response = await postChat(
          sessionIdRef.current,
          "",
          "learning",
          true,
          chosenTools,
        );

        // Adiciona mensagem do agente
        if (response.message) {
          setMessages((prev) => [
            ...prev,
            createMessage("assistant", response.message),
          ]);
        }

        // Guarda a trilha de aprendizado
        if (response.learningPath) {
          setAgentOutputs((prev) => ({
            ...prev,
            learningPath: response.learningPath,
          }));
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            "Ops, tive um problema ao montar sua trilha. Pode tentar de novo?",
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const initChat = useCallback(
    (sessionId: string, onboardingData: OnboardingData) => {
      sessionIdRef.current = sessionId;
      setCurrentPhase("understanding");

      // Mensagem personalizada baseada no perfil — aparece instantaneamente
      const greeting = getInitialMessage(onboardingData);
      setMessages([createMessage("assistant", greeting)]);
    },
    [],
  );

  return {
    messages,
    currentPhase,
    isLoading,
    isRestored,
    agentOutputs,
    sendMessage,
    sendToolChoices,
    initChat,
  };
}
