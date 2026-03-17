export type AppEnv = {
  expoPublicAppEnv: "development" | "staging" | "production";
};

const VALID_APP_ENVS = new Set<AppEnv["expoPublicAppEnv"]>([
  "development",
  "staging",
  "production"
]);

export function parseAppEnv(input: unknown): AppEnv["expoPublicAppEnv"] {
  if (typeof input === "string" && VALID_APP_ENVS.has(input as AppEnv["expoPublicAppEnv"])) {
    return input as AppEnv["expoPublicAppEnv"];
  }

  return "development";
}
