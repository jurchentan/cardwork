import assert from "node:assert/strict";
import test from "node:test";

import {
  MINIMUM_REFLECTION_LENGTH,
  evaluateReflectionPlausibility
} from "@/features/sessions/domain/session-reflection";

test("empty reflection is implausible and blocks reward", () => {
  const result = evaluateReflectionPlausibility("   ");

  assert.equal(result.plausibilityStatus, "implausible");
  assert.equal(result.reasonCode, "REFLECTION_EMPTY");
  assert.equal(result.rewardEligible, false);
  assert.equal(result.revengeTaskAssigned, true);
});

test("short reflection is implausible and blocks reward", () => {
  const shortReflection = "good work";
  assert.equal(shortReflection.length < MINIMUM_REFLECTION_LENGTH, true);

  const result = evaluateReflectionPlausibility(shortReflection);

  assert.equal(result.plausibilityStatus, "implausible");
  assert.equal(result.reasonCode, "REFLECTION_TOO_SHORT");
  assert.equal(result.rewardEligible, false);
  assert.equal(result.revengeTaskAssigned, true);
});

test("sufficiently long reflection is plausible", () => {
  const result = evaluateReflectionPlausibility(
    "I completed the architecture review, fixed two test failures, and documented follow-up tasks for tomorrow."
  );

  assert.equal(result.plausibilityStatus, "plausible");
  assert.equal(result.reasonCode, null);
  assert.equal(result.rewardEligible, true);
  assert.equal(result.revengeTaskAssigned, false);
});
