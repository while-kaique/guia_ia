"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { AgentPhase, ChatMessage, LearningPath, Recommendation } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import ToolRecommendationCards from "./ToolRecommendationCards";
import LearningPathView from "./LearningPathView";

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentPhase: AgentPhase;
  recommendation?: Recommendation;
  learningPath?: LearningPath;
  onSend: (text: string) => void;
  onChooseTools: (tools: string[]) => void;
}

const PHASE_LABELS: Partial<Record<AgentPhase, string>> = {
  understanding: "Entendendo sua necessidade",
  recommendation: "Recomendando ferramentas",
  learning: "Montando sua trilha",
};

export default function ChatContainer({
  messages,
  isLoading,
  currentPhase,
  recommendation,
  learningPath,
  onSend,
  onChooseTools,
}: ChatContainerProps) {
  // Sub-estados da fase learning:
  // 1. Tem recommendation, não tem learningPath → seleção de ferramentas
  // 2. isLoading após seleção → agente 3 processando
  // 3. Tem learningPath → trilha pronta
  const isLearningPhase = currentPhase === "learning";
  const showToolSelection = isLearningPhase && !!recommendation && !learningPath;
  const showLearningPath = isLearningPhase && !!learningPath;
  const showChatInput = !isLearningPhase && currentPhase !== "resolved";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll quando chegam novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, learningPath]);

  const phaseLabel = PHASE_LABELS[currentPhase];

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white text-sm">Guia IA</h1>
            {phaseLabel && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{phaseLabel}</p>
            )}
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>

          {/* Fase learning: seleção de ferramentas */}
          {showToolSelection && (
            <ToolRecommendationCards
              recommendation={recommendation}
              onChooseTools={onChooseTools}
              disabled={isLoading}
            />
          )}

          {/* Fase learning: trilha de aprendizado */}
          {showLearningPath && (
            <LearningPathView learningPath={learningPath} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input — só aparece nas fases de conversa (understanding, recommendation) */}
      {showChatInput && (
        <div className="sticky bottom-0 px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              onSend={onSend}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
