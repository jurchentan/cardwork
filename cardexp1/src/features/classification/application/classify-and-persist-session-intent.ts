import {
  CLASSIFIER_REMOTE_SOURCE,
  type WorkTypeTag,
  type ClassifierSource
} from "@/features/classification/domain/work-type";
import { classifySessionIntent, type IntentClassifier } from "@/features/classification/application/classify-session";
import type { Result } from "@/shared/result/result";

type ClassificationPersistence = {
  updateIntentClassification(input: {
    sessionId: string;
    workTypeTag: WorkTypeTag;
    classifierSource: ClassifierSource;
  }): Promise<Result<void>>;
};

export async function classifyAndPersistSessionIntent(
  persistence: ClassificationPersistence,
  classifier: IntentClassifier,
  input: {
    sessionId: string;
    intentText: string;
  }
) {
  const classified = await classifySessionIntent(classifier, input.intentText);
  if (!classified.ok) {
    return classified;
  }

  if (!classified.data.classification) {
    return classified;
  }

  const persisted = await persistence.updateIntentClassification({
    sessionId: input.sessionId,
    workTypeTag: classified.data.classification.workTypeTag,
    classifierSource: CLASSIFIER_REMOTE_SOURCE
  });

  if (!persisted.ok) {
    return persisted;
  }

  return classified;
}
