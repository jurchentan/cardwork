import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredPaths = [
  "app/_layout.tsx",
  "app/index.tsx",
  "src/config/env/env.schema.ts",
  "src/config/env/env.ts",
  "src/shared/result/result.ts",
  "src/features/sessions/domain/.gitkeep",
  "src/features/cards/domain/.gitkeep",
  "src/features/battle/domain/.gitkeep",
  "src/features/weekly-cycle/domain/.gitkeep",
  "src/features/notifications/domain/.gitkeep",
  "src/database/migrations/.gitkeep",
  "src/database/repositories/.gitkeep"
];

test("foundation scaffold required by Story 1.1 exists", () => {
  for (const relPath of requiredPaths) {
    assert.equal(existsSync(resolve(process.cwd(), relPath)), true, `${relPath} must exist`);
  }
});
