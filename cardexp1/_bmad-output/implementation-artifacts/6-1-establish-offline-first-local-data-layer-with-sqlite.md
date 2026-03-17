# Story 6.1: Establish Offline-First Local Data Layer with SQLite

Status: review

## Story

As a developer,
I want core gameplay entities persisted in local SQLite with versioned migrations,
so that the full MVP loop runs without server dependency.

## Acceptance Criteria

1. **Given** a fresh install or upgraded app version
   **When** data layer initialization runs
   **Then** required local tables for sessions, cards, decks, battles, weekly cycle, and progression exist with current schema version
   **And** migration execution is forward-only and deterministic using tracked DB user version.

## Tasks / Subtasks

- [x] Add SQLite runtime dependency and database bootstrap entrypoint (AC: 1)
  - [x] Install and wire `expo-sqlite` using Expo-managed workflow
  - [x] Add `src/database/client.ts` with an async DB opener and single source of truth for database name
  - [x] Ensure startup path initializes DB before dependent feature repositories execute
- [x] Implement deterministic migration runner with `PRAGMA user_version` (AC: 1)
  - [x] Add `src/database/migration-runner.ts` that reads current DB version and applies only pending migrations in ascending order
  - [x] Execute migration steps in a transaction boundary where safe and set `PRAGMA user_version` only after successful step completion
  - [x] Enforce forward-only behavior (no rollback/down migration path in MVP)
- [x] Create initial SQL schema migration files for required entities (AC: 1)
  - [x] Add `src/database/migrations/001_init_schema.sql` covering minimum tables for sessions, cards, decks, battles, weekly state, and progression
  - [x] Add follow-up migration placeholders only when required by current implementation scope
  - [x] Enable critical SQLite pragmas at initialization (`journal_mode=WAL`, `foreign_keys=ON`)
- [x] Add repository boundary scaffolding and naming contract checks (AC: 1)
  - [x] Create repository stubs in `src/database/repositories/` for session/card/deck/battle/weekly-progress access
  - [x] Add explicit mapping helpers to keep DB `snake_case` isolated from app/domain `camelCase`
  - [x] Use result envelope return types for repository/service boundaries
- [x] Add automated tests for migration determinism and schema readiness (AC: 1)
  - [x] Add unit tests for migration selection logic (fresh install, partial upgrade, latest version no-op)
  - [x] Add integration test to verify required tables exist after bootstrap
  - [x] Add regression assertion for stable `user_version` behavior across repeated app starts

## Dev Notes

### Story Context and Intent

- This story establishes the authoritative offline persistence foundation for all gameplay loops.
- Scope is infrastructure only: database initialization, migrations, schema baseline, and repository boundaries.
- Do not implement gameplay rules in this story; only persistence enablers and safety rails.

### Epic Context (Cross-Story Guardrails)

- Epic 6 focuses on integrity, offline reliability, and performance.
- Upcoming stories depend on this output:
  - 6.2 crash-safe writes and recovery requires atomic persistence semantics from this story.
  - 6.3 offline AI fallback requires persistent outbox table and deterministic data access.
  - 6.4 and 6.5 performance targets depend on efficient schema/index and predictable data access.

### Technical Requirements

- Use SQLite via `expo-sqlite` as the primary local store.
- Required baseline tables include: `sessions`, `session_intents`, `session_reflections`, `cards`, `weekly_decks`, `battles_daily`, `battles_weekly`, `epics`, `meta_progress`, `outbox_ai_requests`.
- Migration strategy must use `PRAGMA user_version` with deterministic, forward-only steps.
- Favor prepared statements for any user-influenced query path.
- Data layer is source of truth; no network dependency for core loop.

### Architecture Compliance

- Respect feature boundaries:
  - Domain rules in `src/features/*/domain`
  - Use-cases in `src/features/*/application`
  - SQLite integrations in infrastructure/repository layers only
- UI must never call SQLite directly.
- Repository layer must perform DB `snake_case` to app/domain `camelCase` mapping.
- Service and repository boundaries must return result envelopes:
  - Success: `{ ok: true, data }`
  - Failure: `{ ok: false, error: { code, message, retriable } }`

### Library / Framework Requirements

- `expo-sqlite` is required and compatible with current Expo SDK 55 setup.
- Recommended initialization pattern:
  - Open DB with async API
  - Run startup pragmas and migration runner once on app boot
  - Keep migration logic centralized in `src/database/migration-runner.ts`
- SQLite operational guidance:
  - Use `PRAGMA journal_mode = WAL` for improved durability/performance balance
  - Use `PRAGMA foreign_keys = ON` to enforce relational integrity

### File Structure Requirements

- Implement and/or update files in these locations:
  - `src/database/client.ts`
  - `src/database/migration-runner.ts`
  - `src/database/migrations/*.sql`
  - `src/database/repositories/*.ts`
  - `tests/integration/*` for DB bootstrap validation
- Keep implementation aligned with architecture directory conventions already scaffolded in Story 1.1.

### Testing Requirements

- Add deterministic migration tests that validate:
  - Fresh install initializes schema and sets version
  - Upgrades apply only missing migrations in order
  - Re-running bootstrap does not reapply completed migrations
- Add integration validation for required table existence and expected schema version.
- Keep tests isolated from gameplay logic and focused on persistence contracts.

### Project Structure Notes

- Existing project already contains `src/database/migrations/` and `src/database/repositories/` placeholders; this story should replace placeholders with executable infrastructure.
- Existing scripts currently include `lint`; if adding test/typecheck scripts is necessary for this story's tests, keep changes minimal and aligned with Expo toolchain.

### Latest Tech Information

- Expo SQLite docs confirm persistence across app restarts and provide async API for open/query/transactions.
- Expo recommends using parameter binding/prepared statements for SQL-injection safety.
- SQLite `user_version` pragma is the canonical mechanism for application-managed schema versioning.

### References

- Story definition and AC: [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1: Establish Offline-First Local Data Layer with SQLite]
- Epic 6 context: [Source: _bmad-output/planning-artifacts/epics.md#Epic 6: Integrity, Offline Reliability, and Performance]
- SQLite data architecture and table inventory: [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Migration strategy: [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Boundary and mapping rules: [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries]
- Naming and result envelope conventions: [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- Data format mapping and envelope contract: [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- Expo SQLite docs: [Source: https://docs.expo.dev/versions/latest/sdk/sqlite/]
- SQLite pragma reference (`user_version`, journaling, foreign keys): [Source: https://sqlite.org/pragma.html]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Loaded workflow/template/checklist from `.opencode/skills/gds-create-story/`.
- Loaded config from `_bmad/gds/config.yaml` and sprint tracking from `_bmad-output/implementation-artifacts/sprint-status.yaml`.
- Parsed explicit user target `6.1` as story key `6-1-establish-offline-first-local-data-layer-with-sqlite`.
- Loaded source context from `_bmad-output/planning-artifacts/epics.md` and `_bmad-output/planning-artifacts/architecture.md`.
- Checked project structure and current scaffold status in `src/database/`, `src/config/env/`, `tests/`, and `package.json`.
- Reviewed latest SQLite/Expo guidance via official docs.
- Executed dependency installation: `npx expo install expo-sqlite` and `npm install -D tsx`.
- Added/validated DB initialization flow in `app/_layout.tsx` via `initializeDatabase()`.
- Added migration runtime, migration definitions, repository scaffolding, and migration test coverage.
- Executed validation commands: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build:check`.

### Completion Notes List

- Comprehensive story context created with implementation guardrails focused on deterministic SQLite initialization and migration safety.
- Added explicit anti-regression constraints around schema versioning, boundary mapping, and testing expectations.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented offline-first SQLite bootstrap with forward-only migration orchestration and `PRAGMA user_version` tracking.
- Added initial SQL schema for all required MVP persistence entities and indexes.
- Added repository boundary scaffolding with result-envelope friendly stubs and snake_case-to-camelCase mapper helpers.
- Added migration-focused automated tests covering fresh install, partial upgrade ordering, no-op behavior at latest version, and required table readiness.
- Validation passed: tests, typecheck, lint, and build-check all complete successfully in current environment.

### File List

- _bmad-output/implementation-artifacts/6-1-establish-offline-first-local-data-layer-with-sqlite.md
- app/_layout.tsx
- package.json
- package-lock.json
- src/database/client.ts
- src/database/migration-runner.ts
- src/database/migrations/001_init_schema.sql
- src/database/migrations/001_init_schema.ts
- src/database/migrations/index.ts
- src/database/migrations/types.ts
- src/database/repositories/mappers.ts
- src/database/repositories/session-repository.ts
- src/database/repositories/card-repository.ts
- src/database/repositories/deck-repository.ts
- src/database/repositories/battle-repository.ts
- src/database/repositories/weekly-progress-repository.ts
- tests/database/migration-runner.test.ts

## Change Log

- 2026-03-17: Created Story 6.1 with full persistence architecture context, migration/testing guardrails, and implementation-ready tasks.
- 2026-03-17: Implemented SQLite bootstrap, deterministic forward-only migrations, schema baseline, repository scaffolding, and automated migration validation; status moved to review.
