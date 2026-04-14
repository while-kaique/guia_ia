# CLAUDE.md

## O que é este projeto

Plataforma web interna que guia colaboradores a usar IA no trabalho. O usuário responde perguntas rápidas (onboarding), conversa com agentes de IA especializados via chat, e recebe recomendações de ferramentas e trilhas de aprendizado. Sem autenticação — acesso direto.

Os agentes rodam no **n8n** via webhooks. O frontend é só interface + controle de estado. Toda lógica de IA, histórico de conversa e persistência de contexto está no n8n + Supabase (Postgres).

## Stack

- Next.js 16+ (App Router), TypeScript strict, Tailwind CSS v4, Framer Motion
- n8n como orquestrador dos agentes (webhooks)
- Supabase (Postgres) para histórico de chat e contexto entre agentes
- Deploy na Vercel

## Arquitetura de comunicação

```
Frontend ──POST──▶ /api/chat ──POST──▶ n8n webhook do agente ativo
                                              │
                                              ├── Busca contexto no Postgres (session_context)
                                              ├── Busca histórico de chat no Postgres (tabela por agente)
                                              ├── Processa com modelo de IA
                                              ├── Salva histórico
                                              └── Retorna JSON padronizado
                                              │
Frontend ◀──JSON──────────────────────────────┘
```

O frontend controla qual webhook chamar com base no `currentPhase`. Quando um agente finaliza, o n8n:
1. Salva o output estruturado na tabela `session_context`
2. Retorna `status: "phase_complete"` com o `nextPhase`
3. O frontend troca o webhook e continua no mesmo chat

## Fases do sistema

| Fase | Descrição | Webhook |
|------|-----------|---------|
| `onboarding` | Perguntas de filtragem (sem agente) | nenhum |
| `understanding` | Agente 1 — compreensão do problema | `/webhook/agent-understanding` |
| `recommendation` | Agente 2 — recomendação de ferramentas | `/webhook/agent-recommendation` |
| `learning` | Agente 3 — trilha de aprendizado | futuro |
| `escalation` | Direcionamento pro time de RPA | futuro |
| `resolved` | Fluxo encerrado | nenhum |

## Banco de dados — tabela central

```sql
CREATE TABLE session_context (
  session_id        TEXT PRIMARY KEY,
  user_email        TEXT,
  ai_usage_level    TEXT,            -- low | occasional | high
  current_tools     TEXT[],
  custom_tools      TEXT,
  intent            TEXT,            -- automate | explore | stuck
  agent1_output     JSONB,           -- output estruturado do Agente 1
  agent2_output     JSONB,           -- output estruturado do Agente 2
  agent3_output     JSONB,
  current_phase     TEXT DEFAULT 'onboarding',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);
```

Cada agente tem sua própria tabela de histórico de chat no Postgres (gerenciada pelo nó Memory do n8n). O `session_context` guarda apenas os outputs estruturados — nunca o histórico de mensagens.

## O que já está pronto

### Onboarding (✅ completo)
- Fluxo de 3 perguntas: nível de uso de IA → ferramentas que já usa (condicional) → intenção
- Dados salvos em `sessionStorage` como `OnboardingData`
- Componentes em `src/components/onboarding/`
- Hook `useOnboarding` com `useReducer`

### Agente 1 — Compreensão (✅ funcional no n8n)
- Webhook recebe `{ session_id, message, ai_usage_level, current_tools, custom_tools, intent }`
- Conversa até entender o problema, finaliza com marcador `[ANALYSIS_COMPLETE]` + JSON
- Nó de código normaliza o JSON e garante estrutura fixa
- Retorna `{ status, message, phase }` ou `{ status, message, phase, nextPhase, analysisOutput }`

### Chat no frontend (✅ funcional para Agente 1)
- Interface de chat conectada ao webhook do Agente 1 via `/api/chat`
- Componentes em `src/components/chat/`

## O que precisa ser implementado agora

### Agente 2 — Recomendação (frontend + conexão)

O workflow do Agente 2 já existe no n8n. Ele segue a mesma estrutura do Agente 1, mas busca o `agent1_output` da tabela `session_context` no início.

**Fluxo no n8n do Agente 2:**
```
Webhook (POST /agent-recommendation)
    │
    ▼
Postgres: SELECT agent1_output, ai_usage_level, current_tools, intent
          FROM session_context WHERE session_id = $1
    │
    ▼
AI Agent (system prompt injeta os dados do SELECT)
    ├── Model: GPT-4.1-mini
    └── Memory: Postgres (tabela separada, session key = session_id)
    │
    ▼
Code Node (detecta [RECOMMENDATION_COMPLETE] ou não)
    │
    ▼
Respond to Webhook
```

**O que o frontend precisa fazer:**

1. Quando receber `status: "phase_complete"` do Agente 1, atualizar `currentPhase` para `"recommendation"`
2. Trocar a URL de webhook para o do Agente 2
3. Disparar automaticamente uma primeira chamada com `message: ""` e `isFirstMessage: true` para que o Agente 2 inicie falando
4. Nas chamadas seguintes, enviar apenas `{ session_id, message }`
5. O chat visual continua no mesmo componente — o usuário não percebe a troca

**Contrato de request/response do Agente 2:**

Request (primeira chamada):
```json
{
  "session_id": "uuid",
  "message": "",
  "isFirstMessage": true
}
```

Request (chamadas seguintes):
```json
{
  "session_id": "uuid",
  "message": "texto do usuário"
}
```

Response (conversa continua):
```json
{
  "status": "continue",
  "message": "resposta do agente",
  "phase": "recommendation"
}
```

Response (agente finalizou):
```json
{
  "status": "phase_complete",
  "message": "mensagem de transição",
  "phase": "recommendation",
  "nextPhase": "learning",
  "recommendationOutput": {
    "recommendedTools": [
      {
        "name": "nome da ferramenta",
        "reason": "por que é boa pra esse caso",
        "effort": "low | medium | high",
        "cost": "free | freemium | paid"
      }
    ],
    "chosenTool": "ferramenta que o usuário escolheu ou aceitou"
  }
}
```

**Alterações necessárias no frontend:**

O hook de chat (`useChat` ou equivalente) precisa:
- Manter `currentPhase` no estado
- Mapear fase → URL do webhook via config:
  ```typescript
  const WEBHOOK_MAP: Record<string, string> = {
    understanding: process.env.NEXT_PUBLIC_N8N_WEBHOOK_AGENT1!,
    recommendation: process.env.NEXT_PUBLIC_N8N_WEBHOOK_AGENT2!,
  };
  ```
- Detectar `status: "phase_complete"` e executar a troca automaticamente
- Na transição: adicionar a mensagem do agente ao chat, atualizar `currentPhase`, disparar primeira chamada do próximo webhook com `isFirstMessage: true`
- Guardar `analysisOutput` / `recommendationOutput` no estado

O componente de chat NÃO muda visualmente. A troca de agente é invisível para o usuário.

**Variáveis de ambiente a adicionar:**
```
NEXT_PUBLIC_N8N_WEBHOOK_AGENT1=https://seu-n8n.com/webhook/agent-understanding
NEXT_PUBLIC_N8N_WEBHOOK_AGENT2=https://seu-n8n.com/webhook/agent-recommendation
```

## Regras de código

- TypeScript strict, sem `any`
- Componentes funcionais com hooks
- Variáveis e funções em inglês, textos da UI em português brasileiro
- Imports absolutos com `@/`
- Loading states em toda operação assíncrona
- Transições suaves entre estados (Framer Motion)
- Mobile-first, botões grandes e tappable
- Mensagens de erro amigáveis, nunca técnicas

## Tom da UI

A plataforma fala com qualquer pessoa da empresa. Tom de colega prestativo.

- ✅ "Bora descobrir como IA pode facilitar seu dia?"
- ✅ "Sem julgamentos — todo mundo começa de algum lugar."
- ❌ "Selecione seu nível de maturidade em inteligência artificial."
- ❌ "Preencha o formulário abaixo para prosseguir."