# Pipeline Workflow Checklist

## Pre-execution Checklist

Before running the pipeline, verify:

- [ ] Story file exists in `_bmad-output/implementation-artifacts/`
- [ ] Story has Status: `ready-for-dev`
- [ ] Story has at least one Acceptance Criterion
- [ ] Story has at least one Task/Subtask
- [ ] `sprint-status.yaml` exists (or explicit story path provided)
- [ ] `project-context.md` exists in docs folder (recommended)
- [ ] Architecture docs exist in `_bmad-output/planning-artifacts/` (recommended)

## Phase Completion Checklist

### Phase 0: INIT
- [ ] Story file discovered or loaded from provided path
- [ ] Story key extracted
- [ ] Story file structure parsed

### Phase 1: VALIDATION & PREPARATION
- [ ] Acceptance Criteria validated (not empty)
- [ ] Tasks/Subtasks validated (not empty)
- [ ] Dev Notes enriched with architectural context (if sparse)
- [ ] Story status updated to `in-progress`
- [ ] `sprint-status.yaml` updated

### Phase 2: IMPLEMENTATION (TDD)
For each task/subtask:
- [ ] RED: Failing test(s) written
- [ ] GREEN: Implementation passes new test(s)
- [ ] REFACTOR: Code quality improved
- [ ] REGRESSION: Full test suite passes (100%)
- [ ] Task marked [x] in story file
- [ ] File List updated
- [ ] Change Log updated
- [ ] Dev Agent Record updated

### Phase 3: TESTING & LINTING
- [ ] Full test suite executed (100% pass)
- [ ] Type checking passed (if TypeScript)
- [ ] Linter executed (no errors)
- [ ] Formatter applied (if needed)

### Phase 4: DEFINITION OF DONE
- [ ] All Acceptance Criteria satisfied
- [ ] All Tasks/Subtasks checked [x]
- [ ] File List complete
- [ ] Dev Agent Record has Completion Notes
- [ ] Change Log has entry
- [ ] Story status updated to `review`
- [ ] `sprint-status.yaml` updated

### Phase 5: CODE REVIEW
- [ ] Code review workflow executed
- [ ] HIGH severity findings auto-addressed
- [ ] MEDIUM/LOW findings documented
- [ ] Review results added to Dev Agent Record

### Phase 6: SUMMARY
- [ ] Pipeline metrics calculated
- [ ] Summary report generated
- [ ] Next steps provided to user

## Post-execution Checklist

After pipeline completes:

- [ ] Review `git diff` for all changes
- [ ] Review story file for implementation notes
- [ ] Review code review findings
- [ ] Run tests manually: `pnpm test`
- [ ] Verify story status is `review`
- [ ] If satisfied, merge branch
- [ ] Update `sprint-status.yaml` to `done`

## HALT Conditions

Pipeline will HALT for:

- [ ] No `ready-for-dev` story found
- [ ] Missing Acceptance Criteria
- [ ] Missing Tasks/Subtasks
- [ ] 3 consecutive implementation failures on same task
- [ ] Type errors requiring architecture decision
- [ ] Lint errors that can't be auto-fixed (if `auto_fix_lint: false`)
- [ ] HIGH severity code review finding that can't be auto-fixed

## Configuration Options

In `workflow.yaml`:

- `story_file`: Explicit story path (leave empty for auto-discovery)
- `skip_code_review`: Set to `true` to skip Phase 5 (not recommended)
- `auto_fix_lint`: Set to `false` to require manual lint fixes
- `max_implementation_retries`: Number of retries before HALT (default: 3)
