# CLAUDE.md

## O que é este projeto

Plataforma web interna que guia colaboradores a usar IA no trabalho. O usuário responde perguntas rápidas (onboarding), conversa com agentes de IA especializados via chat, e recebe recomendações de ferramentas com guia de aprendizado. Sem autenticação — acesso direto.

Os agentes rodam no **n8n** via webhooks. O frontend é só interface + controle de estado. Toda lógica de IA, histórico de conversa e persistência de contexto está no n8n + Supabase (Postgres).

**Status: MVP funcional** — onboarding, Agente 1, Agente 2, cards de recomendação e Agente 3 (trilha de aprendizado) prontos.

## Stack

- **Next.js 16+** (App Router), **TypeScript** strict, **Tailwind CSS v4**, **Framer Motion**
- **React 19**
- **n8n** como orquestrador dos agentes (webhooks)
- **Supabase** (Postgres) para histórico de chat e contexto entre agentes
- Deploy na **Vercel**

## Estrutura de arquivos

```
src/
├── app/
│   ├── api/chat/
│   │   ├── route.ts            # Proxy para webhooks do n8n (mapeia fase → webhook)
│   │   └── init/route.ts       # Envia dados do onboarding pro n8n (best-effort)
│   ├── chat/page.tsx            # Página do chat (gerencia sessão + inicializa agentes)
│   ├── onboarding/page.tsx      # Página do onboarding
│   ├── page.tsx                 # Landing — redireciona pra /onboarding
│   ├── layout.tsx               # Layout raiz (fonte, metadata)
│   └── globals.css              # CSS global (variáveis, dark mode, animações)
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx    # Container principal: header, mensagens, input, cards
│   │   ├── ChatInput.tsx        # Textarea com auto-resize, Enter pra enviar, auto-focus
│   │   ├── MessageBubble.tsx    # Bolha de mensagem (user/assistant com estilos distintos)
│   │   ├── ToolRecommendationCards.tsx  # Cards de ferramentas com seleção pra trilha
│   │   ├── LearningPathView.tsx # Trilha de aprendizado personalizada (Agente 3)
│   │   └── TypingIndicator.tsx  # Indicador de "digitando..." com dots animados
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx   # Orquestra as etapas do onboarding
│   │   ├── WelcomeScreen.tsx    # Tela inicial com CTA
│   │   ├── OptionButton.tsx     # Botão com emoji + label (reusável)
│   │   ├── MultiSelect.tsx      # Grid de ferramentas com seleção múltipla
│   │   ├── QuestionCard.tsx     # Wrapper de pergunta com animação de página
│   │   ├── ProgressIndicator.tsx # Barra de progresso linear
│   │   └── TransitionScreen.tsx # Tela de loading entre onboarding e chat
│   └── ui/
│       ├── Button.tsx           # Botão genérico (primary, secondary, ghost)
│       └── Card.tsx             # Card genérico (default, elevated, glass)
├── hooks/
│   ├── useOnboarding.ts         # Reducer pro fluxo de onboarding (etapas, dados, progresso)
│   └── useChat.ts               # Estado do chat (mensagens, fase, outputs dos agentes)
└── lib/
    ├── types.ts                 # Tipos centrais do sistema
    └── tracking.ts              # Eventos de tracking (console por enquanto)
```

## Fluxo completo do usuário

```
1. Landing (/)
   └─▶ Redireciona pra /onboarding

2. Onboarding (/onboarding)
   ├── Welcome → Nível de uso de IA → Ferramentas que usa (condicional) → Intenção
   ├── Dados salvos em sessionStorage como OnboardingData
   └── Transição animada → /chat

3. Chat (/chat)
   ├── Agente 1 (understanding) — conversa pra entender o problema
   │   ├── Auto-dispara primeira mensagem (agente inicia falando)
   │   ├── Conversa livre até o agente ter confiança
   │   └── Finaliza com analysisOutput → transição automática
   │
   ├── Agente 2 (recommendation) — recomenda ferramentas
   │   ├── Auto-dispara primeira mensagem com contexto do Agente 1
   │   ├── Pode conversar ou finalizar direto
   │   └── Finaliza com recommendation → transição pra learning
   │
   ├── Cards de recomendação (learning — seleção)
   │   ├── Botões com emoji das ferramentas (topPick com badge ⭐)
   │   ├── Clique expande guia: reason, useCase, howToStart, badges, recursos
   │   └── Usuário seleciona ferramentas → dispara Agente 3
   │
   └── Agente 3 (learning — trilha)
       ├── Recebe ferramentas escolhidas + contexto dos agentes anteriores
       ├── Retorna trilha personalizada com steps, recursos e links
       └── LearningPathView renderiza trilhas com separador "ou" entre opções
```

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

A API route (`/api/chat`) funciona como proxy:
- Mapeia `currentPhase` → URL do webhook via `WEBHOOK_MAP`
- Normaliza respostas do n8n (array → objeto, `can_go` → `phase_complete`)
- O frontend nunca chama o n8n diretamente

## Fases do sistema

| Fase | Status | Descrição | Webhook |
|------|--------|-----------|---------|
| `onboarding` | ✅ | Perguntas de filtragem (sem agente) | nenhum |
| `understanding` | ✅ | Agente 1 — compreensão do problema | `N8N_WEBHOOK_AGENT1` |
| `recommendation` | ✅ | Agente 2 — recomendação de ferramentas | `N8N_WEBHOOK_AGENT2` |
| `learning` | ✅ | Cards de seleção + Agente 3 (trilha de aprendizado) | `N8N_WEBHOOK_AGENT3` |
| `escalation` | futuro | Direcionamento pro time de RPA | — |
| `resolved` | futuro | Fluxo encerrado | — |

## Agentes

### Agente 1 — Compreensão (`understanding`)

**Objetivo:** Entender o problema do usuário através de conversa.

**Fluxo no n8n:**
```
Webhook POST → AI Agent (conversa) → Code Node (detecta [ANALYSIS_COMPLETE]) → Respond
```

**Request:** `{ session_id, message, isFirstMessage? }`

**Response (conversa):** `{ status: "continue", message, phase: "understanding" }`

**Response (finalização):** via `can_go` que a API normaliza para:
```json
{
  "status": "phase_complete",
  "message": "mensagem de transição",
  "phase": "understanding",
  "nextPhase": "recommendation",
  "analysisOutput": {
    "problemSummary": "string",
    "category": "string",
    "currentProcess": "string",
    "painPoints": ["string"],
    "desiredOutcome": "string",
    "userTechLevel": "string",
    "toolsAlreadyUsed": ["string"],
    "confidence": "string",
    "turnCount": 0,
    "skipSuggestion": "string"
  }
}
```

### Agente 2 — Recomendação (`recommendation`)

**Objetivo:** Recomendar ferramentas com base no output do Agente 1.

**Fluxo no n8n:**
```
Webhook POST → Postgres (busca agent1_output) → AI Agent → Code Node (detecta [RECOMMENDATION_COMPLETE]) → Respond
```

**Request:** `{ session_id, message, isFirstMessage? }`

**Response (conversa):** `{ status: "continue", message, phase: "recommendation" }`

**Response (finalização):**
```json
{
  "status": "phase_complete",
  "message": "mensagem curta de transição",
  "phase": "recommendation",
  "nextPhase": "learning",
  "recommendation": {
    "topPick": "nome da ferramenta principal",
    "summary": "frase curta do porquê",
    "tools": [
      {
        "name": "Nome da Ferramenta",
        "category": "automação | escrita | análise | design | comunicação | código",
        "reason": "explicação personalizada pro problema do usuário",
        "useCase": "exemplo concreto baseado no que disse no Agente 1",
        "howToStart": "passo concreto pra começar",
        "effort": "low | medium | high",
        "effortLabel": "label em PT-BR",
        "cost": "free | freemium | paid",
        "costLabel": "label em PT-BR com valor",
        "link": "https://ferramenta.com"
      }
    ],
    "chosenTool": "string | null"
  }
}
```

**Regras do Agente 2:**
- `message` deve ser curta (1-2 frases) — os dados ricos ficam no `recommendation`
- Mínimo 2 ferramentas, máximo 3
- `reason` e `useCase` devem citar dados específicos do `agent1_output`
- Cruzar com `current_tools` — se o usuário já usa a ferramenta, reconhecer isso
- `nextPhase` deve ser `"learning"` (não "teaching")

### Agente 3 — Trilha de Aprendizado (`learning`)

**Objetivo:** Montar trilha personalizada de aprendizado para as ferramentas que o usuário escolheu.

**Fluxo no n8n:**
```
Webhook POST → Postgres (busca contexto dos agentes anteriores) → AI Agent → Respond
```

**Request:** `{ session_id, message: "", isFirstMessage: true, chosenTools: ["Ferramenta A", "Ferramenta B"] }`

**Response:**
```json
{
  "status": "continue",
  "message": "mensagem do agente",
  "phase": "learning",
  "learningPath": {
    "overallMessage": "mensagem geral de contexto",
    "tools": [
      {
        "toolName": "Nome da Ferramenta",
        "difficulty": "beginner | intermediate",
        "estimatedTime": "ex: 2-3 horas",
        "steps": [
          {
            "order": 1,
            "title": "título do passo",
            "description": "descrição do que fazer",
            "resourceUrl": "https://...",
            "resourceType": "video | article | docs | interactive",
            "resourceLabel": "texto do link"
          }
        ]
      }
    ]
  }
}
```

**Frontend:**
- `ToolRecommendationCards` mostra os cards do Agente 2 e permite seleção
- `sendToolChoices()` no hook `useChat` envia as ferramentas escolhidas
- `LearningPathView` renderiza as trilhas com timeline vertical, badges de dificuldade, separador "ou" entre trilhas independentes

## Hook `useChat` — lógica de transição

O hook `useChat` gerencia todo o fluxo multi-agente:

1. **Fase muda automaticamente** quando recebe `status: "phase_complete"` + `nextPhase`
2. **Auto-trigger:** ao transicionar para `recommendation`, dispara primeira chamada com `isFirstMessage: true`
3. **Sem auto-trigger para `learning`** — os cards de seleção assumem a interface
4. **`sendToolChoices()`:** usuário seleciona ferramentas nos cards → dispara Agente 3 com `chosenTools`
5. **Outputs salvos em `agentOutputs`:** `analysisOutput` (Agente 1), `recommendation` (Agente 2) e `learningPath` (Agente 3)
6. **Sub-estados da fase `learning`:** seleção de ferramentas → loading (Agente 3) → trilha pronta

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

## Variáveis de ambiente

```env
N8N_WEBHOOK_INIT=https://n8n.gocase.com.br/webhook/receber_dados
N8N_WEBHOOK_AGENT1=https://n8n.gocase.com.br/webhook/agent-understanding
N8N_WEBHOOK_AGENT2=https://n8n.gocase.com.br/webhook/agent-recommendation
N8N_WEBHOOK_AGENT3=https://n8n.gocase.com.br/webhook/agent-learning
```

Nota: são server-side only (sem `NEXT_PUBLIC_`) — o frontend chama `/api/chat` que faz o proxy.

## Tipos centrais (`src/lib/types.ts`)

```typescript
type AgentPhase = "onboarding" | "understanding" | "recommendation" | "learning" | "escalation" | "resolved";

interface RecommendedTool {
  name: string; category: string; reason: string; useCase: string;
  howToStart: string; effort: "low" | "medium" | "high"; effortLabel: string;
  cost: "free" | "freemium" | "paid"; costLabel: string; link: string;
}

interface Recommendation {
  topPick: string; summary: string; tools: RecommendedTool[]; chosenTool: string | null;
}

interface AnalysisOutput {
  problemSummary: string; category: string; currentProcess: string;
  painPoints: string[]; desiredOutcome: string; userTechLevel: string;
  toolsAlreadyUsed: string[]; confidence: string; turnCount: number;
  skipSuggestion: string;
}

interface LearningStep {
  order: number; title: string; description: string;
  resourceUrl?: string; resourceType?: "video" | "article" | "docs" | "interactive";
  resourceLabel?: string;
}

interface ToolLearningPlan {
  toolName: string; steps: LearningStep[]; estimatedTime: string;
  difficulty: "beginner" | "intermediate";
}

interface LearningPath {
  tools: ToolLearningPlan[]; overallMessage: string;
}
```

## O que falta pro produto completo

- [ ] Fase `escalation` — direcionamento ao time de RPA
- [ ] Fase `resolved` — encerramento do fluxo
- [ ] Tracking real (hoje é console.log) — enviar eventos pro banco
- [ ] Remover erro pre-existente de `login/page` no TypeScript

## Regras de código

- TypeScript strict, sem `any`
- Componentes funcionais com hooks
- Variáveis e funções em inglês, textos da UI em português brasileiro
- Imports absolutos com `@/`
- Loading states em toda operação assíncrona
- Transições suaves entre estados (Framer Motion)
- Mobile-first, botões grandes e tappable
- Mensagens de erro amigáveis, nunca técnicas
- **Nunca usar unicode escapes** (`\u00E1`, `\u00E3`, `\u00EA`, etc.) em strings visíveis ao usuário — sempre escrever os caracteres reais diretamente (`á`, `ã`, `ê`, `ç`, `ó`, emojis, etc.). Escapes aparecem como texto quebrado na UI.

## Tom da UI

A plataforma fala com qualquer pessoa da empresa. Tom de colega prestativo.

- ✅ "Bora descobrir como IA pode facilitar seu dia?"
- ✅ "Sem julgamentos — todo mundo começa de algum lugar."
- ❌ "Selecione seu nível de maturidade em inteligência artificial."
- ❌ "Preencha o formulário abaixo para prosseguir."
