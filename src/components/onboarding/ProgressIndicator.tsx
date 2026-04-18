"use client";

import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  progress: number;
}

export default function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-xs mx-auto" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do onboarding">
      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--phase-from)] to-[var(--phase-to)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
        {progress < 0.5 ? "Quase lá..." : progress < 1 ? "Falta pouco!" : "Pronto!"}
      </p>
    </div>
  );
}
