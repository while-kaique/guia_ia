"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const TOOLS = [
  // IA Generativa
  { id: "chatgpt", label: "ChatGPT", icon: "🤖" },
  { id: "gemini", label: "Gemini", icon: "✨" },
  { id: "copilot", label: "Copilot", icon: "🧑‍✈️" },
  { id: "claude", label: "Claude", icon: "🧠" },
  { id: "midjourney", label: "Midjourney", icon: "🎨" },
  { id: "notion-ai", label: "Notion AI", icon: "📝" },
  { id: "cursor", label: "Cursor", icon: "⌨️" },
  // Automação e RPA
  { id: "n8n", label: "n8n", icon: "🔗" },
  { id: "python", label: "Python", icon: "🐍" },
  { id: "google-apps-script", label: "Google Apps Script", icon: "📜" },
  { id: "power-automate", label: "Power Automate", icon: "⚡" },
  { id: "zapier", label: "Zapier", icon: "⚙️" },
  { id: "make", label: "Make (Integromat)", icon: "🔧" },
  { id: "lovable", label: "Lovable", icon: "💜" },
  { id: "airtable-automations", label: "Airtable Automations", icon: "📊" },
  { id: "uipath", label: "UiPath", icon: "🤖" },
  { id: "automation-anywhere", label: "Automation Anywhere", icon: "🏭" },
  { id: "selenium", label: "Selenium", icon: "🌐" },
  { id: "puppeteer", label: "Puppeteer", icon: "🎭" },
  { id: "power-bi", label: "Power BI (Dataflows)", icon: "📈" },
];

interface MultiSelectProps {
  onSubmit: (tools: string[], customTool: string) => void;
}

export default function MultiSelect({ onSubmit }: MultiSelectProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");

  function toggleTool(toolId: string) {
    setSelected((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  }

  function handleSubmit() {
    const toolLabels = selected.map((id) => {
      const tool = TOOLS.find((t) => t.id === id);
      return tool ? tool.label : id;
    });
    onSubmit(toolLabels, customTool.trim());
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleTool(tool.id)}
            className={`
              flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${
                selected.includes(tool.id)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
              }
            `}
            aria-pressed={selected.includes(tool.id)}
          >
            <span className="text-xl" role="img" aria-hidden="true">{tool.icon}</span>
            <span
              className={`text-sm font-medium ${
                selected.includes(tool.id)
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {tool.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={customTool}
          onChange={(e) => setCustomTool(e.target.value)}
          placeholder="Usa outra ferramenta? Digite aqui..."
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          aria-label="Outra ferramenta de IA"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selected.length === 0 && !customTool.trim()}
        size="lg"
        className="w-full"
      >
        Continuar
      </Button>
    </div>
  );
}
