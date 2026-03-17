import assert from "node:assert/strict";
import test from "node:test";

import {
  CLASSIFIER_MANUAL_SOURCE,
  CLASSIFIER_REMOTE_SOURCE,
  WORK_TYPE_TAG_LABELS,
  WORK_TYPE_TAGS,
  isValidWorkTypeTag,
  toWorkTypeTagLabel
} from "@/features/classification/domain/work-type";

test("work type tags are restricted to the four allowed values", () => {
  assert.deepEqual(WORK_TYPE_TAGS, ["deep_focus", "physical", "learning", "recovery"]);
  assert.equal(isValidWorkTypeTag("deep_focus"), true);
  assert.equal(isValidWorkTypeTag("physical"), true);
  assert.equal(isValidWorkTypeTag("learning"), true);
  assert.equal(isValidWorkTypeTag("recovery"), true);
  assert.equal(isValidWorkTypeTag("other"), false);
});

test("work type label mapping returns player-facing values", () => {
  assert.equal(toWorkTypeTagLabel("deep_focus"), "Deep Focus");
  assert.equal(toWorkTypeTagLabel("physical"), "Physical");
  assert.equal(toWorkTypeTagLabel("learning"), "Learning");
  assert.equal(toWorkTypeTagLabel("recovery"), "Recovery");

  assert.deepEqual(WORK_TYPE_TAG_LABELS, {
    deep_focus: "Deep Focus",
    physical: "Physical",
    learning: "Learning",
    recovery: "Recovery"
  });
});

test("classifier source constants remain stable", () => {
  assert.equal(CLASSIFIER_REMOTE_SOURCE, "remote");
  assert.equal(CLASSIFIER_MANUAL_SOURCE, "manual");
});
