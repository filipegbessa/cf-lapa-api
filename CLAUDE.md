# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install              # Install dependencies
npm run db:migrate       # Run Prisma migrations
npm run start:dev        # Start dev server (http://localhost:3333)
npm test                 # Run tests
npm run lint             # Lint and fix code
npm run format           # Format code with Prettier
```

## Project Overview

**CF Lapa API** is a NestJS backend for managing CrossFit workouts. It provides REST endpoints for:
- **Workouts**: Create, read, update, delete workout sessions with structured blocks (warmup, skill, WOD)
- **Movements**: Manage exercise movements with search and filtering
- **Analytics**: Dashboard with workout statistics and movement usage trends
- **Auth**: JWT + Google OAuth (in progress)

Stack: **NestJS 11** + **Prisma 5** + **PostgreSQL** + **Jest**

## Architecture

### Module Structure

The app uses NestJS's modular architecture with feature modules:

```
src/
├── main.ts                 # Entry point, CORS + validation config
├── app.module.ts           # Root module importing all features
├── prisma/                 # Database service (singleton)
├── auth/                   # JWT + Google OAuth (guards, strategies, decorators)
├── users/                  # User management (role-based: ADMIN, COLLABORATOR)
├── workouts/               # Workout CRUD with date-based filtering
├── movements/              # Movement CRUD with search + date-based lookup
└── analytics/              # Dashboard aggregations (top movements, workout types, etc.)
```

**Key pattern**: Each feature module (e.g., `workouts.module.ts`) imports `PrismaModule` and declares its controller + service. Controllers handle HTTP, services handle business logic and Prisma calls.

### Data Model (Prisma)

Three main entities:

1. **Workout**: Represents a single training session
   - `date`, `title`, `notes`, `authorId`
   - Three block types: `warmup`, `skill`, `wod` (each with type: AMRAP, EMOM, FOR_TIME, TABATA)
   - Indexed by `date` and `authorId` for fast lookups

2. **Block**: A single exercise within a workout section
   - Links to one `Movement` (optional)
   - Stores reps, sets, duration, order
   - `workoutDate` is a `@db.Date` for efficient date-based queries
   - Cascades delete when workout is deleted

3. **Movement**: Exercise template (e.g., "Deadlift", "Thruster")
   - `name` (unique), `abbreviation`, `description`
   - Referenced by blocks; `onDelete: SetNull` if movement is deleted

**User** model (auth in progress): roles (ADMIN, COLLABORATOR), status (ACTIVE, INACTIVE, BLOCKED).

### Global Configuration

- **CORS**: Configurable via `FRONTEND_URL` env var (default: `http://localhost:3000`)
- **Validation**: Global `ValidationPipe` with `whitelist: true, transform: true` (strips unknown fields, auto-converts types)
- **API Prefix**: All routes prefixed with `/api` (e.g., `GET /api/workouts`)
- **Rate Limiting**: Throttler module (10 requests/60s global)

## Development Workflow

### Running the Server

```bash
npm run start:dev         # Watch mode for active development
npm run start:debug       # Debug mode with inspector
npm start                 # Production build + run
```

Server listens on `process.env.PORT || 3333`.

### Database

```bash
docker-compose up -d              # Start PostgreSQL (if using local db)
npm run db:migrate                # Run pending Prisma migrations
npm run db:seed                   # Seed with initial data (see prisma/seed.ts)
npm run db:studio                 # Open Prisma Studio GUI
npm run db:down                   # Stop Docker services
```

**Environment**: `DATABASE_URL` should point to PostgreSQL (e.g., `postgresql://user:pass@localhost:5432/cf-lapa`).

### Code Quality

```bash
npm run lint              # ESLint (TypeScript strict mode, Prettier rules enforced)
npm run format            # Prettier write (single quotes, trailing commas)
npm run build             # Compile to dist/ (tsconfig targets ES2023)
```

**Linting Rules**:
- `@typescript-eslint/no-explicit-any`: off (allowed for flexibility)
- `@typescript-eslint/no-floating-promises`: warn (catch async/await issues)
- `@typescript-eslint/no-unsafe-argument`: warn (catch type issues)
- Prettier enforced with `endOfLine: auto`

## Testing

```bash
npm test                  # Run all unit tests (*.spec.ts, rootDir: src/)
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report (output: coverage/)
npm run test:debug        # Debug tests with Node inspector
npm run test:e2e          # E2E tests (jest config: test/jest-e2e.json)
```

Test files collocate with source (e.g., `workouts.service.spec.ts` next to `workouts.service.ts`). Jest uses `ts-jest` transformer.

## Common Tasks

### Add a New Endpoint

1. Create DTO in `src/feature/dto/` for request validation
2. Add method to `feature.service.ts` (business logic + Prisma)
3. Add `@Get/@Post/@Patch/@Delete` method to `feature.controller.ts`
4. Use `@UseGuards(JwtAuthGuard)` if auth is required

Example:
```typescript
// controller
@Post('bulk')
@UseGuards(JwtAuthGuard)
createBulk(@Body() dtos: CreateWorkoutDto[]) {
  return this.service.createBulk(dtos);
}
```

### Query Data with Filters

Use DTOs with optional fields for pagination/search:
```typescript
// FindWorkoutsDto example
@IsOptional()
@IsDateString()
startDate?: string;

@IsOptional()
@Min(1)
take?: number; // limit

@IsOptional()
@Min(0)
skip?: number; // offset
```

Service receives the DTO and filters in Prisma:
```typescript
findAll(query: FindWorkoutsDto) {
  return this.prisma.workout.findMany({
    where: {
      date: { gte: new Date(query.startDate) },
    },
    take: query.take,
    skip: query.skip,
    orderBy: { date: 'desc' },
  });
}
```

### Modify the Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` and name the migration (e.g., `add_field_to_workout`)
3. Migration file auto-generates in `prisma/migrations/`

### Seed Database

Edit `prisma/seed.ts` to add sample data, then run:
```bash
npm run db:seed
```

## Key Files and Patterns

- **app.module.ts**: Import all feature modules here
- **main.ts**: Global middleware, CORS, validation setup
- **prisma/prisma.service.ts**: Singleton DB client (injected via PrismaModule)
- **{feature}.module.ts**: Declares controller, service, imports PrismaModule
- **{feature}.controller.ts**: HTTP handlers, DTOs, guards
- **{feature}.service.ts**: Business logic, Prisma queries
- **dto/**: Input validation (class-validator decorators)

## Environment Variables

Required:
```
DATABASE_URL=postgresql://user:password@localhost:5432/cf-lapa
PORT=3333
NODE_ENV=development|production
```

Optional:
```
FRONTEND_URL=http://localhost:3000  # CORS origin
```

## Status and Next Steps

**✅ Implemented**:
- CRUD for Workouts and Movements
- Pagination, filtering, sorting
- Analytics dashboard (top movements, workout types, oldest movements)

**🔄 In Progress**:
- JWT authentication guards
- Google OAuth integration
- Role-based access control (ADMIN vs COLLABORATOR)

When implementing auth, ensure:
- Guards check `x-user-id` header (temporary) or JWT token
- Services enforce role checks via `RolesGuard`
- Public endpoints don't use `@UseGuards(JwtAuthGuard)`
