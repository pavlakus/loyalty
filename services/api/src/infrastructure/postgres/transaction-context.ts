import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

export interface TenantContext {
  readonly businessId?: string;
  readonly customerId?: string;
}

export interface TransactionContext {
  readonly query: <T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]) => Promise<QueryResult<T>>;
  readonly setTenantContext: (context: TenantContext) => Promise<void>;
}

export class PostgresTransactionManager {
  public constructor(private readonly pool: Pool) {}

  public async withTransaction<T>(tenant: TenantContext, work: (context: TransactionContext) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const context: TransactionContext = {
        query: (text, values) => client.query(text, values as unknown[] | undefined),
        setTenantContext: async (value) => {
          await client.query("SELECT set_config('app.business_id', $1, true), set_config('app.tenant_id', $1, true), set_config('app.customer_id', $2, true)", [value.businessId ?? "", value.customerId ?? ""]);
        },
      };
      await context.setTenantContext(tenant);
      const result = await work(context);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
