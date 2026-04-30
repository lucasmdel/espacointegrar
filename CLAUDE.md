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

## Como adicionar um novo instrumento (ex: PHQ-9)

Siga estes 4 passos:

### 1. Criar o arquivo de perguntas em `src/lib/phq.ts`

```typescript
export const PHQ_QUESTIONS = [
  'Pouco interesse ou prazer em fazer as coisas?',
  'Se sentir para baixo, deprimido(a) ou sem perspectiva?',
  // ... 9 perguntas no total
]

export const PHQ_CUTOFF = 10  // ponto de corte clínico
```

### 2. Ativar o card em `src/app/(dashboard)/aplicar/page.tsx`

Encontre o card do PHQ-9 (está com `className="instrumento-card locked"`) e:
- Remova a classe `locked`
- Troque `onClick` para `() => router.push('/aplicar/phq')`
- Mude o badge de `badge-soon` para `badge-ativo` e o texto para `Disponível`

### 3. Criar a página do formulário em `src/app/(dashboard)/aplicar/phq/page.tsx`

Copie o arquivo `src/app/(dashboard)/aplicar/srq/page.tsx` como base e adapte:
- Importe `PHQ_QUESTIONS` e `PHQ_CUTOFF` de `@/lib/phq`
- Ajuste o número de questões (9 em vez de 20)
- Ajuste a paginação (ex: 3 por página em vez de 5)
- Mude `instrumento: 'SRQ-20'` para `instrumento: 'PHQ-9'` no insert do Supabase
- Adapte a lógica de score (PHQ usa escala 0–3 por questão, não sim/não)

### 4. Atualizar a métrica de instrumentos ativos no dashboard

Em `src/app/(dashboard)/dashboard/page.tsx`, mude o valor fixo `1` para `2` no card "Instrumentos ativos".

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
