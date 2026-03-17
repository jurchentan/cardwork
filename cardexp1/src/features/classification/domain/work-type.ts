import type { Result } from "@/shared/result/result";

export const WORK_TYPE_TAGS = ["deep_focus", "physical", "learning", "recovery"] as const;

export type WorkTypeTag = (typeof WORK_TYPE_TAGS)[number];

export const WORK_TYPE_TAG_LABELS: Record<WorkTypeTag, string> = {
  deep_focus: "Deep Focus",
  physical: "Physical",
  learning: "Learning",
  recovery: "Recovery"
};

export const CLASSIFIER_REMOTE_SOURCE = "remote" as const;
export const CLASSIFIER_MANUAL_SOURCE = "manual" as const;

export type ClassifierSource = typeof CLASSIFIER_REMOTE_SOURCE | typeof CLASSIFIER_MANUAL_SOURCE;

export type IntentClassification = {
  workTypeTag: WorkTypeTag;
  classifierSource: ClassifierSource;
};

export type ClassifierResult = Result<IntentClassification>;

export function isValidWorkTypeTag(value: string): value is WorkTypeTag {
  return WORK_TYPE_TAGS.includes(value as WorkTypeTag);
}

export function toWorkTypeTagLabel(workTypeTag: WorkTypeTag): string {
  return WORK_TYPE_TAG_LABELS[workTypeTag];
}
