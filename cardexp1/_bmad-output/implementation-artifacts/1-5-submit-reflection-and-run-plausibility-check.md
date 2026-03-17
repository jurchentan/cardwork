# Story 1.5: Submit Reflection and Run Plausibility Check

Status: done

## Story

As a player,
I want to submit a short reflection and have it evaluated for plausibility,
so that meaningful completion determines reward eligibility.

## Acceptance Criteria

1. **Given** a session of at least 30 minutes
   **When** I submit text or voice reflection
   **Then** the system evaluates plausibility and returns pass/fail
   **And** implausible/empty reflection prevents card reward and can assign an optional Revenge Task.

## Tasks / Subtasks

- [x] Add reflection domain contract and validation rules (AC: 1)
  - [x] Create reflection input contract with `reflectionMode` (`text | voice`) and trimmed text validation.
  - [x] Add plausibility decision model (`plausible | implausible`) with machine-readable reason codes.
  - [x] Define typed result envelope for reflection evaluation boundaries (`ok | error`).
- [x] Implement plausibility provider boundary with fallback behavior (AC: 1)
  - [x] Add plausibility provider interface and initial remote adapter under sessions infrastructure.
  - [x] Enforce bounded timeout (target <= 2s) and classify transient vs fatal errors.
  - [x] Add deterministic fallback policy for unavailable AI provider (non-blocking story behavior).
- [x] Persist reflection submission and plausibility outcome in session storage (AC: 1)
  - [x] Extend `SessionRepository` with methods to create/update `session_reflections` records.
  - [x] Persist `reflection_text`, `reflection_mode`, `plausibility_status`, and `revenge_task_assigned` using UTC timestamps.
  - [x] Keep DB `snake_case` <-> app `camelCase` mapping strictly at repository boundaries.
- [x] Integrate reflection flow after integrity gate pass in session UI/application flow (AC: 1)
  - [x] Add reflection capture step only when session is `ready_for_reward` from Story 1.4 gate.
  - [x] Show clear pass/fail response and block reward continuation on implausible/empty reflection.
  - [x] Keep voice mode available with text fallback path and no keyboard-only dependency.
- [x] Add deterministic tests for plausibility, persistence, and reward blocking (AC: 1)
  - [x] Unit tests for reflection validation and plausibility decision mapping.
  - [x] Integration tests for: eligible session -> reflection submit -> pass/fail persistence path.
  - [x] Regression tests to ensure Story 1.4 integrity gate remains authoritative and Story 1.6 reward flow is not triggered early.

## Dev Notes

### Story Context and Intent

- Story 1.5 introduces the post-session reflection checkpoint and plausibility decision before any card award flow.
- Scope is reflection capture + plausibility decision + persistence + eligibility signaling only.
- Do not implement card reveal or deck award logic here (that belongs to Story 1.6).

### Epic Context (Cross-Story Guardrails)

- Story 1.4 already enforces minimum-duration integrity and sets `ready_for_reward` status.
- Story 1.5 must consume this status and avoid duplicating or bypassing integrity rules.
- Story 1.6 depends on this story's pass/fail output as the final gate before card awarding.

### Technical Requirements

- Reflection submission is allowed only for sessions that pass Story 1.4 gate.
- Reflection plausibility output must be explicit and typed:
  - pass -> plausible
  - fail -> implausible
  - include reason code for auditable behavior
- Standardized boundary envelope required everywhere:
  - Success: `{ ok: true, data }`
  - Failure: `{ ok: false, error: { code, message, retriable } }`
- Empty/whitespace reflection must be treated as implausible and block reward progression.
- Use UTC ISO-8601 timestamps for persisted reflection records.

### Architecture Compliance

- Keep layer responsibilities strict:
  - `domain/`: reflection rules and plausibility decision modeling
  - `application/`: orchestration and gating decisions
  - `infrastructure/`: provider/network + persistence wiring
  - `ui/`: reflection capture and status messaging
- UI must not call provider clients or SQLite directly.
- Reuse existing repository and persistence adapters instead of introducing parallel storage channels.
- Continue structured logging pattern for blocked/failed paths (`feature`, `operation`, `correlationId`, `errorCode`).

### Library and Framework Requirements

- Maintain Expo SDK 55 baseline and current React Native app patterns.
- If voice reflection recording is implemented in this story, use Expo's current audio module (`expo-audio`) and proper microphone permission flow.
- If voice recording is deferred behind fallback in this story, preserve a functional `voice` mode with text fallback UX and typed `reflectionMode` persistence.
- Keep SQLite access parameterized/prepared for user-provided reflection content.

### File Structure Requirements

- Expected touch points (minimum):
  - `app/session/index.tsx`
  - `src/features/sessions/domain/*` (new reflection rule models)
  - `src/features/sessions/application/*` (reflection submit + plausibility orchestration)
  - `src/features/sessions/infrastructure/*` (provider/persistence integration)
  - `src/database/repositories/session-repository.ts`
  - `src/database/repositories/mappers.ts` (if mapping extension needed)
  - `tests/sessions/*.test.ts`
- Keep classification concerns under `features/classification` and reflection concerns under `features/sessions` unless a shared AI adapter is intentionally extracted.

### Testing Requirements

- Add deterministic boundary tests:
  - empty reflection -> implausible
  - valid reflection -> plausible/implausible mapping path
  - provider timeout/unavailable -> fallback policy behavior
- Add integration tests:
  - 30-minute eligible session -> reflection stored -> plausibility status persisted
  - implausible/empty reflection blocks reward continuation
- Add regression tests:
  - Story 1.4 gate remains prerequisite
  - Story 1.3 classification/manual selection flow not regressed
- Quality gates to run:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build:check`

### Previous Story Intelligence

- Story 1.4 established the authoritative reward eligibility gate; do not fork this logic.
- Story 1.4 review remediations introduced atomic integrity state persistence and lifecycle-safe timer behavior; preserve these guarantees.
- Story 1.3 introduced classification provider envelope patterns and manual fallback UX conventions that should be mirrored for plausibility evaluation.

### Git Intelligence Summary

- Recent merges show Story 1.3 and Story 1.4 touching the same session flow and repository surfaces (`app/session/index.tsx`, `session-repository.ts`, persistence adapters).
- New Story 1.5 work should extend these files in-place to minimize route and persistence divergence.
- Review-sensitive files from latest commits:
  - `app/session/index.tsx`
  - `src/database/repositories/session-repository.ts`
  - `src/features/sessions/application/attempt-session-reward.ts`
  - `src/features/sessions/infrastructure/start-session-persistence.*`

### Latest Tech Information

- Expo SDK docs indicate `expo-audio` is the current module for recording/playback; microphone usage requires explicit permission handling and app-config plugin settings for production builds when recording is used.
- Expo SQLite guidance continues to recommend parameter binding/prepared statements for user input and `PRAGMA user_version` migration discipline.
- React Native 0.84 `TextInput` guidance confirms multiline + submit behavior nuances (`submitBehavior`) that matter for reflection submit UX.

### Project Context Reference

- No `project-context.md` file found in repository scan.

### Story Completion Status

- Story status set to `ready-for-dev`.
- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created.

### References

- Story 1.5 source definition: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Submit Reflection and Run Plausibility Check]
- Epic 1 context: [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Session-to-Card Core Loop]
- Session integrity and reflection flow context: [Source: _bmad-output/gdd.md#Session Integrity Specifications]
- Architecture boundaries and consistency rules: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- Project structure and integration boundaries: [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Previous story learnings: [Source: _bmad-output/implementation-artifacts/1-4-enforce-30-minute-integrity-gate-with-reliable-timer.md#Previous Story Intelligence]
- Expo Audio docs: [Source: https://docs.expo.dev/versions/latest/sdk/audio/]
- Expo SQLite docs: [Source: https://docs.expo.dev/versions/latest/sdk/sqlite/]
- React Native TextInput docs: [Source: https://reactnative.dev/docs/textinput]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Loaded and followed `.opencode/skills/gds-create-story/SKILL.md` and workflow assets.
- Loaded config from `_bmad/gds/config.yaml`.
- Parsed target story input `1.5` as key `1-5-submit-reflection-and-run-plausibility-check`.
- Loaded planning artifacts: `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/planning-artifacts/architecture.md`, and `_bmad-output/gdd.md`.
- Loaded previous story context from `_bmad-output/implementation-artifacts/1-4-enforce-30-minute-integrity-gate-with-reliable-timer.md`.
- Analyzed recent git commit history and changed-file patterns for implementation continuity.
- Pulled latest technical references for Expo Audio, Expo SQLite, and React Native TextInput.
- Implemented reflection input contract validation and typed reflection evaluation envelope in sessions domain/application.
- Added reflection plausibility provider boundary with timeout/error classification and deterministic local fallback policy.
- Wired reflection persistence flow through native/web infrastructure adapters using provider boundary.
- Added and executed reflection integration tests for fallback and non-retriable provider failure behavior.
- Executed quality gates: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build:check`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 1.5 implementation guardrails include integrity-gate dependency, plausibility provider boundaries, persistence mapping, and regression protections.
- Sprint tracking state updated from `backlog` to `ready-for-dev` for Story 1.5.
- Story moved to `review` after all tasks/subtasks were completed and validated.
- Reflection flow now supports provider-backed plausibility evaluation with retriable-error fallback to deterministic local rules.
- Regression checks confirm Story 1.4 integrity gate remains authoritative and reward flow is still blocked on implausible/empty reflections.
- Code review fixes applied: added repository update path for reflections, corrected reflection form retry UX, and aligned story File List with actual changes.

### Change Log

- 2026-03-17: Implemented Story 1.5 reflection plausibility flow, provider boundary with timeout/fallback handling, persistence integration, and deterministic tests; advanced status to `review`.
- 2026-03-17: Code review remediations applied; all HIGH/MEDIUM findings resolved and story advanced to `done`.

### File List

- _bmad-output/implementation-artifacts/1-5-submit-reflection-and-run-plausibility-check.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- app/session/index.tsx
- src/database/repositories/session-repository.ts
- src/features/sessions/domain/session-reflection.ts
- src/features/sessions/application/submit-session-reflection.ts
- src/features/sessions/application/reflection-plausibility-provider.ts
- src/features/sessions/infrastructure/remote-reflection-plausibility-provider.ts
- src/features/sessions/infrastructure/start-session-persistence.native.ts
- src/features/sessions/infrastructure/start-session-persistence.ts
- src/features/sessions/infrastructure/start-session-persistence.web.ts
- tests/sessions/session-reflection.domain.test.ts
- tests/sessions/session-reflection.integration.test.ts

## Senior Developer Review (AI)

### Review Date

2026-03-17

### Reviewer

Link Freeman (gds-code-review)

### Outcome

Approve

### Summary

- Verified AC implementation evidence across UI, application, infrastructure, repository, and tests.
- Detected and fixed one HIGH and two MEDIUM issues from adversarial review.
- Confirmed story claims align with current git changes and final file list.

### Findings Resolved

- [x] [HIGH] Task/claim mismatch: added repository update path for `session_reflections` (`create` + `update` support).
- [x] [MEDIUM] Story File List mismatch: included `src/features/sessions/infrastructure/start-session-persistence.ts`.
- [x] [MEDIUM] UX contradiction: implausible reflection now allows retry submission without leaving flow.
