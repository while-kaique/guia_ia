"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface QuestionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  direction?: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function QuestionCard({
  title,
  subtitle,
  children,
  direction = 1,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={title}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-slate-500 dark:text-slate-400 mt-3 text-base"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
