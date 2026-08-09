import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { LocalMvpScenarioPort, LocalMvpScenarioResult } from "./local-mvp-ports.js";
import type { AuthenticationPersistencePort } from "./authentication-ports.js";
import type { PostgresTransactionManager } from "../infrastructure/postgres/transaction-context.js";

export interface UatFixture {
  readonly businessId: string;
  readonly brandId: string;
  readonly programId: string;
  readonly customerId: string;
  readonly membershipId: string;
  readonly rewardAccountId: string;
  readonly xpAccountId: string;
  readonly rewardDefinitionId: string;
  readonly receiptId: string;
  readonly redemptionId: string;
  readonly phone: string;
  readonly businessActorToken: string;
}

export interface UatIdentity { readonly kind: "customer" | "business"; readonly customerId?: string; readonly businessId?: string; }

function digest(token: string): string { return createHash("sha256").update(token).digest("base64url"); }

export class UatApiService {
  public constructor(
    private readonly transactions: PostgresTransactionManager,
    private readonly authentication: AuthenticationPersistencePort,
    private readonly localMvp: LocalMvpScenarioPort,
    private readonly environment: string,
  ) {}

  public async fixture(): Promise<UatFixture> {
    if (this.environment === "production") throw new Error("UAT fixtures are disabled in production");
    const ids = { businessId: randomUUID(), brandId: randomUUID(), programId: randomUUID(), customerId: randomUUID(), membershipId: randomUUID(), rewardAccountId: randomUUID(), xpAccountId: randomUUID(), rewardDefinitionId: `uat-reward-${randomUUID()}`, receiptId: randomUUID(), redemptionId: randomUUID() };
    const phone = `+38160${String(Math.floor(Math.random() * 9000000) + 1000000)}`;
    const businessActorToken = randomBytes(32).toString("base64url");
    await this.transactions.withTransaction({ businessId: ids.businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => {
      await db.query("INSERT INTO businesses (id,legal_name,display_name,default_currency,timezone) VALUES ($1,$2,$2,'RSD','Europe/Belgrade')", [ids.businessId, "UAT Business"]);
      await db.query("INSERT INTO brands (id,business_id,name,default_locale,status) VALUES ($1,$2,'UAT Brand','en-US','ACTIVE')", [ids.brandId, ids.businessId]);
      await db.query("INSERT INTO loyalty_programs (id,business_id,brand_id,status) VALUES ($1,$2,$3,'ACTIVE')", [ids.programId, ids.businessId, ids.brandId]);
      await db.query("INSERT INTO loyalty_program_configuration_versions (id,program_id,version,effective_from,configuration) VALUES ($1,$2,1,CURRENT_TIMESTAMP,'{}')", [`${ids.programId}:1`, ids.programId]);
      await db.query("INSERT INTO customers (id,normalized_phone_reference) VALUES ($1,$2)", [ids.customerId, phone]);
      await db.query("INSERT INTO uat_business_actors (id,business_id,token_digest,role,expires_at) VALUES ($1,$2,$3,'UAT_BUSINESS_ACTOR',CURRENT_TIMESTAMP + interval '2 hours')", [randomUUID(), ids.businessId, digest(businessActorToken)]);
      await db.query("INSERT INTO reward_definitions (id,business_id,loyalty_program_id,program_configuration_version_id,reward_type,display_name,points_cost) VALUES ($1,$2,$3,$4,'FIXED_DISCOUNT','UAT Reward',40)", [ids.rewardDefinitionId, ids.businessId, ids.programId, `${ids.programId}:1`]);
    });
    return { ...ids, phone, businessActorToken };
  }

  public async resolveCustomerSession(token: string): Promise<UatIdentity> {
    const session = await this.authentication.resolveSession(token);
    if (!session) throw new Error("authenticated customer session is required");
    return { kind: "customer", customerId: session.customerId };
  }

  public async resolveBusinessActor(token: string): Promise<UatIdentity> {
    const result = await this.transactions.withTransaction({}, async (db) => db.query<{ actor_id: string; business_id: string; role: string }>("SELECT actor_id,business_id,role FROM resolve_uat_business_actor($1)", [digest(token)]));
    const actor = result.rows[0];
    if (!actor) throw new Error("authenticated UAT Business actor is required");
    return { kind: "business", businessId: actor.business_id };
  }

  public async submitReceipt(input: { identity: UatIdentity; businessId: string; brandId: string; programId: string; membershipId: string; rewardAccountId: string; xpAccountId: string; receiptId: string; redemptionId: string; amountMinor: string; currency: string; occurredAt: string }): Promise<LocalMvpScenarioResult> {
    if (input.identity.kind !== "customer" || !input.identity.customerId) throw new Error("Customer authentication is required");
    return this.localMvp.run({ ...input, customerId: input.identity.customerId, amountMinor: BigInt(input.amountMinor) });
  }

  public async ensureMembership(input: { customer: UatIdentity; business: UatIdentity; businessId: string; brandId: string; programId: string; membershipId: string; rewardAccountId: string; xpAccountId: string; joinedAt: string }): Promise<void> {
    if (input.customer.kind !== "customer" || !input.customer.customerId || input.business.kind !== "business" || input.business.businessId !== input.businessId) throw new Error("Customer and Business authentication are required");
    await this.transactions.withTransaction({ businessId: input.businessId, customerId: input.customer.customerId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => {
      await db.query("INSERT INTO memberships (id,customer_id,business_id,brand_id,loyalty_program_id,reward_account_id,xp_account_id,status_level_id,joined_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'bronze',$8) ON CONFLICT (customer_id,loyalty_program_id) DO NOTHING", [input.membershipId, input.customer.customerId, input.businessId, input.brandId, input.programId, input.rewardAccountId, input.xpAccountId, input.joinedAt]);
      await db.query("INSERT INTO reward_accounts (id,business_id,membership_id,loyalty_program_id) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING", [input.rewardAccountId, input.businessId, input.membershipId, input.programId]);
      await db.query("INSERT INTO xp_accounts (id,business_id,membership_id,loyalty_program_id) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING", [input.xpAccountId, input.businessId, input.membershipId, input.programId]);
    });
  }

  public async rewardAccount(identity: UatIdentity, businessId: string, accountId: string): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ available_points: bigint; pending_points: bigint; reserved_points: bigint; redeemed_points: bigint; expired_points: bigint }>("SELECT available_points,pending_points,reserved_points,redeemed_points,expired_points FROM reward_accounts WHERE id=$1", [accountId]));
    const row = result.rows[0];
    if (!row) throw new Error("Reward Account was not found");
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value)]));
  }

  public async analytics(identity: UatIdentity, businessId: string, programId: string, from: string, to: string): Promise<readonly Record<string, string>[]> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ metric_name: string; currency_code: string | null; metric_value: bigint }>("SELECT * FROM query_analytics_overview($1,$2,$3,$4)", [businessId, programId, from, to]));
    return result.rows.map((row) => ({ metricName: row.metric_name, currencyCode: row.currency_code ?? "", value: String(row.metric_value) }));
  }
}
