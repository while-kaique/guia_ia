"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LearningPath, LearningStep, ToolLearningPlan } from "@/lib/types";

const TOOL_EMOJI_MAP: Record<string, string> = {
  chatgpt: "\u{1F916}",
  gemini: "\u2728",
  copilot: "\u{1F9D1}\u200D\u2708\uFE0F",
  claude: "\u{1F9E0}",
  midjourney: "\u{1F3A8}",
  "notion ai": "\u{1F4DD}",
  cursor: "\u2328\uFE0F",
  n8n: "\u{1F517}",
  python: "\u{1F40D}",
  "google apps script": "\u{1F4DC}",
  "power automate": "\u26A1",
  zapier: "\u2699\uFE0F",
  make: "\u{1F527}",
  "make (integromat)": "\u{1F527}",
  lovable: "\u{1F49C}",
  airtable: "\u{1F4CA}",
  "airtable automations": "\u{1F4CA}",
  uipath: "\u{1F916}",
  "automation anywhere": "\u{1F3ED}",
  selenium: "\u{1F310}",
  puppeteer: "\u{1F3AD}",
  "power bi": "\u{1F4C8}",
};

function getToolEmoji(name: string): string {
  return TOOL_EMOJI_MAP[name.toLowerCase()] ?? "\u{1F6E0}\uFE0F";
}

const RESOURCE_ICONS: Record<string, string> = {
  video: "\u25B6\uFE0F",
  article: "\u{1F4D6}",
  docs: "\u{1F4C4}",
  interactive: "\u{1F3AE}",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
};

interface LearningPathViewProps {
  learningPath: LearningPath;
}

export default function LearningPathView({ learningPath }: LearningPathViewProps) {
  const hasMultipleTools = learningPath.tools.length > 1;

  // Todas as trilhas começam fechadas — usuário clica pra abrir uma de cada vez
  // e evita que a tela desça de uma vez só.
  const [openTools, setOpenTools] = useState<Set<string>>(() => new Set());

  function toggleTool(toolName: string) {
    setOpenTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolName)) next.delete(toolName);
      else next.add(toolName);
      return next;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" role="img" aria-hidden="true">{"\u{1F3AF}"}</span>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {hasMultipleTools ? "Suas trilhas personalizadas" : "Sua trilha personalizada"}
        </p>
      </div>

      {/* Overall message */}
      <div className="bg-[color-mix(in_oklab,var(--phase-accent)_8%,transparent)] border border-[color-mix(in_oklab,var(--phase-accent)_20%,transparent)] rounded-xl p-4 mb-4">
        <p className="text-sm text-[var(--phase-accent-strong)] dark:text-[var(--phase-accent-light)] leading-relaxed">
          {learningPath.overallMessage}
        </p>
      </div>

      {/* Aviso de opções independentes */}
      {hasMultipleTools && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex items-center gap-2 mb-4 px-1"
        >
          <span className="text-sm" role="img" aria-hidden="true">{"👆"}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Toque numa trilha pra abrir os passos. Cada uma é <strong className="text-slate-700 dark:text-slate-300">uma opção independente</strong> — escolha a que fizer mais sentido.
          </p>
        </motion.div>
      )}

      {/* Tool plans */}
      <div className="flex flex-col gap-3">
        {learningPath.tools.map((plan, planIndex) => (
          <ToolPlanSection
            key={plan.toolName}
            plan={plan}
            index={planIndex}
            totalTools={learningPath.tools.length}
            isOpen={openTools.has(plan.toolName)}
            onToggle={() => toggleTool(plan.toolName)}
          />
        ))}
      </div>

      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4"
      >
        <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
          {"💪"} <strong>Você já tá no caminho certo!</strong> Segue no seu ritmo, sem pressa.
          Qualquer dúvida, o time de RPA tá aí pra ajudar.
        </p>
      </motion.div>
    </motion.div>
  );
}

const PLAN_ACCENT_COLORS = [
  { border: "border-l-blue-500", bg: "bg-blue-500", label: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { border: "border-l-violet-500", bg: "bg-violet-500", label: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  { border: "border-l-amber-500", bg: "bg-amber-500", label: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
];

function ToolPlanSection({
  plan,
  index,
  totalTools,
  isOpen,
  onToggle,
}: {
  plan: ToolLearningPlan;
  index: number;
  totalTools: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasMultiple = totalTools > 1;
  const accent = PLAN_ACCENT_COLORS[index % PLAN_ACCENT_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
      className={`
        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm
        ${hasMultiple ? `border-l-4 ${accent.border}` : ""}
      `}
    >
      {/* Tool header — clicável, alterna expandido/recolhido */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {hasMultiple && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${accent.label}`}>
              Trilha {index + 1} de {totalTools}
            </span>
          )}
          <span className="text-xl" role="img" aria-hidden="true">
            {getToolEmoji(plan.toolName)}
          </span>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {plan.toolName}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {DIFFICULTY_LABELS[plan.difficulty] ?? plan.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            {"\u23F1"} {plan.estimatedTime}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </motion.svg>
        </div>
      </button>

      {/* Steps — colapsáveis */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />

                <div className="flex flex-col gap-5">
                  {plan.steps.map((step, stepIndex) => (
                    <StepItem
                      key={step.order}
                      step={step}
                      stepIndex={stepIndex}
                      isFirst={stepIndex === 0}
                      isLast={stepIndex === plan.steps.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StepItem({
  step,
  stepIndex,
  isFirst,
  isLast,
}: {
  step: LearningStep;
  stepIndex: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stepIndex * 0.05, duration: 0.25 }}
      className="relative pl-9"
    >
      {/* Step number circle */}
      <div className={`
        absolute left-0 top-0.5 w-[23px] h-[23px] rounded-full flex items-center justify-center text-[11px] font-bold z-10
        ${isFirst
          ? "bg-[var(--phase-accent)] text-white shadow-sm shadow-[color-mix(in_oklab,var(--phase-accent)_30%,transparent)]"
          : isLast
            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600"
        }
      `}>
        {step.order}
      </div>

      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
          {step.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
          {step.description}
        </p>

        {/* Resource link */}
        {step.resourceUrl && (
          <a
            href={step.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--phase-accent)] hover:text-[var(--phase-accent-strong)] dark:hover:text-[var(--phase-accent-light)] transition-colors group"
          >
            <span role="img" aria-hidden="true">
              {RESOURCE_ICONS[step.resourceType ?? "docs"]}
            </span>
            <span className="group-hover:underline">
              {step.resourceLabel ?? "Acessar recurso"}
            </span>
            <svg
              className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
}
