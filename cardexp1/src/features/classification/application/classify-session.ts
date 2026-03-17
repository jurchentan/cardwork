import {
  CLASSIFIER_REMOTE_SOURCE,
  type ClassifierResult,
  WORK_TYPE_TAGS,
  type WorkTypeTag,
  toWorkTypeTagLabel
} from "@/features/classification/domain/work-type";
import type { Result } from "@/shared/result/result";

type ManualOption = {
  tag: WorkTypeTag;
  label: string;
};

export type SessionIntentClassificationOutcome = {
  classification: { workTypeTag: WorkTypeTag; classifierSource: typeof CLASSIFIER_REMOTE_SOURCE } | null;
  requiresManualSelection: boolean;
  manualOptions: ManualOption[];
  failure?: {
    code: string;
    message: string;
    retriable: boolean;
  };
};

export type IntentClassifier = {
  classifyIntent(intentText: string): Promise<ClassifierResult>;
};

function buildManualOptions(): ManualOption[] {
  return WORK_TYPE_TAGS.map((tag) => ({
    tag,
    label: toWorkTypeTagLabel(tag)
  }));
}

export async function classifySessionIntent(
  classifier: IntentClassifier,
  intentText: string
): Promise<Result<SessionIntentClassificationOutcome>> {
  const manualOptions = buildManualOptions();
  const trimmedIntent = intentText.trim();

  if (!trimmedIntent) {
    return {
      ok: true,
      data: {
        classification: null,
        requiresManualSelection: true,
        manualOptions,
        failure: {
          code: "INTENT_TEXT_REQUIRED",
          message: "Session input is invalid",
          retriable: false
        }
      }
    };
  }

  const result = await classifier.classifyIntent(trimmedIntent);
  if (result.ok) {
    return {
      ok: true,
      data: {
        classification: {
          workTypeTag: result.data.workTypeTag,
          classifierSource: CLASSIFIER_REMOTE_SOURCE
        },
        requiresManualSelection: false,
        manualOptions
      }
    };
  }

  return {
    ok: true,
    data: {
      classification: null,
      requiresManualSelection: true,
      manualOptions,
      failure: {
        code: result.error.code,
        message: result.error.message,
        retriable: result.error.retriable
      }
    }
  };
}
