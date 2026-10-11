import type { D1Database, D1PreparedStatement, D1Result } from "./env";

interface CloudflareQueryResult<T> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

interface CloudflareApiResponse<T> {
  success: boolean;
  errors?: Array<{ message?: string }>;
  result?: CloudflareQueryResult<T>[];
}

class RemotePreparedStatement implements D1PreparedStatement {
  private values: unknown[] = [];

  constructor(
    private readonly database: CloudflareD1Database,
    private readonly sql: string,
  ) {}

  bind(...values: unknown[]): D1PreparedStatement {
    this.values = values;
    return this;
  }

  async first<T>(colName?: string): Promise<T | null> {
    const result = await this.database.query<T>(this.sql, this.values);
    const row = result.results[0];
    if (!row) return null;
    if (colName && typeof row === "object" && row !== null) {
      return (row as Record<string, T>)[colName] ?? null;
    }
    return row;
  }

  async all<T>(): Promise<D1Result<T>> {
    return this.database.query<T>(this.sql, this.values);
  }

  async run<T>(): Promise<D1Result<T>> {
    return this.database.query<T>(this.sql, this.values);
  }

  get boundQuery(): { sql: string; params: unknown[] } {
    return { sql: this.sql, params: this.values };
  }
}

export class CloudflareD1Database implements D1Database {
  private readonly endpoint: string;

  constructor(
    accountId: string,
    databaseId: string,
    private readonly apiToken: string,
  ) {
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database/${encodeURIComponent(databaseId)}/query`;
  }

  prepare(query: string): D1PreparedStatement {
    return new RemotePreparedStatement(this, query);
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<D1Result<T>> {
    const response = await this.execute<T>({ sql, params });
    return response[0] ?? { results: [], success: true };
  }

  async batch<T>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const batch = statements.map((statement) => {
      if (!(statement instanceof RemotePreparedStatement)) {
        throw new TypeError(
          "D1 batches can only contain statements from this database.",
        );
      }
      return statement.boundQuery;
    });
    const response = await this.execute<T>({ batch });
    return response;
  }

  async exec(query: string): Promise<D1Result> {
    const response = await this.execute({ sql: query, params: [] });
    return response[0] ?? { results: [], success: true };
  }

  private async execute<T>(
    payload:
      | string
      | { sql: string; params: unknown[] }
      | { batch: Array<{ sql: string; params: unknown[] }> },
  ): Promise<D1Result<T>[]> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as CloudflareApiResponse<T>;
    if (!response.ok || !body.success) {
      const message = body.errors
        ?.map((error) => error.message)
        .filter(Boolean)
        .join("; ");
      throw new Error(
        message || `Cloudflare D1 request failed with HTTP ${response.status}.`,
      );
    }

    const results = body.result ?? [];
    const failed = results.find((result) => !result.success);
    if (failed) {
      throw new Error(failed.error || "Cloudflare D1 query failed.");
    }
    return results;
  }
}
