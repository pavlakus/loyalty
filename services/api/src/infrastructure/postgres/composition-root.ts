import { createPostgresPool } from "./pool.js";
import { PostgresTransactionManager } from "./transaction-context.js";
import { PostgresLocalMvpPersistence } from "./local-mvp-persistence.js";
import { LocalMvpApplicationService } from "../../application/local-mvp-service.js";
import { PostgresAuthenticationPersistence } from "./authentication-persistence.js";
import { LocalAuthenticationService, NonProductionCapturingOtpDelivery } from "../../application/local-authentication-service.js";

export function resolveDatabaseUrl(environment: NodeJS.ProcessEnv = process.env): string {
  if (environment.DATABASE_URL) return environment.DATABASE_URL;
  if ((environment.NODE_ENV ?? "development") === "development") return "postgres://postgres:postgres@127.0.0.1:55440/postgres";
  throw new Error("DATABASE_URL is required outside development");
}

export function createLocalMvpComposition(environment: NodeJS.ProcessEnv = process.env) {
  const pool = createPostgresPool({ connectionString: resolveDatabaseUrl(environment) });
  const transactions = new PostgresTransactionManager(pool);
  const localMvp = new LocalMvpApplicationService(new PostgresLocalMvpPersistence(transactions));
  const delivery = new NonProductionCapturingOtpDelivery(environment.NODE_ENV ?? "development");
  const authentication = new LocalAuthenticationService(new PostgresAuthenticationPersistence(pool), delivery);
  return { pool, localMvp, authentication, delivery };
}
