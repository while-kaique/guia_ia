"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
          ${
            isUser
              ? "bg-gradient-to-r from-[var(--phase-accent)] to-[var(--phase-accent-strong)] text-white rounded-2xl rounded-br-md shadow-lg shadow-[color-mix(in_oklab,var(--phase-accent)_20%,transparent)]"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md"
          }
        `}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
