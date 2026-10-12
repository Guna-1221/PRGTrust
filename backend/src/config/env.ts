import { AsyncLocalStorage } from "node:async_hooks";
import { CloudflareD1Database } from "./cloudflare-d1";

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
}

export interface AppEnv {
  DB?: D1Database;
  ADMIN_PASSCODE?: string;
  JWT_SECRET?: string;
  WORKERS_RUNTIME?: boolean;
  [key: string]: unknown;
}

const workerBindings = new AsyncLocalStorage<Record<string, unknown>>();

export function withWorkerBindings<T>(
  bindings: object,
  callback: () => T,
): T {
  return workerBindings.run(
    { ...Object.fromEntries(Object.entries(bindings)), WORKERS_RUNTIME: true },
    callback,
  );
}

function isD1Database(value: unknown): value is D1Database {
  if (typeof value !== "object" || value === null) return false;
  const database = value as Record<string, unknown>;
  return (
    typeof database.prepare === "function" &&
    typeof database.batch === "function" &&
    typeof database.exec === "function"
  );
}

export async function getEnv(): Promise<AppEnv> {
  const merged = {
    ...process.env,
    ...workerBindings.getStore(),
  } as Record<string, unknown>;

  const db =
    (isD1Database(merged.DB) ? merged.DB : undefined) ||
    (merged.prgtrust_db as D1Database | undefined) ||
    (merged.CLOUDFLARE_ACCOUNT_ID &&
    merged.CLOUDFLARE_D1_DATABASE_ID &&
    merged.CLOUDFLARE_API_TOKEN
      ? new CloudflareD1Database(
          String(merged.CLOUDFLARE_ACCOUNT_ID),
          String(merged.CLOUDFLARE_D1_DATABASE_ID),
          String(merged.CLOUDFLARE_API_TOKEN),
        )
      : undefined);
  return {
    ...merged,
    DB: db,
  } as AppEnv;
}
