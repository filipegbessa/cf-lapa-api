# CF Lapa API

Backend para gestão de treinos da Crossfit Lapa. API NestJS + Prisma + PostgreSQL.

## Pré-requisitos

- Node.js 18+
- PostgreSQL 13+ (ou Supabase)
- npm

## Setup

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

API roda em `http://localhost:3333`

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cf-lapa
PORT=3333
NODE_ENV=development
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Rodar em desenvolvimento (watch mode) |
| `npm start` | Rodar em produção |
| `npm run build` | Compilar para produção |
| `npm run db:migrate` | Executar migrations do Prisma |
| `npm run db:seed` | Seedar BD com dados iniciais |
| `npm run test` | Rodar testes |
| `npm run test:e2e` | Rodar testes E2E |

## Estrutura do Projeto

```
cf-lapa-api/
├── src/
│   ├── app.module.ts       # Root module
│   ├── main.ts             # Entry point
│   ├── workouts/
│   │   ├── workouts.controller.ts
│   │   ├── workouts.service.ts
│   │   └── dto/
│   └── movements/
│       ├── movements.controller.ts
│       ├── movements.service.ts
│       └── dto/
├── prisma/
│   └── schema.prisma       # Data model
├── test/
│   └── app.e2e-spec.ts
└── package.json
```

## API Endpoints

Ver documentação completa em `/docs/api.md` no repositório raiz.

**Workouts:**
- `GET /workouts` — Lista treinos com filtros por data, paginação e ordenação
- `GET /workouts/:id` — Obtém detalhes de um treino
- `POST /workouts` — Cria novo treino
- `PATCH /workouts/:id` — Atualiza um treino
- `DELETE /workouts/:id` — Remove um treino

**Movements:**
- `GET /movements` — Lista movimentos com busca, paginação e ordenação
- `GET /movements/by-date` — Lista movimentos usados em treinos de um período
- `GET /movements/:id` — Obtém detalhes de um movimento
- `POST /movements` — Cria novo movimento
- `PATCH /movements/:id` — Atualiza um movimento
- `DELETE /movements/:id` — Remove um movimento

**Analytics:**
- `GET /analytics/week` — Treinos da semana corrente (seg-dom)
- `GET /analytics/top-movements` — Top 10 movimentos mais usados
- `GET /analytics/top-workout-types` — Top 10 tipos de treino
- `GET /analytics/oldest-movements` — Top 10 movimentos mais antigos
- `GET /analytics/dashboard` — Dashboard completo (todos os dados acima)

## Status de Implementação

**✅ Implementado:**
- CRUD de treinos (Workout)
- CRUD de movimentos (Movement)
- Busca de movimentos por query com paginação
- Busca de movimentos por data com paginação
- Busca de treinos por período (data, startDate, endDate) com ordenação e paginação
- Analytics Dashboard:
  - Treinos da semana corrente
  - Top 10 movimentos mais usados
  - Top 10 tipos de treino (AMRAP, EMOM, FOR_TIME, TABATA)
  - Top 10 movimentos mais antigos (não usados há mais tempo)

**🔄 Em desenvolvimento:**
- Autenticação JWT + Google OAuth
- Sistema de permissões
- Templates de treino
- Rastreamento de execução
- Compartilhamento público

## Autores

Desenvolvido para a Crossfit Lapa (Rio de Janeiro)
