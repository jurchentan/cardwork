import type {
  ReflectionEvaluationResult,
  SessionReflectionMode
} from "@/features/sessions/domain/session-reflection";

export type ReflectionPlausibilityProvider = {
  evaluateReflection(input: {
    reflectionText: string;
    reflectionMode: SessionReflectionMode;
  }): Promise<ReflectionEvaluationResult>;
};
