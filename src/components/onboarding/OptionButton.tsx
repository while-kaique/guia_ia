"use client";

import { motion } from "framer-motion";

interface OptionButtonProps {
  label: string;
  description?: string;
  icon?: string;
  selected?: boolean;
  onClick: () => void;
}

export default function OptionButton({
  label,
  description,
  icon,
  selected = false,
  onClick,
}: OptionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full text-left p-5 rounded-2xl border-2 transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--phase-accent)] focus-visible:ring-offset-2
        ${
          selected
            ? "border-[var(--phase-accent)] bg-[color-mix(in_oklab,var(--phase-accent)_8%,transparent)] shadow-lg shadow-[color-mix(in_oklab,var(--phase-accent)_15%,transparent)]"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
        }
      `}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <span
            className={`block font-semibold text-base ${
              selected
                ? "text-[var(--phase-accent-strong)] dark:text-[var(--phase-accent-light)]"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {label}
          </span>
          {description && (
            <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </span>
          )}
        </div>
        <div
          className={`
            flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1
            transition-all duration-200
            ${
              selected
                ? "border-[var(--phase-accent)] bg-[var(--phase-accent)]"
                : "border-slate-300 dark:border-slate-600"
            }
          `}
        >
          {selected && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full h-full text-white p-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </div>
      </div>
    </motion.button>
  );
}
