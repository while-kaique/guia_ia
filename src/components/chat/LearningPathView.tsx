"use client";

import { motion } from "framer-motion";
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
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 mb-4">
        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
          {learningPath.overallMessage}
        </p>
      </div>

      {/* Aviso de opções independentes */}
      {hasMultipleTools && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex items-center gap-2 mb-5 px-1"
        >
          <span className="text-sm" role="img" aria-hidden="true">{"👆"}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Cada trilha abaixo é <strong className="text-slate-700 dark:text-slate-300">uma opção independente</strong> — você não precisa fazer todas.
            Escolha a que fizer mais sentido pra você.
          </p>
        </motion.div>
      )}

      {/* Tool plans */}
      <div className="flex flex-col gap-0">
        {learningPath.tools.map((plan, planIndex) => (
          <div key={plan.toolName}>
            <ToolPlanSection
              plan={plan}
              index={planIndex}
              totalTools={learningPath.tools.length}
            />
            {/* Separador "OU" entre trilhas */}
            {hasMultipleTools && planIndex < learningPath.tools.length - 1 && (
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
                  ou
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4"
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

function ToolPlanSection({ plan, index, totalTools }: { plan: ToolLearningPlan; index: number; totalTools: number }) {
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
      {/* Tool header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
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
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {"\u23F1"} {plan.estimatedTime}
        </span>
      </div>

      {/* Steps */}
      <div className="px-5 py-4">
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
                parentIndex={index}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StepItem({
  step,
  stepIndex,
  isFirst,
  isLast,
  parentIndex,
}: {
  step: LearningStep;
  stepIndex: number;
  isFirst: boolean;
  isLast: boolean;
  parentIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + parentIndex * 0.15 + stepIndex * 0.08, duration: 0.3 }}
      className="relative pl-9"
    >
      {/* Step number circle */}
      <div className={`
        absolute left-0 top-0.5 w-[23px] h-[23px] rounded-full flex items-center justify-center text-[11px] font-bold z-10
        ${isFirst
          ? "bg-blue-500 text-white shadow-sm shadow-blue-500/30"
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
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
