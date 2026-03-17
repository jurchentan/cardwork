import assert from "node:assert/strict";
import test from "node:test";

import { createRemoteClassifierProvider } from "@/features/classification/infrastructure/remote-classifier-provider";

test("remote classifier timeout is retriable", async () => {
  const provider = createRemoteClassifierProvider({
    timeoutMs: 1,
    classifyIntentRemote: async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { workTypeTag: "deep_focus" };
    }
  });

  const result = await provider.classifyIntent("Write chapter draft");
  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("expected timeout error");
  }

  assert.equal(result.error.code, "CLASSIFIER_TIMEOUT");
  assert.equal(result.error.retriable, true);
});

test("remote classifier fatal failure is non-retriable", async () => {
  const provider = createRemoteClassifierProvider({
    classifyIntentRemote: async () => {
      throw new Error("INVALID_API_KEY");
    }
  });

  const result = await provider.classifyIntent("Write chapter draft");
  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("expected classification failure");
  }

  assert.equal(result.error.code, "CLASSIFIER_FAILURE");
  assert.equal(result.error.retriable, false);
});
