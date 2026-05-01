# Espaço Integrar — Monitoramento de Alvo

Sistema para psicólogos aplicarem instrumentos de rastreio em pacientes e acompanharem a evolução ao longo do tempo.

## Stack

- **Next.js 14** (App Router, TypeScript) — framework React para o frontend e rotas
- **Supabase** — banco de dados PostgreSQL + autenticação de usuários
- **CSS puro** — estilos em `src/app/globals.css` com variáveis CSS (sem Tailwind)

## Como rodar localmente

```bash
npm install
npm run dev   # abre em http://localhost:3000
```

Requer o arquivo `.env.local` com as chaves do Supabase (peça ao colega de equipe):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
```

## Estrutura de pastas

```
src/
├── app/
│   ├── login/              → página de login e cadastro
│   ├── (dashboard)/        → todas as telas autenticadas
│   │   ├── layout.tsx      → sidebar + topbar (renderizada em todas as telas)
│   │   ├── dashboard/      → tela inicial com métricas
│   │   ├── pacientes/      → cadastro e listagem de pacientes
│   │   ├── aplicar/        → seleção de instrumento
│   │   │   └── srq/        → formulário do SRQ-20
│   │   ├── historico/      → histórico de aplicações
│   │   └── resultado/[id]/ → resultado após aplicação
│   ├── globals.css         → todo o CSS do projeto
│   └── layout.tsx          → HTML raiz + fontes
├── lib/
│   ├── supabase.ts         → cliente Supabase (browser)
│   └── srq.ts              → perguntas e ponto de corte do SRQ-20
├── middleware.ts            → protege rotas: redireciona para /login se não autenticado
└── types/index.ts           → tipos TypeScript: Profile, Paciente, Aplicacao
supabase/
└── schema.sql              → schema completo do banco (rodar no SQL Editor do Supabase)
```

## Banco de dados (Supabase)

Três tabelas principais, todas com Row Level Security (cada psicólogo vê apenas seus dados):

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do psicólogo (nome, CRP) — criado automaticamente no cadastro |
| `pacientes` | Pacientes cadastrados por cada psicólogo |
| `aplicacoes` | Cada aplicação de instrumento (score, respostas, data) |

## Como adicionar um novo instrumento (ex: GAD-7)

Siga estes 4 passos:

**Instrumentos já implementados:** SRQ-20 (`src/lib/srq.ts`) e PHQ-9 (`src/lib/phq.ts`).

### 1. Criar o arquivo de perguntas em `src/lib/gad.ts`

```typescript
export const GAD_QUESTIONS = [
  'Sentir-se nervoso(a), ansioso(a) ou no limite',
  // ... 7 perguntas no total
]
// mesma escala do PHQ-9: 0 = Nenhuma vez … 3 = Quase todos os dias
export const GAD_CUTOFF = 10
```

### 2. Ativar o card em `src/app/(dashboard)/aplicar/page.tsx`

Encontre o card do GAD-7 (está com `className="instrumento-card locked"`) e:
- Remova a classe `locked`
- Troque `onClick` para `() => router.push('/aplicar/gad')`
- Mude o badge de `badge-soon` para `badge-ativo`

### 3. Criar a página do formulário em `src/app/(dashboard)/aplicar/gad/page.tsx`

Copie `src/app/(dashboard)/aplicar/phq/page.tsx` como base e adapte:
- Importe de `@/lib/gad`
- Ajuste o número de questões (7)
- Mude `instrumento: 'PHQ-9'` para `instrumento: 'GAD-7'`

### 4. Atualizar resultado e dashboard

- Em `resultado/[id]/page.tsx`, adicione a lógica de severidade do GAD-7
- Em `dashboard/page.tsx`, atualize o contador de instrumentos ativos

## Convenções do projeto

- **Todas as páginas são `'use client'`** — buscam dados diretamente do Supabase no navegador via `useEffect`
- **Autenticação**: o middleware redireciona automaticamente; dentro das páginas, sempre busque o usuário com `supabase.auth.getUser()` antes de qualquer query
- **CSS**: adicione novos estilos em `globals.css` seguindo as variáveis CSS já definidas (`--blue-600`, `--gray-200`, etc.). Não use Tailwind.
- **Tipos**: ao criar novos tipos, adicione em `src/types/index.ts`

## Deploy

O projeto está conectado à Vercel. Qualquer `git push` para a branch `main` atualiza o site automaticamente em ~1 minuto.

```bash
git pull          # sempre puxar antes de começar
# ... alterações com o Claude ...
git add .
git commit -m "descrição do que mudou"
git push
```
