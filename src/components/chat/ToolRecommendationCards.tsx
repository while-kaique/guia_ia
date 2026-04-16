"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Recommendation, RecommendedTool } from "@/lib/types";

// Mapa de emojis reutilizando os mesmos do MultiSelect do onboarding
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

// Recursos fake para prototipagem
const FAKE_RESOURCES = [
  { type: "video" as const, title: "Tutorial: Primeiros passos", url: "https://www.youtube.com", duration: "12 min" },
  { type: "article" as const, title: "Guia completo para iniciantes", url: "https://www.youtube.com" },
  { type: "video" as const, title: "Exemplo prático: automação real", url: "https://www.youtube.com", duration: "18 min" },
  { type: "article" as const, title: "Dicas e boas práticas", url: "https://www.youtube.com" },
];

interface ToolRecommendationCardsProps {
  recommendation: Recommendation;
}

export default function ToolRecommendationCards({ recommendation }: ToolRecommendationCardsProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  function handleToolClick(toolName: string) {
    setExpandedTool(expandedTool === toolName ? null : toolName);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg" role="img" aria-hidden="true">{"\u{1F4A1}"}</span>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Sugerimos essas opções:
        </p>
      </div>

      {/* Tool buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {recommendation.tools.map((tool, index) => {
          const isTopPick = tool.name === recommendation.topPick;
          const isExpanded = expandedTool === tool.name;

          return (
            <motion.button
              key={tool.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleToolClick(tool.name)}
              className={`
                relative flex items-center gap-2.5 px-5 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isExpanded
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                }
              `}
              aria-expanded={isExpanded}
            >
              <span className="text-xl" role="img" aria-hidden="true">
                {getToolEmoji(tool.name)}
              </span>
              <span className={`text-sm font-semibold ${
                isExpanded
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-700 dark:text-slate-300"
              }`}>
                {tool.name}
              </span>
              {isTopPick && (
                <span className="absolute -top-2.5 -right-2 text-[10px] bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {"\u2B50"} Melhor opção
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Expanded tool guide */}
      <AnimatePresence mode="wait">
        {expandedTool && (
          <ExpandedToolGuide
            key={expandedTool}
            tool={recommendation.tools.find((t) => t.name === expandedTool)!}
            isTopPick={expandedTool === recommendation.topPick}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ExpandedToolGuide({ tool, isTopPick }: { tool: RecommendedTool; isTopPick: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-5 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">{getToolEmoji(tool.name)}</span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tool.name}</h3>
          </div>
          {isTopPick && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-medium">
              {"\u2B50"} Recomendação principal
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${EFFORT_COLORS[tool.effort]}`}>
            {"\u23F1"} {tool.effortLabel}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${COST_COLORS[tool.cost]}`}>
            {"\u{1F4B0}"} {tool.costLabel}
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {"\u{1F4C2}"} {tool.category}
          </span>
        </div>

        {/* Reason */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Por que essa ferramenta?
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {tool.reason}
          </p>
        </div>

        {/* Use case */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
            {"\u{1F4A1}"} No seu dia a dia
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {tool.useCase}
          </p>
        </div>

        {/* How to start */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
            {"\u{1F680}"} Primeiro passo
          </h4>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
            {tool.howToStart}
          </p>
        </div>

        {/* Learning resources */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {"\u{1F4DA}"} Recursos pra aprender
          </h4>
          <div className="space-y-2">
            {FAKE_RESOURCES.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                <span className="text-lg" role="img" aria-hidden="true">
                  {resource.type === "video" ? "\u25B6\uFE0F" : "\u{1F4D6}"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </p>
                  {resource.duration && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{resource.duration}</p>
                  )}
                </div>
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0"
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
            ))}
          </div>
        </div>

        {/* CTA link */}
        <a
          href={tool.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 transition-all"
        >
          Conhecer {tool.name} {"\u2192"}
        </a>
      </div>
    </motion.div>
  );
}
