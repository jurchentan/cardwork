import assert from "node:assert/strict";
import test from "node:test";

import { startSession } from "@/features/sessions/application/start-session";
import {
  isValidSessionIntentMode,
  validateStartSessionInput
} from "@/features/sessions/domain/session-start";

test("intent mode validation accepts text and voice only", () => {
  assert.equal(isValidSessionIntentMode("text"), true);
  assert.equal(isValidSessionIntentMode("voice"), true);
  assert.equal(isValidSessionIntentMode("gesture"), false);
});

test("start session input requires non-empty intent", () => {
  assert.equal(
    validateStartSessionInput({
      intentText: "   ",
      inputMode: "text"
    }),
    "INTENT_TEXT_REQUIRED"
  );
});

test("startSession returns validation error envelope for invalid input", async () => {
  const result = await startSession(
    {
      async startSession() {
        throw new Error("repository should not be called when input is invalid");
      }
    },
    {
      intentText: "",
      inputMode: "voice"
    }
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "INTENT_TEXT_REQUIRED");
  }
});
