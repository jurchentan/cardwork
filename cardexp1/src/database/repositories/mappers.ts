import type { Result } from "@/shared/result/result";

type GenericRow = Record<string, unknown>;

export function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function mapRowToCamelCase<T extends GenericRow>(row: GenericRow): T {
  const mapped = Object.entries(row).reduce<GenericRow>((accumulator, [key, value]) => {
    accumulator[snakeToCamelKey(key)] = value;
    return accumulator;
  }, {});

  return mapped as T;
}

export function notImplementedResult<T>(message: string): Result<T> {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message,
      retriable: false
    }
  };
}
