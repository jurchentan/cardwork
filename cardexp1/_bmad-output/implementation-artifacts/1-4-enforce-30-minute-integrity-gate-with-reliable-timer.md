# Story 1.4: Enforce 30-Minute Integrity Gate with Reliable Timer

Status: done

## Story

As a player,
I want rewards blocked before 30 minutes and timer behavior to remain accurate across app lifecycle changes,
so that card rewards reflect real effort.

## Acceptance Criteria

1. **Given** an active session under 30 minutes
   **When** I attempt to end and claim reward
   **Then** no card can be awarded
   **And** timer state remains accurate and recoverable across background/foreground interruptions within defined tolerance.

## Tasks / Subtasks

- [x] Implement deterministic 30-minute integrity gate in session domain (AC: 1)
  - [x] Add explicit session integrity rule that computes elapsed duration from persisted UTC timestamps, not UI timer ticks.
  - [x] Return a typed domain result that indicates `eligible` vs `ineligible` with machine-readable reason code.
  - [x] Emit a versioned domain event for blocked completion attempts (for audit/debug consistency).
- [x] Add lifecycle-aware timer recovery and checkpointing (AC: 1)
  - [x] Introduce an app lifecycle adapter using React Native `AppState` events (`change`, and Android `blur`/`focus` where relevant).
  - [x] Persist timer checkpoints (`started_at`, `last_checkpoint_at`, `accumulated_ms`) so session state can recover after background/resume and restart.
  - [x] Rehydrate active session on app foreground/start and recompute elapsed time deterministically.
- [x] Prevent reward flow when gate fails and preserve user guidance (AC: 1)
  - [x] Ensure completion/reward application service stops before reflection/card flows when elapsed time < 30 minutes.
  - [x] Return standardized result envelope error (`code`, `message`, `retriable`) for gate failures.
  - [x] Display clear UI feedback with remaining time without exposing internal implementation details.
- [x] Add persistence contract updates for integrity metadata (AC: 1)
  - [x] Extend repository methods and DB mappings (snake_case <-> camelCase) for timer checkpoint fields.
  - [x] Keep writes atomic for end-attempt + integrity evaluation state updates.
  - [x] Preserve crash-safe behavior established in the SQLite migration foundation.
- [x] Add tests for gate enforcement and lifecycle reliability (AC: 1)
  - [x] Unit tests: elapsed-time integrity rules, boundary checks (29:59 fail, 30:00 pass), and result envelope codes.
  - [x] Integration tests: background -> foreground recovery, restart rehydration, and blocked reward path under threshold.
  - [x] Regression tests: no premature card-award call path when gate is ineligible.

## Dev Notes

### Story Context and Intent

- This story is the core anti-cheat/integrity guardrail for the session loop.
- Scope is strictly timer correctness and reward gating. Do not implement reflection plausibility or card reveal logic here.

### Epic Context (Cross-Story Guardrails)

- Story 1.5 (reflection plausibility) and Story 1.6 (card award/reveal) depend on this story to provide a trustworthy eligibility signal.
- Keep this story authoritative for "can the player proceed to reward resolution"; downstream stories should consume this gate, not duplicate it.

### Technical Requirements

- Enforce minimum duration with deterministic domain logic; never trust transient UI timer state alone.
- Use persisted UTC timestamps and/or persisted elapsed checkpoints to recover after lifecycle interruptions.
- Keep service boundaries on standardized result envelope:
  - Success: `{ ok: true, data }`
  - Failure: `{ ok: false, error: { code, message, retriable } }`
- Continue strict DB `snake_case` to app `camelCase` mapping at repository boundaries.
- Use parameterized SQL/prepared statements for all writes and queries touching session state.

### Architecture Compliance

- UI cannot call SQLite directly; session completion and integrity checks flow through application services and repositories.
- Domain transitions stay pure and deterministic; lifecycle and persistence side effects remain in infrastructure/application layers.
- Preserve event naming/versioning (`domain.entity.action.v1`) for new session integrity events.
- Keep logs structured with `feature`, `operation`, `correlationId`, and `errorCode` for failed gate attempts.

### Library and Framework Requirements

- Keep Expo SDK 55 + React Native app lifecycle handling patterns already in use.
- Use React Native `AppState` as lifecycle signal source (`active`, `background`, `inactive`) and Android `blur`/`focus` where needed.
- Keep SQLite as source of truth using `expo-sqlite`; prefer controlled transaction boundaries for integrity-sensitive state updates.

### File Structure Requirements

- Expected touch points (minimum):
  - `src/features/sessions/domain/*` (integrity/timer rules and events)
  - `src/features/sessions/application/*` (end-session + reward gate orchestration)
  - `src/features/sessions/infrastructure/*` (app lifecycle timer adapter + persistence bridge)
  - `src/features/sessions/ui/*` and `app/session/*` (eligible/ineligible completion UX)
  - `src/database/repositories/session-repository.ts`
  - `tests/sessions/*.test.ts`

### Testing Requirements

- Add deterministic boundary tests for 30-minute threshold behavior.
- Add lifecycle recovery tests for background/foreground and app restart hydration.
- Validate no card-award progression on ineligible sessions.
- Run quality gates: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build:check`.

### Previous Story Intelligence

- Story 1.2 already established session start persistence and two-tap flow; reuse that start-session persistence path instead of creating parallel timer storage.
- Previous review highlighted route divergence risk (`app/*` vs `src/app/*` paths). Keep active routes aligned and verify actual runtime path before claiming completion.
- Existing session infrastructure includes platform-specific persistence adapters (`*.native.ts`, `*.web.ts`); apply the same pattern for lifecycle/timer reliability logic.

### Git Intelligence Summary

- Recent commits concentrated on session flow wiring (`app/index.tsx`, `app/session/index.tsx`, `src/app/session.tsx`) and web persistence fallback.
- Session repository and mapper patterns are already in place and should be extended, not replaced.
- Recent remediation commit focused on review fixes and sprint artifact consistency; maintain that discipline for this story (runtime behavior must match story claims).

### Latest Tech Information

- React Native AppState (0.84 docs, updated Feb 2026): `AppState.currentState` can be `null` at launch momentarily, and lifecycle events include `change` plus Android-specific `blur`/`focus` hooks. Timer recovery must tolerate this startup gap.
- Expo SQLite docs (latest): database persists across restarts, prepared statements are recommended for user input safety, and `PRAGMA journal_mode=WAL` + `PRAGMA user_version` migration model remains standard.
- Expo BackgroundTask docs: background tasks are deferrable and not precise scheduling tools; do not use them as authoritative minute-level timer sources for the 30-minute integrity gate.

### Project Context Reference

- No `project-context.md` file found in repository scan.

### Story Completion Status

- Story status set to `ready-for-dev`.
- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created.

### References

- Story 1.4 source definition: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Enforce 30-Minute Integrity Gate with Reliable Timer]
- Epic 1 context: [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Session-to-Card Core Loop]
- Reliability and timer constraints: [Source: _bmad-output/planning-artifacts/epics.md#Non-Functional Requirements]
- Architecture boundaries and feature mapping: [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Deterministic state, result envelopes, naming rules: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- SQLite data architecture and migration baseline: [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- Previous story learnings: [Source: _bmad-output/implementation-artifacts/1-2-capture-session-intent-and-start-a-session-in-two-taps.md#Previous Story Intelligence]
- React Native AppState docs: [Source: https://reactnative.dev/docs/appstate]
- Expo SQLite docs: [Source: https://docs.expo.dev/versions/latest/sdk/sqlite/]
- Expo BackgroundTask docs: [Source: https://docs.expo.dev/versions/latest/sdk/background-task/]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Loaded workflow definition from `_bmad/bmm/workflows/4-implementation/bmad-create-story/workflow.md` (requested `workflow.yaml` path was not present in repo; equivalent workflow definition exists in `workflow.md`).
- Loaded configuration from `_bmad/bmm/config.yaml` and resolved planning/implementation artifact paths.
- Parsed user target `1.4` as story key `1-4-enforce-30-minute-integrity-gate-with-reliable-timer` from `sprint-status.yaml`.
- Loaded and analyzed source artifacts: `epics.md`, `architecture.md`, and prior implementation stories (`1-1`, `1-2`, `6-1`).
- Analyzed recent git history (`git log -5`, recent changed-file sets) for implementation pattern continuity.
- Pulled current external technical guidance for AppState, Expo SQLite, and Expo BackgroundTask.
- Executed red-green-refactor cycle by first adding failing integrity/timer tests, then implementing domain + application + infrastructure changes to satisfy AC.
- Updated sprint tracking status `ready-for-dev -> in-progress -> review` for story key `1-4-enforce-30-minute-integrity-gate-with-reliable-timer`.
- Ran quality gates and regression suite: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build:check`.

### Completion Notes List

- Implemented deterministic 30-minute integrity domain gate with typed eligibility results and reason codes.
- Added versioned integrity-blocked event builder `session.integrity.blocked.v1` for blocked reward attempts.
- Implemented reward-claim application service that halts reward flow when minimum duration is not met and returns typed error envelopes.
- Added lifecycle timer controller using `AppState` change events to checkpoint elapsed time and recover accurately after background/foreground transitions.
- Added session rehydration path to recover active session and elapsed timer from persisted checkpoints on screen mount.
- Extended persistence contracts (native/web + repository) with `accumulatedMs` and `lastCheckpointAt` fields and checkpoint/reward-claim methods.
- Added forward-only migration `002_add_session_timer_checkpoints` for persisted timer checkpoint columns.
- Added domain/integration/regression tests for threshold boundaries, lifecycle recovery, and blocked reward-path behavior.
- Code review remediation: added Android lifecycle `blur`/`focus` handling to checkpoint/restore timer state.
- Code review remediation: made reward-claim integrity status persistence atomic through a single transactional repository update.
- Code review remediation: added explicit blocked-integrity event emission path via structured log hook in reward claim persistence adapters.

### File List

- _bmad-output/implementation-artifacts/1-4-enforce-30-minute-integrity-gate-with-reliable-timer.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- app/session/index.tsx
- src/database/migrations/index.ts
- src/database/migrations/002_add_session_timer_checkpoints.sql
- src/database/migrations/002_add_session_timer_checkpoints.ts
- src/database/repositories/session-repository.ts
- src/features/sessions/application/attempt-session-reward.ts
- src/features/sessions/domain/session-integrity.ts
- src/features/sessions/domain/session-start.ts
- src/features/sessions/infrastructure/session-timer-lifecycle.ts
- src/features/sessions/infrastructure/start-session-persistence.native.ts
- src/features/sessions/infrastructure/start-session-persistence.ts
- src/features/sessions/infrastructure/start-session-persistence.web.ts
- tests/sessions/session-integrity.domain.test.ts
- tests/sessions/session-integrity.integration.test.ts
- tests/sessions/start-session.integration.test.ts

## Change Log

- 2026-03-17: Implemented Story 1.4 integrity gate and lifecycle timer recovery with persistence checkpointing, migration updates, and automated tests; status moved to review.
- 2026-03-17: Code review fixes applied for Story 1.4 (Android blur/focus lifecycle handling, atomic integrity state update on reward attempts, and observable blocked-event emission); status moved to done.
