import { AppEnv, parseAppEnv } from "./env.schema";

export function getAppEnv(): AppEnv {
  return {
    expoPublicAppEnv: parseAppEnv(process.env.EXPO_PUBLIC_APP_ENV)
  };
}
