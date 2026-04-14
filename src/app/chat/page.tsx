"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { OnboardingData } from "@/lib/types";

export default function ChatPage() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem("session_id");
    if (stored) return stored;
    const newId = String(Math.floor(1000000 + Math.random() * 9000000));
    sessionStorage.setItem("session_id", newId);
    return newId;
  });
  const webhookSent = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("onboarding_data");
    if (stored) {
      const data = JSON.parse(stored) as OnboardingData;
      setOnboardingData(data);

      // Envia dados para o n8n apenas uma vez
      if (!webhookSent.current) {
        webhookSent.current = true;
        fetch("https://n8n.gocase.com.br/webhook/receber_dados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            ai_usage_level: data.aiUsageLevel,
            current_tools: data.currentTools,
            custom_tools: data.customTools,
            intent: data.intent,
          }),
        }).catch((err) => {
          console.error("Erro ao enviar dados para o webhook:", err);
        });
      }
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <h1 className="font-semibold text-slate-900 dark:text-white">Guia IA</h1>
        </div>
      </header>

      {/* Chat area (placeholder) */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-emerald-400/10 dark:from-blue-500/20 dark:to-emerald-400/20 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Chat com o Agente IA
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Aqui você vai conversar com nosso agente que vai entender sua necessidade
            e te guiar pelo melhor caminho.
          </p>
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 text-sm text-slate-500 dark:text-slate-400">
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fase 2 — Em breve
            </p>
            <p>
              O chat com inteligência artificial será implementado na próxima fase.
            </p>
            {onboardingData && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-left">
                <p className="font-medium text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">
                  Seu perfil:
                </p>
                <p>Nível de uso: <span className="font-medium text-slate-700 dark:text-slate-300">{onboardingData.aiUsageLevel}</span></p>
                {onboardingData.currentTools.length > 0 && (
                  <p>Ferramentas: <span className="font-medium text-slate-700 dark:text-slate-300">{onboardingData.currentTools.join(", ")}</span></p>
                )}
                <p>Objetivo: <span className="font-medium text-slate-700 dark:text-slate-300">{onboardingData.intent}</span></p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Input placeholder */}
      <div className="sticky bottom-0 px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4">
            <input
              type="text"
              placeholder="Disponível em breve..."
              disabled
              className="flex-1 bg-transparent text-slate-400 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed text-sm"
              aria-label="Campo de mensagem (desabilitado)"
            />
            <button
              disabled
              className="p-2 rounded-xl bg-blue-500/20 text-blue-400 cursor-not-allowed"
              aria-label="Enviar mensagem (desabilitado)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
