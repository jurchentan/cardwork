# Story 1.2: Capture Session Intent and Start a Session in Two Taps

Status: review

## Story

As a player,
I want to enter intent by text or voice and quickly start a session timer,
so that logging work feels frictionless.

## Acceptance Criteria

1. **Given** I am on the home/session start screen
   **When** I provide intent (text or voice) and start session
   **Then** a session starts with a running timer and saved intent
   **And** the start flow can be completed within two taps/clicks from home.

## Tasks / Subtasks

- [x] Build the two-tap session start path from home (AC: 1)
  - [x] Update `app/index.tsx` to present a primary CTA that routes directly into session start in one tap.
  - [x] Implement `app/session/index.tsx` start screen with a single clear start action so home->session-start is max two taps/clicks.
  - [x] Ensure desktop click and mobile tap behavior are functionally equivalent.
- [x] Capture intent via text and voice entry modes (AC: 1)
  - [x] Add session intent input UI in `src/features/sessions/ui/` supporting text input now and a voice entry path hook/interface.
  - [x] Represent intent input mode as explicit domain values (`text` or `voice`) and persist with intent payload.
  - [x] If voice capture is not production-ready yet, keep UI contract and fallback to text entry without blocking session start.
- [x] Start and persist a new active session with intent (AC: 1)
  - [x] Add session domain model/rules and start-session use case under `src/features/sessions/{domain,application}/`.
  - [x] Implement repository write path in `src/database/repositories/session-repository.ts` for `sessions` and `session_intents` inserts.
  - [x] Record `started_at`, initial timer state, and intent row in one atomic persistence boundary before returning success.
- [x] Add deterministic tests for start flow and persistence guarantees (AC: 1)
  - [x] Add unit tests for session start rules and intent-mode validation.
  - [x] Add integration test covering: home->start flow, session record creation, and linked intent persistence.
  - [x] Validate result-envelope behavior on failure paths (no thrown raw errors at service boundaries).

## Dev Notes

### Story Context and Intent

- This is the first player-facing loop story after project scaffolding.
- Scope is limited to capturing intent and creating a running session with persisted intent.
- Do not implement classification, integrity gate, plausibility checks, or card award logic in this story.

### Technical Requirements

- Keep feature boundaries: `domain` pure, `application` orchestration, `infrastructure` adapters, `ui` rendering.
- Use standardized result envelope at service boundaries:
  - Success: `{ ok: true, data }`
  - Failure: `{ ok: false, error: { code, message, retriable } }`
- Persist to existing SQLite schema tables:
  - `sessions`
  - `session_intents`
- Preserve DB `snake_case` to app `camelCase` mapping at repository boundaries.
- Maintain UTC ISO-8601 timestamps for persistence (`started_at`, `created_at`, `updated_at`).

### Architecture Compliance

- UI must not call SQLite directly; route writes through feature application service and repository.
- Keep timer/session state transitions deterministic and side-effect free in domain logic.
- Side effects (DB writes, optional voice permission/access) belong in orchestrators/adapters.
- Use structured error classification for user-correctable vs retriable vs fatal failure states.

### Library and Framework Requirements

- Expo project baseline remains SDK 55 (`expo` ~55.x) and React Native 0.83.x.
- SQLite access must use `expo-sqlite` APIs and parameterized/prepared statements for user-provided intent text.
- Voice note for this story: `expo-speech` is text-to-speech, not speech-to-text. If voice input is implemented now, use a dedicated speech-recognition adapter behind a feature interface; otherwise ship text-first + voice interface/fallback contract without breaking AC.

### File Structure Requirements

- Expected touch points (minimum):
  - `app/index.tsx`
  - `app/session/index.tsx`
  - `src/features/sessions/domain/*`
  - `src/features/sessions/application/*`
  - `src/features/sessions/ui/*`
  - `src/database/repositories/session-repository.ts`
- Keep cross-feature utilities in `src/shared/*`; do not leak session-specific logic into shared prematurely.

### Testing Requirements

- Add or update tests for:
  - session start success path
  - persistence failure path returning typed error envelope
  - home->start interaction path meeting two-tap/click requirement
- Keep tests deterministic and CI-safe (`npm run test`, `npm run typecheck`, `npm run lint`, `npm run build:check`).

### Previous Story Intelligence

- Story 1.1 established scaffold, typed env parsing, result-envelope baseline, and quality scripts.
- Continue the same structure and naming conventions; avoid introducing alternate layering patterns.
- Reuse existing repository and migration foundation rather than adding parallel persistence paths.

### Git Intelligence Summary

- Recent implementation commit added Expo SDK 55 baseline, route scaffolds, repository skeletons, and migration setup.
- Sprint artifacts now track Story 1.2 as `ready-for-dev`; keep this state until implementation starts.
- Current codebase pattern favors small feature modules with explicit placeholders (`.gitkeep`) - fill those incrementally for this story instead of creating broad unrelated scaffolds.

### Latest Tech Information

- Expo create-app docs (Mar 2026) still require explicit SDK 55 template for new SDK 55 projects:
  - `npx create-expo-app@latest --template default@sdk-55`
- Expo SQLite docs emphasize:
  - DB persists across restarts
  - prepared statements/parameter binding for user input safety
  - `PRAGMA user_version` migration flow remains standard for versioned schema upgrades
- Expo Speech docs confirm package purpose is text-to-speech; do not treat it as speech recognition input.

### Project Context Reference

- No `project-context.md` file found in repository scan.

### References

- Story 1.2 source definition: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Capture Session Intent and Start a Session in Two Taps]
- Epic 1 context: [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Session-to-Card Core Loop]
- Session and persistence architecture boundaries: [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Consistency and result-envelope rules: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- Session flow and mobile interaction intent: [Source: _bmad-output/gdd.md#Controls and Input]
- Expo create-app docs: [Source: https://docs.expo.dev/more/create-expo/]
- Expo SQLite docs: [Source: https://docs.expo.dev/versions/latest/sdk/sqlite/]
- Expo Speech docs: [Source: https://docs.expo.dev/versions/latest/sdk/speech/]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Loaded skill definition from `.opencode/skills/gds-dev-story/SKILL.md` and executed `.opencode/skills/gds-dev-story/workflow.md` for story `1-2-capture-session-intent-and-start-a-session-in-two-taps`.
- Loaded config from `_bmad/gds/config.yaml` and sprint tracking from `_bmad-output/implementation-artifacts/sprint-status.yaml`.
- Set sprint status `ready-for-dev -> in-progress`, implemented tasks with tests-first flow, then set story + sprint status to `review`.
- Implemented session domain/application/ui modules and repository persistence for `sessions` + `session_intents`.
- Updated home and session routes (`app/*` and `src/app/*`) for one-tap route-to-session and start action with running timer feedback.
- Added native/web-safe persistence wrapper and retained web build compatibility without unresolved sqlite wasm in bundle.
- Validation run results: `npm run test` pass, `npm run typecheck` pass, `npm run lint` pass (Node version warning only), `npm run build:check` pass.

### Completion Notes List

- Implemented two-tap session start flow from home with explicit `/session` primary action routing.
- Added text/voice mode intent capture UI with text fallback behavior when voice mode is selected.
- Implemented session start domain validation and application use case using standardized result envelopes.
- Implemented repository transaction write path for `sessions` and `session_intents` with timestamped atomic persistence.
- Added deterministic tests for intent mode validation, validation error envelopes, two-tap flow contract, and persisted session-intent linkage.
- Completed full validation gates and moved story status to `review`.

### File List

- _bmad-output/implementation-artifacts/1-2-capture-session-intent-and-start-a-session-in-two-taps.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- app/index.tsx
- app/session/index.tsx
- src/app/index.tsx
- src/app/session/index.tsx
- src/database/repositories/mappers.ts
- src/database/repositories/session-repository.ts
- src/features/sessions/application/start-session.ts
- src/features/sessions/domain/session-start.ts
- src/features/sessions/infrastructure/start-session-persistence.native.ts
- src/features/sessions/infrastructure/start-session-persistence.ts
- src/features/sessions/infrastructure/start-session-persistence.web.ts
- src/features/sessions/ui/session-start-flow.ts
- tests/sessions/start-session.domain.test.ts
- tests/sessions/start-session.integration.test.ts

## Change Log

- 2026-03-17: Implemented Story 1.2 session intent capture and session start flow with repository persistence, added unit/integration coverage, and advanced status to review.
