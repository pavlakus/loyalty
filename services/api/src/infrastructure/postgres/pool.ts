import { Pool } from "pg";

export interface PostgresPoolOptions {
  readonly connectionString: string;
}

export function createPostgresPool(options: PostgresPoolOptions): Pool {
  return new Pool({ connectionString: options.connectionString });
}
