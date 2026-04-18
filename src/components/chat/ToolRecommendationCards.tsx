"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Recommendation } from "@/lib/types";

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

const EFFORT_COLORS: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const COST_COLORS: Record<string, string> = {
  free: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  freemium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

interface ToolRecommendationCardsProps {
  recommendation: Recommendation;
  onChooseTools: (tools: string[]) => void;
  disabled?: boolean;
}

export default function ToolRecommendationCards({
  recommendation,
  onChooseTools,
  disabled = false,
}: ToolRecommendationCardsProps) {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(() => {
    // Pré-seleciona o topPick pra facilitar pro leigo
    return new Set(recommendation.topPick ? [recommendation.topPick] : []);
  });

  function toggleTool(toolName: string) {
    if (disabled) return;
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolName)) {
        next.delete(toolName);
      } else {
        next.add(toolName);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (selectedTools.size === 0 || disabled) return;
    onChooseTools(Array.from(selectedTools));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" role="img" aria-hidden="true">{"\u{1F4A1}"}</span>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Escolha as ferramentas pra montar sua trilha:
        </p>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
        Toque nas que te interessam. Pode escolher mais de uma.
      </p>

      {/* Tool cards */}
      <div className="flex flex-col gap-3 mb-5">
        {recommendation.tools.map((tool, index) => {
          const isTopPick = tool.name === recommendation.topPick;
          const isSelected = selectedTools.has(tool.name);

          return (
            <motion.button
              key={tool.name}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={() => toggleTool(tool.name)}
              disabled={disabled}
              className={`
                relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--phase-accent)]
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                ${isSelected
                  ? "border-[var(--phase-accent)] bg-[color-mix(in_oklab,var(--phase-accent)_8%,transparent)] shadow-md shadow-[color-mix(in_oklab,var(--phase-accent)_15%,transparent)]"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                }
              `}
            >
              {/* Top Pick badge */}
              {isTopPick && (
                <span className="absolute -top-2.5 right-3 text-[10px] bg-amber-400 text-amber-900 px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                  {"⭐"} Melhor opção
                </span>
              )}

              <div className="flex items-start gap-3">
                {/* Checkbox indicator */}
                <div className={`
                  mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
                  ${isSelected
                    ? "border-[var(--phase-accent)] bg-[var(--phase-accent)]"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Tool info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl" role="img" aria-hidden="true">
                      {getToolEmoji(tool.name)}
                    </span>
                    <span className={`text-sm font-semibold ${
                      isSelected
                        ? "text-[var(--phase-accent-strong)] dark:text-[var(--phase-accent-light)]"
                        : "text-slate-800 dark:text-slate-200"
                    }`}>
                      {tool.name}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${EFFORT_COLORS[tool.effort]}`}>
                      {"\u23F1"} {tool.effortLabel}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${COST_COLORS[tool.cost]}`}>
                      {"\u{1F4B0}"} {tool.costLabel}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {"\u{1F4C2}"} {tool.category}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {tool.reason}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        whileHover={selectedTools.size > 0 && !disabled ? { scale: 1.02 } : undefined}
        whileTap={selectedTools.size > 0 && !disabled ? { scale: 0.98 } : undefined}
        onClick={handleSubmit}
        disabled={selectedTools.size === 0 || disabled}
        className={`
          w-full py-3.5 px-5 rounded-xl text-sm font-semibold transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--phase-accent)] focus-visible:ring-offset-2
          ${selectedTools.size > 0 && !disabled
            ? "bg-gradient-to-r from-[var(--phase-from)] to-[var(--phase-to)] text-white shadow-lg shadow-[color-mix(in_oklab,var(--phase-accent)_25%,transparent)] hover:shadow-[color-mix(in_oklab,var(--phase-accent)_40%,transparent)] hover:brightness-110"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          }
        `}
      >
        {selectedTools.size > 0
          ? `\u{1F680} Montar minha trilha (${selectedTools.size})`
          : "Selecione ao menos uma ferramenta"
        }
      </motion.button>
    </motion.div>
  );
}
