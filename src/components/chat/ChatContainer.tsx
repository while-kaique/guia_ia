"use client";

import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const STEPS: Array<{
  phase: AgentPhase;
  label: string;
  icon: ReactNode;
}> = [
  {
    phase: "understanding",
    label: "Entender",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.28 1.153.71l1.072 1.713c.39.625 1.312.625 1.702 0l1.072-1.714c.26-.429.687-.672 1.153-.71 1.09-.084 2.17-.207 3.238-.363 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    phase: "recommendation",
    label: "Recomendar",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.545 7.455L21 12l-7.455 1.545L12 21l-1.545-7.455L3 12l7.455-1.545L12 3z" />
      </svg>
    ),
  },
  {
    phase: "learning",
    label: "Aprender",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

function getStepIndex(phase: AgentPhase): number {
  switch (phase) {
    case "understanding":
      return 0;
    case "recommendation":
      return 1;
    case "learning":
      return 2;
    default:
      return -1;
  }
}

function getActionText(
  phase: AgentPhase,
  isLoading: boolean,
  hasRecommendation: boolean,
  hasLearningPath: boolean,
): string {
  if (phase === "understanding") {
    return isLoading ? "Pensando na sua resposta..." : "Conversando pra entender seu contexto";
  }
  if (phase === "recommendation") {
    return isLoading
      ? "Analisando as melhores opções pra você..."
      : "Escolhendo as ferramentas ideais pro seu caso";
  }
  if (phase === "learning") {
    if (hasLearningPath) return "Sua trilha de aprendizado está pronta";
    if (isLoading) return "Montando sua trilha personalizada...";
    if (hasRecommendation) return "Escolha as ferramentas que você quer aprender";
    return "Preparando suas recomendações...";
  }
  return "";
}

interface StepNodeProps {
  state: "completed" | "active" | "upcoming";
  icon: ReactNode;
  label: string;
}

function StepNode({ state, icon, label }: StepNodeProps) {
  const circleClass =
    state === "completed"
      ? "bg-[var(--phase-accent)] text-white shadow-md shadow-[color-mix(in_oklab,var(--phase-accent)_30%,transparent)]"
      : state === "active"
        ? "bg-gradient-to-br from-[var(--phase-from)] to-[var(--phase-to)] text-white ring-4 ring-[color-mix(in_oklab,var(--phase-accent)_18%,transparent)] shadow-lg shadow-[color-mix(in_oklab,var(--phase-accent)_25%,transparent)]"
        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700";

  const labelClass =
    state === "active"
      ? "text-[var(--phase-accent-strong)] dark:text-[var(--phase-accent-light)]"
      : state === "completed"
        ? "text-slate-700 dark:text-slate-200"
        : "text-slate-400 dark:text-slate-500";

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-[900ms] ease-out ${circleClass}`}
      >
        {state === "completed" ? (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          icon
        )}
      </div>
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-[900ms] ease-out ${labelClass}`}
      >
        {label}
      </span>
    </div>
  );
}

interface StepConnectorProps {
  filled: boolean;
}

function StepConnector({ filled }: StepConnectorProps) {
  return (
    <div className="flex-1 h-0.5 mt-[18px] mx-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
      <div
        className={`absolute inset-y-0 left-0 bg-[var(--phase-accent)] transition-all duration-[900ms] ease-out ${
          filled ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}

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
  // 1. Tem recommendation, não tem learningPath, não tá loading → seleção de ferramentas
  // 2. isLoading após seleção → agente 3 processando (loader dedicado)
  // 3. Tem learningPath → trilha pronta
  const isLearningPhase = currentPhase === "learning";
  const showToolSelection =
    isLearningPhase && !!recommendation && !learningPath && !isLoading;
  const showLearningLoader = isLearningPhase && isLoading && !learningPath;
  const showLearningPath = isLearningPhase && !!learningPath;
  const showChatInput = !isLearningPhase && currentPhase !== "resolved";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasRecommendation = !!recommendation;
  const hasLearningPath = !!learningPath;

  // Auto-scroll debounced: evita que múltiplas mudanças rápidas (ex: nova
  // mensagem + isLoading flipando no mesmo tick) disparem vários smooth-scrolls
  // em paralelo — cada um perseguindo um alvo que ainda tá se movendo por
  // causa de animações de entrada/saída dos filhos. O setTimeout + cleanup
  // colapsa tudo num único scroll depois que o layout assentou.
  const messagesLength = messages.length;
  useEffect(() => {
    const id = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [messagesLength, isLoading, hasLearningPath]);

  // Enquanto o usuário está escolhendo ferramentas (fase "learning" mas ainda
  // sem loading nem trilha gerada), o stepper segura em "Recomendar". Só
  // avança pra "Aprender" quando ele clica em "Montar minha trilha" (loading)
  // ou quando a trilha já chegou.
  const isSelectingTools =
    currentPhase === "learning" && !isLoading && !hasLearningPath;
  const currentStepIdx = isSelectingTools ? 1 : getStepIndex(currentPhase);
  const actionText = getActionText(currentPhase, isLoading, hasRecommendation, hasLearningPath);

  // Fase "visual" usada pela paleta: enquanto o usuário escolhe ferramentas,
  // mantém o laranja de recomendação. O rose só entra quando o Agente 3 começa
  // a processar (loading) ou quando a trilha já chegou.
  const visualPhase: AgentPhase = isSelectingTools ? "recommendation" : currentPhase;

  return (
    <div data-phase={visualPhase} className="h-screen flex flex-col bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/85 dark:bg-slate-950/85 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center">
          {/* Stepper */}
          {currentStepIdx >= 0 && (
            <div className="flex items-start w-full">
              {STEPS.map((step, i) => {
                const state: "completed" | "active" | "upcoming" =
                  i < currentStepIdx
                    ? "completed"
                    : i === currentStepIdx
                      ? i === 2 && hasLearningPath
                        ? "completed"
                        : "active"
                      : "upcoming";
                return (
                  <Fragment key={step.phase}>
                    <StepNode state={state} icon={step.icon} label={step.label} />
                    {i < STEPS.length - 1 && (
                      <StepConnector filled={i < currentStepIdx || (i === currentStepIdx && state === "completed")} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          <AnimatePresence>
            {isLoading && !isLearningPhase && <TypingIndicator />}
          </AnimatePresence>

          {/* Fase learning: seleção de ferramentas / loader da trilha.
              min-h garante que a troca cards→loader não colapse a altura do
              container (cards ~400-450px, loader ~180px) — isso evitava scroll
              "engasgado" quando o conteúdo encurtava de repente. */}
          <div className={showToolSelection || showLearningLoader ? "min-h-[440px]" : ""}>
          <AnimatePresence mode="wait">
            {showToolSelection && (
              <motion.div
                key="tool-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <ToolRecommendationCards
                  recommendation={recommendation}
                  onChooseTools={onChooseTools}
                  disabled={isLoading}
                />
              </motion.div>
            )}

            {/* Fase learning: loader enquanto o agente 3 monta a trilha */}
            {showLearningLoader && (
              <motion.div
                key="learning-loader"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-8 flex flex-col items-center gap-4"
              >
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                      className="block w-3 h-3 rounded-full bg-[var(--phase-accent)]"
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Montando sua trilha personalizada...
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Selecionando os melhores recursos pro seu caso.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          {/* Fase learning: trilha de aprendizado */}
          {showLearningPath && (
            <LearningPathView learningPath={learningPath} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input — só aparece nas fases de conversa (understanding, recommendation) */}
      {showChatInput && (
        <div className="sticky bottom-0 px-6 pt-2 pb-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-2xl mx-auto">
            {actionText && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={actionText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="mb-2 flex items-center gap-2"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--phase-accent)] animate-pulse flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{actionText}</p>
                </motion.div>
              </AnimatePresence>
            )}
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
