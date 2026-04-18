"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TransitionScreenProps {
  onComplete: () => void;
}

const messages = [
  "Preparando tudo pra você...",
  "Analisando suas respostas...",
  "Quase lá!",
];

export default function TransitionScreen({ onComplete }: TransitionScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < messages.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center text-center px-6">
      {/* Animação de loading */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative w-24 h-24 mb-10"
      >
        {/* Anel externo rotativo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--phase-from)] border-r-[var(--phase-to)]"
        />
        {/* Anel interno rotativo (sentido contrário) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-2 border-transparent border-b-[var(--phase-to)] border-l-[var(--phase-from)] opacity-70"
        />
        {/* Centro pulsante */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-7 rounded-full bg-gradient-to-br from-[var(--phase-from)] to-[var(--phase-to)] shadow-lg shadow-[color-mix(in_oklab,var(--phase-accent)_35%,transparent)]"
        />
      </motion.div>

      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-xl font-semibold text-slate-800 dark:text-slate-200"
      >
        {messages[messageIndex]}
      </motion.p>

      {/* Dots de progresso */}
      <div className="flex gap-2 mt-6">
        {messages.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === messageIndex ? 1.3 : 1 }}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= messageIndex
                ? "bg-[var(--phase-accent)]"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
