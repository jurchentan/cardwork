import assert from "node:assert/strict";
import test from "node:test";

import { classifySessionIntent } from "@/features/classification/application/classify-session";

test("classifySessionIntent returns remote result when provider succeeds", async () => {
  const result = await classifySessionIntent(
    {
      async classifyIntent(intentText: string) {
        assert.equal(intentText, "Write architecture notes");
        return {
          ok: true,
          data: {
            workTypeTag: "deep_focus",
            classifierSource: "remote"
          }
        };
      }
    },
    "Write architecture notes"
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("expected remote classification to succeed");
  }

  assert.equal(result.data.requiresManualSelection, false);
  assert.equal(result.data.classification?.workTypeTag, "deep_focus");
  assert.equal(result.data.classification?.classifierSource, "remote");
  assert.equal(result.data.manualOptions.length, 4);
});

test("classifySessionIntent falls back to manual options when provider fails", async () => {
  const result = await classifySessionIntent(
    {
      async classifyIntent() {
        return {
          ok: false,
          error: {
            code: "CLASSIFIER_TIMEOUT",
            message: "Classifier timed out",
            retriable: true
          }
        };
      }
    },
    "Quick workout"
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("expected fallback response");
  }

  assert.equal(result.data.requiresManualSelection, true);
  assert.equal(result.data.classification, null);
  assert.deepEqual(
    result.data.manualOptions.map((option) => option.tag),
    ["deep_focus", "physical", "learning", "recovery"]
  );
  assert.equal(result.data.failure?.code, "CLASSIFIER_TIMEOUT");
});
