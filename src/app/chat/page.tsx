"use client";

import { useEffect, useRef, useState } from "react";
import type { OnboardingData } from "@/lib/types";
import { useChat } from "@/hooks/useChat";
import ChatContainer from "@/components/chat/ChatContainer";

export default function ChatPage() {
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = sessionStorage.getItem("session_id");
    if (stored) return stored;
    const newId = String(Math.floor(1000000 + Math.random() * 9000000));
    sessionStorage.setItem("session_id", newId);
    return newId;
  });

  const { messages, currentPhase, isLoading, agentOutputs, sendMessage, initChat } = useChat();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const stored = sessionStorage.getItem("onboarding_data");
    if (!stored) return;

    initialized.current = true;
    const data = JSON.parse(stored) as OnboardingData;

    // Envia dados do onboarding pro n8n salvar no session_context
    fetch("/api/chat/init", {
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
      console.error("Erro ao enviar dados iniciais:", err);
    });

    // Inicia o chat com o Agente 1
    initChat(sessionId, data);
  }, [sessionId, initChat]);

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      currentPhase={currentPhase}
      recommendation={agentOutputs.recommendation}
      onSend={sendMessage}
    />
  );
}
