export type AppError = {
  code: string;
  message: string;
  retriable: boolean;
};

export type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AppError;
    };
