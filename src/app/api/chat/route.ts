import { NextResponse } from "next/server";
import type { AgentPhase, ChatRequest, ChatResponse } from "@/lib/types";

const WEBHOOK_MAP: Partial<Record<AgentPhase, string | undefined>> = {
  understanding: process.env.N8N_WEBHOOK_AGENT1,
  recommendation: process.env.N8N_WEBHOOK_AGENT2,
  learning: process.env.N8N_WEBHOOK_AGENT3,
};

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;

  const { session_id, message, phase, isFirstMessage, chosenTools } = body;

  if (!session_id || !phase) {
    return NextResponse.json(
      { error: "session_id e phase são obrigatórios" },
      { status: 400 },
    );
  }

  const webhookUrl = WEBHOOK_MAP[phase];

  if (!webhookUrl) {
    return NextResponse.json(
      { error: `Nenhum webhook configurado para a fase "${phase}"` },
      { status: 400 },
    );
  }

  let n8nPayload: Record<string, unknown>;

  if (isFirstMessage) {
    n8nPayload = { session_id, message: "", isFirstMessage: true };
    if (chosenTools) {
      n8nPayload.chosenTools = chosenTools;
    }
  } else {
    n8nPayload = { session_id, message };
  }

  const n8nResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n8nPayload),
  });

  if (!n8nResponse.ok) {
    return NextResponse.json(
      { error: "Erro ao se comunicar com o agente" },
      { status: 502 },
    );
  }

  const raw: unknown = await n8nResponse.json();

  // n8n pode retornar array ou objeto — normalizamos para objeto
  const item = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;

  // n8n retorna { can_go: "recommendation" } quando o agente finaliza
  // Normalizamos para o formato que o frontend espera
  if (item.can_go) {
    const data: ChatResponse = {
      status: "phase_complete",
      message: typeof item.message === "string"
        ? item.message
        : "Entendi tudo! Vou te conectar com o próximo passo.",
      phase,
      nextPhase: item.can_go as ChatResponse["nextPhase"],
      analysisOutput: item.analysisOutput as ChatResponse["analysisOutput"],
      recommendation: item.recommendation as ChatResponse["recommendation"],
      learningPath: item.learningPath as ChatResponse["learningPath"],
    };
    return NextResponse.json(data);
  }

  return NextResponse.json(item as unknown as ChatResponse);
}
