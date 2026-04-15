import { NextResponse } from "next/server";

interface InitPayload {
  session_id: string;
  ai_usage_level: string;
  current_tools: string[];
  custom_tools: string;
  intent: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as InitPayload;

  const webhookUrl = process.env.N8N_WEBHOOK_INIT;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Webhook de inicialização não configurado" },
      { status: 500 },
    );
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Falha ao enviar dados iniciais pro n8n:", err);
  }

  // Sempre retorna ok — o init é best-effort, não deve bloquear o chat
  return NextResponse.json({ ok: true });
}
