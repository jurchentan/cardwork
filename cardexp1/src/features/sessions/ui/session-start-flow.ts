import {
  type SessionIntentMode,
  isValidSessionIntentMode,
  type StartSessionInput
} from "@/features/sessions/domain/session-start";

export const HOME_PRIMARY_ACTION_ROUTE = "/session";
export const HOME_TO_RUNNING_SESSION_TAP_COUNT = 2;

export function getSessionHomePrimaryActionRoute(): typeof HOME_PRIMARY_ACTION_ROUTE {
  return HOME_PRIMARY_ACTION_ROUTE;
}

export function buildStartSessionInput(intentText: string, inputMode: string): StartSessionInput {
  const normalizedMode: SessionIntentMode = isValidSessionIntentMode(inputMode) ? inputMode : "text";

  return {
    intentText,
    inputMode: normalizedMode
  };
}
