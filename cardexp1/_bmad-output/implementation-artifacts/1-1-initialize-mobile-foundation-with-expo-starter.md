# Story 1.1: Initialize Mobile Foundation with Expo Starter

Status: ready-for-dev

## Story

As a developer,
I want to initialize the project using the mandated Expo starter and baseline architecture boundaries,
so that all subsequent gameplay stories are built on a consistent, approved foundation.

## Acceptance Criteria

1. **Given** no initialized mobile app project
   **When** the project is scaffolded with `npx create-expo-app@latest --template default@sdk-55`
   **Then** the app boots successfully in development
   **And** the baseline folder structure and typed config conventions are established for feature-sliced implementation.

## Tasks / Subtasks

- [ ] Initialize the Expo SDK 55 project foundation (AC: 1)
  - [ ] Scaffold app with `npx create-expo-app@latest --template default@sdk-55` at repo root
  - [ ] Confirm development boot success locally (Expo start + default app render)
  - [ ] Commit generated Expo baseline config files (`package.json`, `app.json`, `tsconfig.json`, Metro/Babel config as generated)
- [ ] Establish architecture-aligned baseline structure (AC: 1)
  - [ ] Create feature-first scaffolding under `src/features/` with domain/application/infrastructure/ui layer folders for `sessions`, `cards`, `battle`, `weekly-cycle`, and `notifications`
  - [ ] Create shared technical primitives folders under `src/shared/` (`errors`, `result`, `events`, `time`, `logging`, `validation`)
  - [ ] Create data/config scaffolding under `src/database/` (`migrations/`, `repositories/`) and `src/config/env/`
  - [ ] Add route skeleton folders under `app/` (`session`, `deck`, `battle`, `weekly`, `settings`) without implementing gameplay logic yet
- [ ] Set typed configuration conventions and guardrails (AC: 1)
  - [ ] Add typed env contract files in `src/config/env/` (schema + parser entrypoint)
  - [ ] Add result envelope base type in `src/shared/result/result.ts` (`{ ok: true, data } | { ok: false, error }`)
  - [ ] Add naming and boundary mapping notes in code-level docs/README stubs to enforce DB `snake_case` to app `camelCase`
- [ ] Add foundational quality gates for follow-on stories (AC: 1)
  - [ ] Configure lint/typecheck/test scripts in `package.json` (minimum runnable placeholders acceptable if no tests yet)
  - [ ] Add at least one smoke test proving app/module resolution works in CI context
  - [ ] Ensure baseline passes lint/typecheck/test/build validation commands used by project pipeline

## Dev Notes

### Story Context and Intent

- This is the mandatory first implementation story and defines the technical baseline for all subsequent stories.
- Do not implement gameplay logic here; focus on initialization, structure, and enforceable conventions.

### Technical Requirements

- Must use the exact initialization command: `npx create-expo-app@latest --template default@sdk-55`.
- Expo SDK 55 transition note: `create-expo-app@latest` without `--template` can default to SDK 54 during transition; keep explicit template flag.
- Keep stack TypeScript-first and Expo-managed.
- Do not add non-required heavy runtime dependencies in this story.

### Architecture Compliance

- Use feature-first boundaries:
  - `src/features/<feature>/{domain,application,infrastructure,ui}`
  - `src/shared/*` for cross-cutting concerns.
- Preserve strict layer rules:
  - UI does not call SQLite/provider clients directly.
  - Side effects belong in application/infrastructure layers.
- Enforce data boundary contract:
  - DB layer uses `snake_case`.
  - App/domain layer uses `camelCase`.
  - Mapping occurs at repository boundary.

### File Structure Requirements

- Ensure repository contains baseline top-level files expected by architecture (`app/`, `src/`, `assets/`, `tests/`, config files).
- Create only scaffolding needed for architecture readiness; avoid speculative feature code.
- Co-locate unit tests as `*.test.ts(x)` when creating initial modules.

### Testing Requirements

- Add a smoke-level verification for initialization (boot or module import path) to prevent broken starting state.
- Ensure baseline quality scripts exist and run:
  - typecheck
  - lint
  - test
  - build validation (Expo-compatible)
- Maintain deterministic, non-flaky checks suitable for CI.

### Latest Tech Information

- Expo create-app docs (Mar 2026) still document `--template default@sdk-55` as the required explicit command path for SDK 55 projects.
- `expo-sqlite` remains the recommended local DB package for Expo and supports persistence across app restarts; this story only prepares structure, while SQLite integration begins in later data-layer stories.
- For later DB stories, prefer prepared statements for user input paths and set `PRAGMA user_version` migration workflow as defined in architecture.

### Project Structure Notes

- Planned structure should align with architecture's canonical tree for `app/*`, `src/features/*`, `src/database/*`, `src/shared/*`, and `tests/*`.
- No known structure variance is required for this story.

### References

- Epic source and AC: [Source: _bmad-output/planning-artifacts/epics.md#Epic 1: Session-to-Card Core Loop]
- Story 1.1 definition: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Initialize Mobile Foundation with Expo Starter]
- Starter command + rationale: [Source: _bmad-output/planning-artifacts/architecture.md#Selected Starter: Expo (React Native Framework)]
- First implementation priority: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Handoff]
- Structure and boundary rules: [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Pattern conventions: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- Expo create-app latest docs: [Source: https://docs.expo.dev/more/create-expo/]
- Expo SQLite latest docs: [Source: https://docs.expo.dev/versions/latest/sdk/sqlite/]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Loaded workflow + template/checklist from `.opencode/skills/gds-create-story/`
- Loaded planning artifacts from `_bmad-output/planning-artifacts/epics.md` and `_bmad-output/planning-artifacts/architecture.md`
- Loaded sprint tracking from `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Resolved target story from first backlog entry: `1-1-initialize-mobile-foundation-with-expo-starter`

### Completion Notes List

- Comprehensive story context created from epics + architecture with implementation guardrails.
- Story focuses on scaffolding, conventions, and CI-readiness only (no gameplay implementation scope).
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

- _bmad-output/implementation-artifacts/1-1-initialize-mobile-foundation-with-expo-starter.md

## Change Log

- 2026-03-17: Created Story 1.1 with full developer context, architecture guardrails, testing expectations, and references.
