---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/gdd.md'
  - '_bmad-output/game-brief.md'
  - '_bmad-output/epics.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-17'
project_name: 'jessiclaw'
user_name: 'Jack.ark'
date: '2026-03-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
CardWork requires a deterministic gameplay architecture built around a real-world productivity input loop. Core functional areas include: session lifecycle management (intent capture, timer start/stop, 30-minute gate), AI-assisted classification and plausibility checks, card issuance and deck state management, daily mini-battle flow, weekly staged boss flow, Monday reset and epic declaration, and progression/result presentation.

Architecturally, this implies at least the following bounded components:
- Session & Timer subsystem (authoritative session state, timing guarantees, interruption handling)
- Classification subsystem (AI integration + offline/manual fallback)
- Card Generation subsystem (deterministic mapping from work type/duration to card definitions)
- Deck & Progression subsystem (weekly deck cap, starter card issuance, reset logic)
- Combat subsystem (turn loop, hand/discard/deck cycle, enemy behavior, reward outcomes)
- Weekly Orchestration subsystem (calendar cadence, boss lock/unlock, results lifecycle)
- Persistence subsystem (local-first saves, crash-safe writes, migration strategy)
- Notification/reminder subsystem (daily/weekly nudges)

**Non-Functional Requirements:**
Primary NFRs driving architecture:
- Offline-first behavior for core loop
- Startup performance target (<3s) and responsive UI interactions
- Mobile timer accuracy and resilience under backgrounding/OS lifecycle constraints
- Deterministic and auditable game outcomes for trust integrity
- Data privacy for personal session/reflection content
- Stability under app interruption, crash, and restart scenarios
- Maintainability for iterative balancing (cards, enemy tuning, stage difficulty)

These NFRs strongly favor a modular, state-machine-driven architecture with explicit domain boundaries and robust local persistence semantics.

**Scale & Complexity:**
The project is a high-complexity mobile game system due to cross-domain coupling (productivity inputs, AI-assisted classification, deterministic card systems, battle mechanics, and temporal weekly orchestration) under strict offline constraints.

- Primary domain: mobile game application (card/deck RPG systems)
- Complexity level: high
- Estimated architectural components: 8-12 major components/services/modules

### Technical Constraints & Dependencies

Known constraints and dependencies include:
- MVP must function without backend dependency (local-first, no cloud save requirement)
- AI usage must be lightweight and replaceable/fallback-capable (manual tag fallback)
- 30-minute minimum session must be enforced robustly (integrity by design)
- Weekly cadence (Mon-Fri accumulation + weekly boss) must remain deterministic
- Placeholder assets acceptable; architecture must not depend on heavy content pipelines
- Push notifications required for engagement cadence
- Engine/framework selection remains open and must satisfy mobile lifecycle + performance constraints

### Cross-Cutting Concerns Identified

Concerns affecting multiple architectural components:
- Authoritative state modeling (session, deck, battle, weekly progression)
- Time and lifecycle correctness (background/foreground transitions, clock tampering risks)
- Persistence durability and migration (schema versioning and rollback-safe updates)
- Offline/online transition handling for AI-assisted flows
- Performance budgeting on hot paths (battle loop, animation triggers, startup)
- Security/privacy boundaries for user-entered text/voice-derived metadata
- Design-time balance/configuration strategy for cards, enemies, and rewards

## Starter Template Evaluation

### Primary Technology Domain

Mobile app (iOS/Android), based on project requirements analysis and GDD constraints (mobile-first UX, offline-first MVP, push notifications, local persistence, lightweight AI integration).

### Starter Options Considered

1. **Expo (React Native framework)**
   - Current official initialization path:
     - `npx create-expo-app@latest --template default@sdk-55`
   - Strengths:
     - Fastest startup path for mobile product iteration
     - TypeScript-enabled default workflow
     - Strong ecosystem for mobile APIs (notifications, storage, networking)
     - React Native + Expo Router conventions reduce architecture drift
   - Trade-offs:
     - Game-loop rendering complexity requires deliberate performance discipline
     - Native edge cases may require prebuild/eject decisions later

2. **React Native without framework**
   - Current guidance from React Native docs strongly recommends using a framework (Expo) for new projects
   - Strengths:
     - Maximum low-level control from day one
   - Trade-offs:
     - Higher setup and maintenance burden
     - More architectural choices must be made manually early

3. **Flutter (`flutter create`)**
   - Current baseline command remains `flutter create my_app`
   - Strengths:
     - Excellent performance and cohesive UI toolkit
     - Strong animation pipeline
   - Trade-offs:
     - New language/runtime stack (Dart) increases team adoption overhead
     - Less alignment with likely JavaScript/TypeScript-heavy tooling path for this project context

### Selected Starter: Expo (React Native Framework)

**Rationale for Selection:**
Expo provides the best balance for CardWork MVP: rapid iteration, mature mobile capabilities, TypeScript-first developer experience, and enough flexibility for card-battle UX while preserving speed-to-validation. It minimizes early infrastructure burden so architecture effort can focus on load-bearing systems (session integrity, deterministic game state, offline reliability).

**Initialization Command:**

```bash
npx create-expo-app@latest --template default@sdk-55
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript-ready React Native project scaffold with modern Node-based toolchain.

**Styling Solution:**
React Native style system baseline, with clean extension path for design tokens and component theming.

**Build Tooling:**
Expo-managed workflow with Metro tooling; straightforward path to EAS build/deployment when needed.

**Testing Framework:**
Baseline test setup scaffolded by template ecosystem (expandable to unit/integration/e2e strategy per architecture decisions).

**Code Organization:**
Convention-driven project structure with routing/navigation primitives and modular feature expansion path.

**Development Experience:**
Fast local dev cycle, live reload, standardized CLI setup, and strong documentation continuity.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Authoritative local data store: SQLite via `expo-sqlite` (starter-compatible, persisted across restarts)
- Domain boundaries: Session/Timer, Classification, Card Generation, Deck/Weekly Progress, Combat, Orchestration, Persistence
- AI integration pattern: provider adapter boundary with manual-tag fallback when unavailable
- State model: deterministic domain state transitions (event-driven reducers + persistence checkpoints)
- Security/privacy baseline: local-first storage, minimal data retention, secure handling of provider keys/tokens

**Important Decisions (Shape Architecture):**
- API contract for AI calls (strict input/output schema, timeout/retry policy)
- Notification strategy (local + remote reminders through `expo-notifications`, channelized Android setup)
- CI/CD and release flow (EAS Build + EAS Submit path, quality gates in CI)
- Observability strategy (structured logs + lightweight error telemetry abstraction)

**Deferred Decisions (Post-MVP):**
- Full user authentication/account system
- Cloud sync and cross-device reconciliation
- Advanced anti-cheat/pattern-detection infrastructure
- Rich analytics warehouse/event streaming

### Data Architecture

- **Database choice:** SQLite (`expo-sqlite`) as primary app data store
- **Data modeling approach:** Domain-first schema:
  - `sessions`
  - `session_intents`
  - `session_reflections`
  - `cards`
  - `weekly_decks`
  - `battles_daily`
  - `battles_weekly`
  - `epics`
  - `meta_progress`
  - `outbox_ai_requests`
- **Validation strategy:** strict runtime validation at domain boundaries (DTO validation before persistence and before AI-provider calls)
- **Migration approach:** explicit versioned migrations using `PRAGMA user_version`; forward-only migrations for MVP
- **Caching strategy:** in-memory read cache for active week state; SQLite remains source of truth
- **Rationale:** aligns with offline-first and deterministic replay needs while minimizing infra overhead

### Authentication & Security

- **Authentication method (MVP):** no user account auth required for core loop (single-device local profile)
- **Authorization pattern:** module-level capability guards (write paths restricted by domain service APIs)
- **Security middleware:** input sanitization + prepared statements for all SQL writes/queries
- **Data encryption approach:** default local DB for MVP; optional SQLCipher path retained for hardening phase
- **API security strategy:** provider credentials never hardcoded in UI code paths; token access abstracted behind secure config layer
- **Rationale:** preserves MVP speed while protecting personal reflection/session data and reducing accidental leakage risk

### API & Communication Patterns

- **Primary API pattern:** internal client-side service interfaces + external HTTPS provider calls for classification
- **External communication:** adapter pattern (`ClassifierProvider`) with implementations:
  - Remote provider (OpenAI/Gemini/etc.)
  - Offline/manual fallback
- **Error handling standard:** typed result envelopes (`ok | error`, with retriable vs terminal classification)
- **Retry/rate strategy:** bounded retry with jitter for transient failures; immediate fallback to manual tagging on hard failure/offline
- **Inter-service communication:** in-process domain events (session-completed, card-awarded, battle-resolved)
- **Rationale:** decouples game logic from vendor/API volatility and guarantees continuity when network/provider is unavailable

### Frontend Architecture

- **State management approach:** layered state:
  - UI local state for ephemeral screen concerns
  - Domain store for authoritative gameplay state transitions
  - Persistence sync layer for hydration/checkpointing
- **Component architecture:** feature-sliced modules by domain (sessions, cards, battles, weekly-cycle, notifications)
- **Routing strategy:** Expo Router with bounded route groups by feature
- **Performance optimization:** hot-path minimization for battle loop, memoized selectors, animation budget enforcement on low-end devices
- **Bundle optimization:** avoid heavy optional deps in MVP, lazy-load non-critical flows (settings/help/history)
- **Rationale:** keeps battle and timer interactions smooth while containing architectural drift as features expand

### Infrastructure & Deployment

- **Hosting/deployment strategy:** Expo managed workflow with EAS Build and EAS Submit path
- **CI/CD approach:** Git-based pipeline with mandatory checks:
  - typecheck
  - lint
  - unit tests
  - build validation
- **Environment configuration:** typed environment contract (dev/staging/prod), explicit feature flags for AI provider and notifications
- **Monitoring/logging:** structured client logs + error reporting adapter (provider-agnostic)
- **Scaling strategy:** MVP stays client-heavy/local-first; backend introduced later only for sync/social/multiplayer or analytics needs
- **Rationale:** optimizes for fast, reliable mobile iteration without early backend lock-in

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Expo project and enforce architecture folders/contracts
2. Implement SQLite schema + migration engine + repository interfaces
3. Build Session/Timer domain and persistence checkpoints
4. Add classifier adapter boundary + manual fallback flow
5. Implement card generation + deck progression services
6. Implement battle engine with deterministic state transitions
7. Integrate notifications and weekly orchestration
8. Add CI/EAS pipeline and telemetry/error abstraction

**Cross-Component Dependencies:**
- Session completion drives classification, card generation, deck updates, and battle availability
- Weekly orchestration depends on deck/session aggregates and migration-safe persistence
- Notification triggers depend on orchestration state and permission lifecycle
- AI adapter failure behavior directly affects UX continuity and integrity guarantees

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
15 areas where AI agents could make different choices and cause integration conflicts.

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case`, plural nouns (e.g., `weekly_decks`, `session_reflections`)
- Columns: `snake_case` (e.g., `created_at`, `session_id`)
- Primary keys: `id` (INTEGER/TEXT depending on entity strategy)
- Foreign keys: `<referenced_table_singular>_id` (e.g., `session_id`, `epic_id`)
- Indexes: `idx_<table>_<column_list>` (e.g., `idx_sessions_started_at`)
- Migration files: `<version>_<short_description>.sql` (e.g., `003_add_battle_results.sql`)

**API Naming Conventions:**
- Internal service methods: `camelCase` verbs (`classifySession`, `awardCard`, `resolveBattleTurn`)
- External route style (if later backend is introduced): plural resource names (`/sessions`, `/cards`)
- Route params: `:id` style in router declarations
- Query params and JSON payloads in app-facing TypeScript: `camelCase`
- Headers (if needed): standard HTTP casing, custom headers prefixed `X-Cardwork-*`

**Code Naming Conventions:**
- Components: `PascalCase` (`SessionTimerCard.tsx`)
- Hooks: `use*` prefix (`useWeeklyDeck`, `useBattleState`)
- Files:
  - Components: `PascalCase.tsx`
  - Hooks/services/utils: `kebab-case.ts` or existing repo convention (must be consistent once chosen)
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/interfaces: `PascalCase` with domain suffix where helpful (`SessionRecord`, `BattleTurnEvent`)

### Structure Patterns

**Project Organization:**
- Organize by feature domain, not by technical layer first:
  - `features/sessions`
  - `features/cards`
  - `features/battle`
  - `features/weekly-cycle`
  - `features/notifications`
- Each feature contains:
  - `domain/` (entities, value objects, rules)
  - `application/` (use-cases/services)
  - `infrastructure/` (db adapters, provider clients)
  - `ui/` (screens/components/hooks tied to rendering)
- Shared cross-feature code in `shared/` with strict ownership boundaries.

**File Structure Patterns:**
- Tests co-located with units as `*.test.ts` / `*.test.tsx`
- Integration tests under `tests/integration/`
- SQL migrations under `database/migrations/`
- Static assets under `assets/` by feature bucket
- Environment contracts in `config/env/` with typed parser/validator

### Format Patterns

**API Response Formats:**
- All service boundaries return a discriminated union:
  - Success: `{ ok: true, data: T }`
  - Failure: `{ ok: false, error: { code, message, retriable, cause? } }`
- Never throw raw provider errors across domain boundaries.
- Error codes use stable machine names (`CLASSIFIER_TIMEOUT`, `DB_CONSTRAINT`, `INVALID_STATE_TRANSITION`).

**Data Exchange Formats:**
- Database layer: `snake_case`
- App/domain layer: `camelCase`
- Mapping required at repository boundary (never leak DB naming into UI)
- Date/time:
  - Persist in UTC ISO-8601 text
  - Convert to local timezone only at presentation layer
- Booleans: native booleans (`true/false`) only
- Nulls: explicit `null` for absence; avoid undefined in persisted payloads

### Communication Patterns

**Event System Patterns:**
- Event names: `domain.entity.action.v1`
  - e.g., `session.timer.completed.v1`, `card.awarded.v1`, `battle.turn.resolved.v1`
- Event payload baseline:
  - `eventId`, `occurredAt`, `source`, `correlationId`, `payload`
- Event payloads are immutable after publication.
- Version bump required for breaking payload changes.

**State Management Patterns:**
- Domain state transitions must be pure and deterministic.
- Mutations only through feature actions/use-cases, never directly from UI components.
- Selectors are read-only and colocated with feature store.
- Side effects (AI calls, notifications, persistence writes) handled in orchestrators/effects layer, not reducers.

### Process Patterns

**Error Handling Patterns:**
- Classify errors as:
  - User-correctable
  - Transient/retriable
  - Fatal/bug
- User messages are concise, actionable, and non-technical.
- Structured logs include `feature`, `operation`, `correlationId`, `errorCode`.
- Retry policy:
  - bounded retries with jitter for transient network/provider failures
  - immediate fallback to manual classification when unrecoverable/offline

**Loading State Patterns:**
- Loading flags use intent-specific names:
  - `isClassifyingSession`
  - `isSavingReflection`
  - `isResolvingBattleTurn`
- Prefer local loading state per feature flow; avoid global spinner except app bootstrap.
- Any operation >300ms should display immediate progress affordance.
- Loading states must be cancellable where user intent can change (e.g., abandon classification request).

### Enforcement Guidelines

**All AI Agents MUST:**
- Use established naming conventions and boundary mappings (DB `snake_case` <-> app `camelCase`)
- Return standardized result envelopes at service boundaries
- Emit/version domain events using the defined naming and payload baseline
- Keep domain transitions deterministic and side-effect free
- Add/adjust tests with every new domain rule or integration boundary

**Pattern Enforcement:**
- CI checks:
  - lint/typecheck/test required on all PRs
- Architecture review checklist in PR template:
  - naming
  - result envelope
  - event schema
  - boundary mapping
  - test coverage for new rules
- Pattern violations documented as ADR/architecture note before merge
- Pattern updates require explicit architecture doc amendment (this section)

### Pattern Examples

**Good Examples:**
- DB row `{ started_at: "2026-03-17T08:00:00Z" }` mapped to domain `{ startedAt: "2026-03-17T08:00:00Z" }` in repository adapter.
- Classifier service returns:
  - `{ ok: true, data: { workType: "DeepFocus", plausibility: "high" } }`
  - or `{ ok: false, error: { code: "CLASSIFIER_TIMEOUT", retriable: true, message: "Classification timed out." } }`
- Event emitted: `session.timer.completed.v1` with `correlationId` reused through card-award flow.

**Anti-Patterns:**
- UI component calling SQLite directly.
- Mixing thrown exceptions and result-envelope failures in same service.
- Event names like `SessionDone` without versioning.
- Directly storing local timezone timestamps in persistence.
- Feature folders that split business logic across unrelated global utility files.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
cardwork/
├── README.md
├── package.json
├── app.json
├── eas.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── preview-build.yml
├── docs/
│   ├── architecture/
│   │   ├── adr/
│   │   └── patterns.md
│   └── api/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── session/
│   │   ├── start.tsx
│   │   ├── active.tsx
│   │   └── complete.tsx
│   ├── deck/
│   │   ├── index.tsx
│   │   └── card-details.tsx
│   ├── battle/
│   │   ├── daily.tsx
│   │   ├── weekly.tsx
│   │   └── result.tsx
│   ├── weekly/
│   │   ├── reset.tsx
│   │   └── epic-declaration.tsx
│   └── settings/
│       ├── index.tsx
│       └── notifications.tsx
├── src/
│   ├── config/
│   │   ├── env/
│   │   │   ├── env.schema.ts
│   │   │   └── env.ts
│   │   └── feature-flags.ts
│   ├── database/
│   │   ├── client.ts
│   │   ├── migration-runner.ts
│   │   ├── migrations/
│   │   │   ├── 001_init_schema.sql
│   │   │   ├── 002_add_weekly_tables.sql
│   │   │   └── 003_add_battle_results.sql
│   │   └── repositories/
│   │       ├── session-repository.ts
│   │       ├── card-repository.ts
│   │       ├── deck-repository.ts
│   │       └── battle-repository.ts
│   ├── features/
│   │   ├── sessions/
│   │   │   ├── domain/
│   │   │   │   ├── session.ts
│   │   │   │   ├── session-rules.ts
│   │   │   │   └── session-events.ts
│   │   │   ├── application/
│   │   │   │   ├── start-session.ts
│   │   │   │   ├── complete-session.ts
│   │   │   │   └── validate-session-integrity.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── sqlite-session-store.ts
│   │   │   │   └── appstate-timer-adapter.ts
│   │   │   └── ui/
│   │   │       ├── session-timer-card.tsx
│   │   │       ├── session-intent-form.tsx
│   │   │       └── use-session-flow.ts
│   │   ├── classification/
│   │   │   ├── domain/
│   │   │   │   ├── classification-result.ts
│   │   │   │   └── classification-events.ts
│   │   │   ├── application/
│   │   │   │   ├── classify-session.ts
│   │   │   │   └── fallback-manual-tag.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── classifier-provider.ts
│   │   │   │   ├── remote-classifier-client.ts
│   │   │   │   └── manual-classifier-client.ts
│   │   │   └── ui/
│   │   │       ├── classification-review.tsx
│   │   │       └── classification-status-chip.tsx
│   │   ├── cards/
│   │   │   ├── domain/
│   │   │   │   ├── card.ts
│   │   │   │   ├── card-generation-rules.ts
│   │   │   │   └── card-events.ts
│   │   │   ├── application/
│   │   │   │   ├── generate-card.ts
│   │   │   │   └── award-card.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── sqlite-card-store.ts
│   │   │   └── ui/
│   │   │       ├── card-reveal-modal.tsx
│   │   │       └── card-list.tsx
│   │   ├── deck/
│   │   │   ├── domain/
│   │   │   │   ├── weekly-deck.ts
│   │   │   │   ├── deck-constraints.ts
│   │   │   │   └── deck-events.ts
│   │   │   ├── application/
│   │   │   │   ├── add-card-to-weekly-deck.ts
│   │   │   │   └── enforce-deck-cap.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── sqlite-deck-store.ts
│   │   │   └── ui/
│   │   │       ├── weekly-deck-screen.tsx
│   │   │       └── deck-cap-indicator.tsx
│   │   ├── battle/
│   │   │   ├── domain/
│   │   │   │   ├── battle-state.ts
│   │   │   │   ├── turn-engine.ts
│   │   │   │   └── battle-events.ts
│   │   │   ├── application/
│   │   │   │   ├── start-daily-battle.ts
│   │   │   │   ├── resolve-turn.ts
│   │   │   │   └── resolve-weekly-boss.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── sqlite-battle-store.ts
│   │   │   └── ui/
│   │   │       ├── battle-board.tsx
│   │   │       ├── hand-panel.tsx
│   │   │       └── battle-result-sheet.tsx
│   │   ├── weekly-cycle/
│   │   │   ├── domain/
│   │   │   │   ├── weekly-state.ts
│   │   │   │   └── weekly-events.ts
│   │   │   ├── application/
│   │   │   │   ├── monday-reset.ts
│   │   │   │   └── declare-weekly-epic.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── weekly-scheduler.ts
│   │   │   └── ui/
│   │   │       ├── weekly-progress-screen.tsx
│   │   │       └── epic-declaration-form.tsx
│   │   └── notifications/
│   │       ├── domain/
│   │       │   └── reminder-policy.ts
│   │       ├── application/
│   │       │   ├── schedule-reminders.ts
│   │       │   └── reconcile-reminders.ts
│   │       ├── infrastructure/
│   │       │   └── expo-notifications-adapter.ts
│   │       └── ui/
│   │           └── reminder-settings.tsx
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   └── error-codes.ts
│   │   ├── result/
│   │   │   └── result.ts
│   │   ├── events/
│   │   │   ├── event-bus.ts
│   │   │   └── event-types.ts
│   │   ├── time/
│   │   │   ├── clock.ts
│   │   │   └── utc.ts
│   │   ├── logging/
│   │   │   ├── logger.ts
│   │   │   └── telemetry-adapter.ts
│   │   └── validation/
│   │       └── schemas.ts
│   └── platform/
│       ├── app-lifecycle/
│       │   └── appstate-observer.ts
│       └── storage/
│           └── secure-store.ts
├── assets/
│   ├── cards/
│   ├── enemies/
│   ├── icons/
│   └── sounds/
├── tests/
│   ├── integration/
│   │   ├── session-to-card-flow.test.ts
│   │   ├── daily-battle-flow.test.ts
│   │   └── weekly-reset-flow.test.ts
│   ├── e2e/
│   │   ├── onboarding.e2e.ts
│   │   └── weekly-journey.e2e.ts
│   └── fixtures/
│       ├── sessions/
│       └── cards/
└── scripts/
    ├── verify-env.ts
    └── run-migrations.ts
```

### Architectural Boundaries

**API Boundaries:**
- No public backend API required for MVP core loop.
- External boundary isolated to `features/classification/infrastructure/remote-classifier-client.ts`.
- Notification provider boundary isolated to `features/notifications/infrastructure/expo-notifications-adapter.ts`.
- All external calls return standardized `Result<T, E>` envelope.

**Component Boundaries:**
- UI components may call only feature application services/hooks.
- UI must not access SQLite or provider clients directly.
- Shared UI primitives stay stateless and feature-agnostic.

**Service Boundaries:**
- `domain/` holds pure rules/entities/events.
- `application/` orchestrates use-cases and side effects via interfaces.
- `infrastructure/` implements interfaces and integrates Expo/device/provider details.

**Data Boundaries:**
- SQLite is the source of truth for gameplay and progression.
- Repository layer handles DB `snake_case` <-> app `camelCase` mapping.
- Domain and UI layers consume only mapped objects.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Epic 1 (session capture + integrity gate) -> `features/sessions/*`, `app/session/*`
- Epic 2 (classification + card generation) -> `features/classification/*`, `features/cards/*`
- Epic 3 (daily battle loop) -> `features/battle/*`, `app/battle/daily.tsx`
- Epic 4 (weekly boss cadence + reset) -> `features/weekly-cycle/*`, `app/weekly/*`
- Epic 5 (deck progression and card management) -> `features/deck/*`, `app/deck/*`
- Epic 6 (UX polish, notifications, reliability) -> `features/notifications/*`, `shared/errors/*`, `tests/*`

**Cross-Cutting Concerns:**
- Error model/logging -> `shared/errors/*`, `shared/logging/*`
- Event conventions/correlation IDs -> `shared/events/*`
- Time correctness/UTC normalization -> `shared/time/*`
- Env + feature flags -> `config/env/*`, `config/feature-flags.ts`
- Migration/versioning -> `database/migration-runner.ts`, `database/migrations/*`

### Integration Points

**Internal Communication:**
- Use-case services publish domain events via `shared/events/event-bus.ts`.
- Feature orchestration subscribes to events (e.g., session complete -> classify -> award card).
- Screen hooks coordinate UI with application services.

**External Integrations:**
- AI classification provider through adapter interface.
- Push/local notifications via Expo Notifications adapter.
- EAS build/release through root `eas.json` and CI workflows.

**Data Flow:**
1. UI captures intent/session actions.
2. Session service validates timing/integrity and persists state.
3. Classification service resolves work type (remote or fallback).
4. Card/deck services update progression.
5. Battle service consumes deck snapshot and emits outcome events.
6. Weekly-cycle service applies cadence/reset transitions.
7. Notifications reconcile reminders from current weekly state.

### File Organization Patterns

**Configuration Files:**
- Root-level runtime/build config for Expo toolchain.
- Typed env schema under `src/config/env/`.

**Source Organization:**
- Feature-first under `src/features/*` with strict domain/application/infrastructure/ui layers.
- Shared technical primitives under `src/shared/*`.

**Test Organization:**
- Unit tests co-located as `*.test.ts(x)`.
- Integration/e2e centralized under `tests/integration` and `tests/e2e`.

**Asset Organization:**
- Runtime visual/audio assets in `assets/*` by category.
- Feature modules reference assets through stable asset index helpers.

### Development Workflow Integration

**Development Server Structure:**
- Expo Router screens in `app/*` consume typed feature hooks/services from `src/features/*`.

**Build Process Structure:**
- CI validates lint, typecheck, tests, and Expo build compatibility before merge.

**Deployment Structure:**
- EAS profiles in `eas.json` define preview and production pipelines.
- Environment configuration stays typed and profile-scoped.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All major decisions are compatible: Expo-managed React Native + TypeScript + SQLite local-first persistence + adapter-based external integrations. No conflicting framework/runtime assumptions were found. Architectural layers (domain/application/infrastructure/ui) align with the selected stack and with offline-first constraints.

**Pattern Consistency:**
Implementation patterns reinforce core decisions:
- DB `snake_case` vs app `camelCase` mapping is explicitly bounded at repository layer
- Standard `Result` envelope avoids error-handling divergence
- Event naming/versioning aligns with deterministic orchestration requirements
- Process patterns (retry/fallback/loading) align with AI-provider uncertainty and mobile lifecycle realities

**Structure Alignment:**
Project structure supports all decisions and patterns:
- Feature-first modules map to epics
- Shared cross-cutting modules are clearly separated
- Integration boundaries are explicit for AI and notifications
- Tests/migrations/config locations are unambiguous for agent execution

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All defined epics have direct architectural homes:
- Session integrity and timer flow -> `features/sessions`
- Classification + card generation -> `features/classification`, `features/cards`
- Daily/weekly battle mechanics -> `features/battle`, `features/weekly-cycle`
- Deck progression and polish/reminders -> `features/deck`, `features/notifications`

Cross-epic dependencies (session->classification->card->battle->weekly cadence) are supported via event-driven orchestration and repository-backed state transitions.

**Functional Requirements Coverage:**
Core functional capabilities are fully represented:
- Session capture and 30-minute gate
- AI-assisted classification with manual fallback
- Deterministic card/deck progression
- Daily battle and weekly boss cadence
- Weekly reset and epic declaration
- Reminder and progression feedback loops

**Non-Functional Requirements Coverage:**
- **Performance:** startup and interaction constraints addressed via modular structure and hot-path optimization patterns
- **Security/Privacy:** local-first storage, provider-boundary isolation, and restricted direct data access patterns defined
- **Scalability:** MVP client-heavy architecture allows future backend/sync expansion via adapter and boundary design
- **Reliability:** migration strategy, deterministic transitions, and retry/fallback policies defined

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions are documented with sufficient specificity for implementation sequencing, including data architecture, integration boundaries, state strategy, and deployment approach.

**Structure Completeness:**
Project tree is concrete, non-generic, and includes:
- Root config/build files
- Feature modules and layering
- Shared modules
- Migrations/repositories
- Test directories
- Asset and script paths

**Pattern Completeness:**
Conflict-prone areas are covered:
- naming
- response formats
- event contracts
- state update rules
- loading/error/retry process rules

### Gap Analysis Results

**Critical Gaps:** None identified.

**Important Gaps (recommended soon):**
1. Select concrete telemetry provider (or confirm local-only logging for MVP).
2. Define explicit threshold for enabling SQLCipher hardening (e.g., before beta/public launch).
3. Choose e2e toolchain (Detox/Maestro) and codify in test strategy notes.

**Nice-to-Have Gaps:**
- Add 2-3 ADRs for key irreversible decisions (state model, adapter boundary, migration policy).
- Add sample "golden path" implementation story for first feature to accelerate agent onboarding.

### Validation Issues Addressed

No blocking validation issues were found. Non-blocking enhancements have been captured as implementation-phase refinements and do not prevent immediate development start.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions/context
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements-to-structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Strong alignment between product loop and technical boundaries
- Deterministic state and event model suitable for multi-agent implementation
- Explicit conflict-prevention patterns reduce integration drift
- Concrete project tree gives immediate implementation guidance

**Areas for Future Enhancement:**
- Telemetry provider finalization
- Security hardening trigger policy formalization
- E2E framework standardization and fixture strategy expansion

### Implementation Handoff

**AI Agent Guidelines:**
- Follow architectural decisions as authoritative defaults
- Apply implementation patterns consistently across all modules
- Respect layer boundaries and repository mappings
- Use event/version/result conventions exactly as documented

**First Implementation Priority:**
Initialize project with:
`npx create-expo-app@latest --template default@sdk-55`
then establish folder scaffolding, migration runner, and session domain skeleton before other features.
