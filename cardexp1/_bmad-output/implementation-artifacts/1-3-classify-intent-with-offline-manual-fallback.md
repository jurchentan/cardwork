# Story 1.3: Classify Intent with Offline Manual Fallback

Status: review

## Story

As a player,
I want my session intent classified into a work type even when network/API fails,
so that I can always continue the loop.

## Acceptance Criteria

1. **Given** I start a session with an intent
   **When** classifier service is available
   **Then** intent is tagged as Deep Focus, Physical, Learning, or Recovery
   **And** if classification fails/offline, I can manually choose from the same four options without blocking session flow.

## Tasks / Subtasks

- [x] Add canonical work-type domain contract and validation (AC: 1)
  - [x] Create work-type enum/union for `deep_focus`, `physical`, `learning`, `recovery` with display labels mapped to `Deep Focus`, `Physical`, `Learning`, `Recovery`.
  - [x] Add classifier result type using result-envelope conventions (`ok | error`) with stable error codes.
  - [x] Add mapping helpers between DB values and app-facing values where needed.
- [x] Implement classifier provider boundary with remote + fallback behavior (AC: 1)
  - [x] Add `ClassifierProvider` interface and remote implementation in `src/features/classification/infrastructure/`.
  - [x] Enforce bounded timeout (target <= 2s), classify retriable vs fatal errors, and return typed failure envelopes.
  - [x] Implement manual fallback path that always exposes the four tag options when remote classification is unavailable.
- [x] Persist classification outcome to `session_intents` without breaking active session flow (AC: 1)
  - [x] Extend `SessionRepository` with update/read methods for `work_type_tag` and `classifier_source`.
  - [x] Keep DB `snake_case` <-> app `camelCase` mapping at repository boundary.
  - [x] Preserve currently working session start and timer integrity behavior from Stories 1.2 and 1.4.
- [x] Add UI fallback interaction to continue session flow (AC: 1)
  - [x] Show non-blocking classification state after intent submit in session start flow.
  - [x] If remote classification fails or network is unavailable, present 4-option manual selector immediately.
  - [x] Save chosen/manual tag and keep the user in active session flow without adding extra blocking steps.
- [x] Add deterministic tests for classification success/fallback and persistence (AC: 1)
  - [x] Unit tests for classification mapping, timeout/error handling, and manual fallback policy.
  - [x] Integration tests for end-to-end path: start session -> classify success OR manual fallback -> persisted `work_type_tag` + `classifier_source`.
  - [x] Regression tests to verify Story 1.2 two-tap/session-start behavior and Story 1.4 integrity gate flow remain intact.

## Dev Notes

### Story Context and Intent

- This story adds intent classification to the existing session start loop, including a guaranteed manual fallback path.
- Scope is classification and fallback only; do not implement reflection plausibility checks, card award, or weekly progression logic.

### Technical Requirements

- Work type outputs must be constrained to exactly four labels in this story:
  - `Deep Focus`
  - `Physical`
  - `Learning`
  - `Recovery`
- Service boundaries must return standardized envelopes:
  - Success: `{ ok: true, data }`
  - Failure: `{ ok: false, error: { code, message, retriable } }`
- Keep classifier decision flow deterministic:
  - try remote provider
  - on timeout/offline/failure, switch to manual tag selection immediately
  - never block session flow when classifier path fails
- Persist classification in `session_intents.work_type_tag` and source metadata in `session_intents.classifier_source`.
- Use UTC ISO-8601 timestamps where new timestamps are introduced.

### Architecture Compliance

- Follow layered boundaries:
  - `domain/` for pure rules and value constraints
  - `application/` for orchestration and fallback policy
  - `infrastructure/` for provider/network concerns
  - `ui/` for rendering and interaction
- UI must not call provider clients or SQLite directly.
- Keep side effects (remote calls, persistence updates) in application/infrastructure layers.
- Keep error classification explicit: user-correctable vs retriable vs fatal.
- Keep event/result naming and boundary patterns aligned with architecture consistency rules.

### Library and Framework Requirements

- Preserve Expo SDK 55 baseline and existing app structure.
- If network state checks are needed for proactive fallback UX, use `expo-network` APIs rather than ad-hoc platform checks.
- Keep SQLite interactions parameterized/prepared for user input paths.
- Keep remote classifier implementation adapter-based and replaceable (no provider logic in UI components).

### File Structure Requirements

- Add/align classification module under:
  - `src/features/classification/domain/`
  - `src/features/classification/application/`
  - `src/features/classification/infrastructure/`
  - `src/features/classification/ui/` (if reusable UI elements are introduced)
- Expected touch points for this story include:
  - `app/session/index.tsx`
  - `src/features/sessions/ui/session-start-flow.ts`
  - `src/database/repositories/session-repository.ts`
  - `src/database/repositories/mappers.ts` (only if mapping utilities require extension)
- Keep cross-feature reusable code in `src/shared/*` and avoid session-specific logic leakage.

### Testing Requirements

- Add/expand tests for:
  - classifier available path returns one of four allowed tags
  - timeout/offline path triggers manual fallback without blocking session start
  - persistence updates store both `work_type_tag` and `classifier_source`
  - existing Story 1.2 and Story 1.4 flows remain green
- Validate with project quality gates:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build:check`

### Previous Story Intelligence

- Story 1.2 established the active session start route and two-tap contract; keep `/session` flow behavior stable.
- Previous review remediations fixed route divergence and web behavior; avoid introducing parallel route logic or bypassing router flow.
- Current persistence patterns already handle web fallbacks and typed result envelopes; extend those patterns instead of adding alternate persistence channels.

### Git Intelligence Summary

- Recent commits show Story 1.4 added timer checkpoint and integrity-gate logic in `SessionRepository` and session infrastructure.
- Story 1.2 commits show session start + intent persistence behavior stabilized after review fixes.
- Implementation for this story should avoid regressions in:
  - `app/session/index.tsx` runtime path
  - `src/features/sessions/infrastructure/start-session-persistence.*`
  - `tests/sessions/start-session.integration.test.ts`
  - integrity tests under `tests/sessions/session-integrity.*`

### Latest Tech Information

- Expo docs (Mar 2026) still require explicit SDK 55 template command for SDK 55 projects:
  - `npx create-expo-app@latest --template default@sdk-55`
- `expo-sqlite` guidance emphasizes prepared statements/parameter binding for user input and continued use of `PRAGMA user_version` migration discipline.
- `expo-network` provides `getNetworkStateAsync` and `useNetworkState` helpers suitable for detecting connectivity and triggering manual fallback UX promptly.

### Project Context Reference

- No `project-context.md` file found in repository scan.

### References

- Story 1.3 source definition: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Classify Intent with Offline Manual Fallback]
- Epic 1 context: [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Session-to-Card Core Loop]
- Session integrity + offline fallback requirements: [Source: _bmad-output/gdd.md#Session Integrity Specifications]
- AI classification constraints and latency target: [Source: _bmad-output/gdd.md#AI Classification Requirements]
- Architecture boundaries and patterns: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- Project structure and integration boundaries: [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Expo create-app docs: [Source: https://docs.expo.dev/more/create-expo/]
- Expo SQLite docs: [Source: https://docs.expo.dev/versions/latest/sdk/sqlite/]
- Expo Network docs: [Source: https://docs.expo.dev/versions/latest/sdk/network/]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Executed `gds-create-story` workflow for explicit target story input `1.3`.
- Loaded workflow assets from `.opencode/skills/gds-create-story/` (`workflow.md`, `template.md`, `checklist.md`, `discover-inputs.md`).
- Loaded planning artifacts: `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/planning-artifacts/architecture.md`, and supplemental `_bmad-output/gdd.md`.
- Loaded implementation context: `_bmad-output/implementation-artifacts/sprint-status.yaml` and previous story `_bmad-output/implementation-artifacts/1-2-capture-session-intent-and-start-a-session-in-two-taps.md`.
- Analyzed recent git commits for established patterns and regression-sensitive files.
- Loaded and followed `.opencode/skills/gds-dev-story/SKILL.md` and `.opencode/skills/gds-dev-story/workflow.md` for Story 1.3.
- Updated sprint status `ready-for-dev -> in-progress` before implementation and advanced to `review` after completion gates passed.
- Executed red-green-refactor for classification domain/application/infrastructure and session persistence updates.
- Validation run results: `npm run test` pass, `npm run typecheck` pass, `npm run lint` pass (Node version warning only), `npm run build:check` pass.

### Implementation Plan

- Add classification domain contract (tags, labels, source constants) and application orchestration for remote-first then manual fallback behavior.
- Add a replaceable remote classifier provider with bounded timeout and retriable/fatal error envelope handling.
- Extend session persistence layer to store `work_type_tag` and `classifier_source` for latest intent record by session.
- Integrate classification flow into the session UI so session start never blocks and manual fallback can be selected immediately.
- Add unit + integration + regression coverage for classify success/fallback and persistence behavior.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story context includes explicit architecture, fallback, persistence, and regression guardrails for implementation.
- Sprint tracking status advanced from `backlog` to `ready-for-dev` for this story.
- Added canonical work-type contract with the four required tags and player-facing labels.
- Implemented remote classifier provider with timeout guard and typed failure envelopes, plus manual fallback options.
- Extended `SessionRepository` with `updateIntentClassification` and persisted latest intent classification metadata.
- Integrated classify-on-session-start flow in `app/session/index.tsx` with non-blocking state and 4-option manual selector.
- Added deterministic unit and integration tests for classify-session behavior and session-intent persistence.
- Verified Story 1.2 and 1.4 regression coverage by running full suite and quality checks.

### File List

- _bmad-output/implementation-artifacts/1-3-classify-intent-with-offline-manual-fallback.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- app/session/index.tsx
- src/database/repositories/session-repository.ts
- src/features/classification/application/classify-and-persist-session-intent.ts
- src/features/classification/application/classify-session.ts
- src/features/classification/domain/work-type.ts
- src/features/classification/infrastructure/remote-classifier-provider.ts
- src/features/sessions/domain/session-start.ts
- src/features/sessions/infrastructure/start-session-persistence.native.ts
- src/features/sessions/infrastructure/start-session-persistence.ts
- src/features/sessions/infrastructure/start-session-persistence.web.ts
- tests/classification/classify-session.application.test.ts
- tests/classification/work-type.domain.test.ts
- tests/sessions/intent-classification.integration.test.ts

## Change Log

- 2026-03-17: Implemented Story 1.3 intent classification with remote-first + manual fallback flow, persisted classification metadata, added tests, and advanced story to review.
