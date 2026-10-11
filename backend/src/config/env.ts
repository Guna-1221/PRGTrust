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

export interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
  size: number;
  etag: string;
  uploaded: Date;
}

export interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value:
      | ReadableStream
      | ArrayBuffer
      | ArrayBufferView
      | string
      | Blob
      | null,
    options?: R2PutOptions,
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
}

export interface AppEnv {
  DB?: D1Database;
  STORAGE?: R2Bucket;
  ADMIN_PASSCODE?: string;
  JWT_SECRET?: string;
  [key: string]: unknown;
}

export async function getEnv(): Promise<AppEnv> {
  const merged = process.env as Record<string, unknown>;

  const db =
    (merged.DB as D1Database | undefined) ||
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
  const storage =
    (merged.STORAGE as R2Bucket | undefined) ||
    (merged.prgtrust_storage as R2Bucket | undefined);

  return {
    ...merged,
    DB: db,
    STORAGE: storage,
  } as AppEnv;
}
