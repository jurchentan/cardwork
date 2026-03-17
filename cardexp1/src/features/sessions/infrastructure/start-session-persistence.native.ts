import { initializeDatabase } from "@/database/client";
import { SessionRepository } from "@/database/repositories/session-repository";
import { startSession } from "@/features/sessions/application/start-session";
import type { SessionRecord, StartSessionInput } from "@/features/sessions/domain/session-start";
import type { Result } from "@/shared/result/result";

export async function persistSessionStart(input: StartSessionInput): Promise<Result<SessionRecord>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  return startSession(repository, input);
}
