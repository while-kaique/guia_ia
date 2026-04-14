"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import WelcomeScreen from "./WelcomeScreen";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";
import MultiSelect from "./MultiSelect";
import TransitionScreen from "./TransitionScreen";
import ProgressIndicator from "./ProgressIndicator";
import { motion } from "framer-motion";

export default function OnboardingFlow() {
  const router = useRouter();
  const {
    step,
    data,
    progress,
    canGoBack,
    startOnboarding,
    setUsageLevel,
    setTools,
    setIntent,
    goBack,
  } = useOnboarding();

  function handleTransitionComplete() {
    // Salvar dados do onboarding na sessionStorage para o chat
    sessionStorage.setItem("onboarding_data", JSON.stringify(data));
    router.push("/chat");
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      {/* Header com progresso e botão voltar */}
      {step !== "welcome" && step !== "transition" && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800/50"
        >
          <div className="max-w-lg mx-auto flex items-center gap-4">
            {canGoBack && (
              <button
                onClick={goBack}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Voltar para a pergunta anterior"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <ProgressIndicator progress={progress} />
            </div>
          </div>
        </motion.header>
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {step === "welcome" && <WelcomeScreen onStart={startOnboarding} />}

        {step === "usage" && (
          <QuestionCard
            title="Quanto você utiliza IA no dia a dia?"
            subtitle="Sem julgamentos, só queremos entender seu momento."
          >
            <OptionButton
              icon="🌱"
              label="Pouco ou nada"
              description="Ainda não explorei muito, ou nunca usei"
              selected={data.aiUsageLevel === "low"}
              onClick={() => setUsageLevel("low")}
            />
            <OptionButton
              icon="🔄"
              label="Ocasionalmente"
              description="Uso de vez em quando pra algumas coisas"
              selected={data.aiUsageLevel === "occasional"}
              onClick={() => setUsageLevel("occasional")}
            />
            <OptionButton
              icon="🚀"
              label="Bastante"
              description="Já faz parte da minha rotina de trabalho"
              selected={data.aiUsageLevel === "high"}
              onClick={() => setUsageLevel("high")}
            />
          </QuestionCard>
        )}

        {step === "tools" && (
          <QuestionCard
            title="Quais ferramentas você já utiliza?"
            subtitle="Selecione todas que se aplicam."
          >
            <MultiSelect onSubmit={setTools} />
          </QuestionCard>
        )}

        {step === "intent" && (
          <QuestionCard
            title="O que te trouxe aqui hoje?"
            subtitle="Conta pra gente o que você tá buscando."
          >
            <OptionButton
              icon="⚡"
              label="Quero automatizar algo específico"
              description="Tenho um processo ou tarefa que quero tornar mais eficiente"
              selected={data.intent === "automate"}
              onClick={() => setIntent("automate")}
            />
            <OptionButton
              icon="🔍"
              label="Quero explorar o que dá pra fazer com IA"
              description="Curioso pra saber como IA pode me ajudar"
              selected={data.intent === "explore"}
              onClick={() => setIntent("explore")}
            />
            <OptionButton
              icon="🤔"
              label="Já tentei algo e travei"
              description="Comecei a usar mas encontrei dificuldades"
              selected={data.intent === "stuck"}
              onClick={() => setIntent("stuck")}
            />
          </QuestionCard>
        )}

        {step === "transition" && (
          <TransitionScreen onComplete={handleTransitionComplete} />
        )}
      </main>
    </div>
  );
}
