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

  // Chama o n8n com 1 retry em falha transitória (5xx / rede).
  async function callN8n(): Promise<
    { ok: true; status: number; raw: unknown }
    | { ok: false; status: number; reason: string }
  > {
    let res: Response;
    try {
      res = await fetch(webhookUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      });
    } catch (err) {
      return { ok: false, status: 0, reason: `fetch: ${(err as Error).message}` };
    }

    let raw: unknown;
    try {
      raw = await res.json();
    } catch {
      return { ok: false, status: res.status, reason: "invalid-json" };
    }
    return { ok: true, status: res.status, raw };
  }

  let attempt = await callN8n();
  const shouldRetry =
    !attempt.ok ||
    (attempt.status >= 500 && attempt.status < 600 && !attempt.raw);
  if (shouldRetry) {
    console.warn(
      `[/api/chat] tentativa 1 falhou (status=${attempt.status}); retry...`,
    );
    await new Promise((r) => setTimeout(r, 800));
    attempt = await callN8n();
  }

  if (!attempt.ok) {
    console.error(
      `[/api/chat] n8n falhou após retry (status=${attempt.status}, reason=${attempt.reason})`,
    );
    return NextResponse.json(
      { error: "Erro ao se comunicar com o agente" },
      { status: 502 },
    );
  }

  const n8nStatus = attempt.status;
  const raw = attempt.raw;

  // n8n pode retornar array ou objeto — normalizamos para objeto
  const item = (Array.isArray(raw) ? raw[0] : raw) as
    | Record<string, unknown>
    | undefined;

  // Se status não-ok e body não tem estrutura de resposta do agente, falha
  const hasAgentShape =
    !!item &&
    (typeof item.message === "string" ||
      item.recommendation !== undefined ||
      item.analysisOutput !== undefined ||
      item.learningPath !== undefined ||
      item.can_go !== undefined ||
      item.status === "continue" ||
      item.status === "phase_complete");

  const n8nOk = n8nStatus >= 200 && n8nStatus < 300;
  if (!n8nOk && !hasAgentShape) {
    console.error(
      `[/api/chat] n8n retornou ${n8nStatus}:`,
      JSON.stringify(raw).slice(0, 500),
    );
    return NextResponse.json(
      { error: "Erro ao se comunicar com o agente" },
      { status: 502 },
    );
  }

  if (!item) {
    return NextResponse.json(
      { error: "Resposta vazia do agente" },
      { status: 502 },
    );
  }

  // n8n retorna { can_go: "recommendation" } quando o agente finaliza
  // Normalizamos para o formato que o frontend espera
  if (item.can_go) {
    const nextPhase = item.can_go as ChatResponse["nextPhase"];
    const fallbackByPhase: Record<string, string> = {
      recommendation:
        "Boa, já entendi seu contexto! Agora vou pensar nas ferramentas de IA que mais fazem sentido pra você — só um instante.",
      learning:
        "Prontinho! Separei algumas ferramentas que acho que vão te ajudar. Dá uma olhada nos cards que vão aparecer aqui embaixo — clica em cada um pra ver por que indiquei, como funciona e como começar. Depois é só escolher qual (ou quais) você quer aprender a usar de verdade.",
    };
    const data: ChatResponse = {
      status: "phase_complete",
      message: typeof item.message === "string"
        ? item.message
        : (nextPhase && fallbackByPhase[nextPhase]) ??
          "Beleza, vamos pro próximo passo!",
      phase,
      nextPhase,
      analysisOutput: item.analysisOutput as ChatResponse["analysisOutput"],
      recommendation: item.recommendation as ChatResponse["recommendation"],
      learningPath: item.learningPath as ChatResponse["learningPath"],
    };
    return NextResponse.json(data);
  }

  return NextResponse.json(item as unknown as ChatResponse);
}
