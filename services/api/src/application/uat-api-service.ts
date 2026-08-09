import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { LocalMvpScenarioResult } from "./local-mvp-ports.js";
import type { AuthenticationPersistencePort } from "./authentication-ports.js";
import type { PostgresTransactionManager } from "../infrastructure/postgres/transaction-context.js";
import { evaluateRewardEarning } from "../modules/reward/reward-earning-decision.js";

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
    const amountMinor = BigInt(input.amountMinor);
    const pointsEarned = evaluateRewardEarning({ programConfigurationVersionId: `${input.programId}:1`, currency: input.currency, rules: [{ id: "uat-purchase", minimumAmountMinor: 0n, amountIntervalMinor: 50n, pointsGranted: 1n }] }, { activityId: input.receiptId, membershipId: input.membershipId, amountMinor, currency: input.currency }).pointsAwarded;
    const xpEarned = 10n;
    return this.transactions.withTransaction({ businessId: input.businessId, customerId: input.identity.customerId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => {
      const versionId = `${input.programId}:1`;
      const receipt = await db.query<{ receipt_id: string; replayed: boolean }>("SELECT * FROM record_receipt_with_outbox($1,$2,$3,$4,$5,'uat',$6,$7,$8,$9,$10,$10,$11,$12,'{}'::jsonb)", [input.receiptId, input.businessId, input.brandId, input.programId, input.membershipId, input.receiptId, input.receiptId, amountMinor, input.currency, input.occurredAt, `receipt:${input.receiptId}`, `uat:${input.receiptId}`]);
      if (!receipt.rows[0]?.replayed) {
        if (pointsEarned > 0n) await db.query("SELECT * FROM append_reward_ledger_transaction($1,$2,$3,$4,$5,$6,$7,$8,'EARNED',$9,$10,$11,$12)", [randomUUID(), input.businessId, input.membershipId, input.rewardAccountId, input.receiptId, `decision:${input.receiptId}`, input.programId, versionId, pointsEarned, input.occurredAt, `earn:${input.receiptId}`, `uat:${input.receiptId}`]);
        await db.query("SELECT * FROM append_xp_transaction($1,$2,$3,$4,$5,$6,$7,$8,$9,'EARNED',$10,$11,$12,$13)", [randomUUID(), input.businessId, input.membershipId, input.xpAccountId, input.receiptId, 'uat-xp', input.programId, versionId, `${input.programId}:membership-year`, xpEarned, input.occurredAt, `xp:${input.receiptId}`, `uat:${input.receiptId}`]);
        const observations: readonly [string,string,string,bigint,string | null][] = [["receiptCount", "RECEIPT", input.receiptId, 1n, null], ["qualifyingReceiptCount", "RECEIPT", input.receiptId, 1n, null], ["qualifyingPurchaseAmount", "RECEIPT", input.receiptId, amountMinor, input.currency], ["pointsEarned", "REWARD_LEDGER", input.receiptId, pointsEarned, null]];
        for (const [metric, sourceType, sourceId, value, currency] of observations) await db.query("SELECT * FROM record_analytics_observation($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [randomUUID(), input.businessId, input.brandId, input.programId, metric, sourceType, sourceId, versionId, null, currency, value, input.occurredAt, `uat:analytics:${metric}:${sourceId}`, `uat:${sourceId}`]);
      }
      const account = await db.query<{ available_points: bigint; redeemed_points: bigint }>("SELECT available_points,redeemed_points FROM reward_accounts WHERE id=$1", [input.rewardAccountId]);
      const analytics = await db.query("SELECT * FROM query_analytics_overview($1,$2,$3,$4)", [input.businessId, input.programId, input.occurredAt, new Date(Date.parse(input.occurredAt) + 1000).toISOString()]);
      return { businessId: input.businessId, programId: input.programId, membershipId: input.membershipId, receiptId: input.receiptId, pointsEarned, xpEarned, redemptionId: input.redemptionId, availablePoints: account.rows[0]?.available_points ?? 0n, redeemedPoints: account.rows[0]?.redeemed_points ?? 0n, analyticsRows: analytics.rowCount ?? 0 };
    });
  }

  public async resolveCustomer(identity: UatIdentity): Promise<Record<string, string>> {
    if (identity.kind !== "customer" || !identity.customerId) throw new Error("authenticated Customer session is required");
    const result = await this.transactions.withTransaction({ customerId: identity.customerId }, async (db) => db.query<{ id: string; status: string; created_at: Date }>("SELECT id,status,created_at FROM customers WHERE id=$1", [identity.customerId]));
    const row = result.rows[0]; if (!row) throw new Error("Customer was not found");
    return { id: row.id, status: row.status, createdAt: row.created_at.toISOString() };
  }

  public async business(identity: UatIdentity, businessId: string): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ id: string; display_name: string; default_currency: string; timezone: string; status: string }>("SELECT id,display_name,default_currency,timezone,status FROM businesses WHERE id=$1", [businessId]));
    const row = result.rows[0]; if (!row) throw new Error("Business was not found"); return { id: row.id, displayName: row.display_name, defaultCurrency: row.default_currency, timezone: row.timezone, status: row.status };
  }

  public async brand(identity: UatIdentity, businessId: string, brandId: string): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ id: string; business_id: string; name: string; default_locale: string; status: string }>("SELECT id,business_id,name,default_locale,status FROM brands WHERE id=$1", [brandId]));
    const row = result.rows[0]; if (!row) throw new Error("Brand was not found"); return { id: row.id, businessId: row.business_id, name: row.name, defaultLocale: row.default_locale, status: row.status };
  }

  public async program(identity: UatIdentity, businessId: string, programId: string): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ id: string; brand_id: string; status: string }>("SELECT id,brand_id,status FROM loyalty_programs WHERE id=$1", [programId]));
    const row = result.rows[0]; if (!row) throw new Error("Loyalty Program was not found"); return { id: row.id, brandId: row.brand_id, status: row.status };
  }

  public async membership(identity: UatIdentity, businessId: string, membershipId: string): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ id: string; customer_id: string; loyalty_program_id: string; status: string; status_level_id: string }>("SELECT id,customer_id,loyalty_program_id,status,status_level_id FROM memberships WHERE id=$1", [membershipId]));
    const row = result.rows[0]; if (!row) throw new Error("Membership was not found"); return { id: row.id, customerId: row.customer_id, loyaltyProgramId: row.loyalty_program_id, status: row.status, statusLevelId: row.status_level_id };
  }

  public async xpStatus(identity: UatIdentity, businessId: string, membershipId: string): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ total_xp: bigint; current_year_xp: bigint; status_level_id: string }>("SELECT COALESCE((SELECT SUM(xp_amount) FROM xp_transactions WHERE membership_id=$1),0)::bigint total_xp,COALESCE((SELECT SUM(xp_amount) FROM xp_transactions WHERE membership_id=$1),0)::bigint current_year_xp,status_level_id FROM memberships WHERE id=$1", [membershipId]));
    const row = result.rows[0]; if (!row) throw new Error("Membership was not found"); return { totalXp: String(row.total_xp), currentYearXp: String(row.current_year_xp), statusLevelId: row.status_level_id };
  }

  public async eligibleRewards(identity: UatIdentity, businessId: string, programId: string, membershipId: string): Promise<readonly Record<string, string>[]> {
    if (identity.kind !== "business" || identity.businessId !== businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ id: string; display_name: string; points_cost: bigint }>("SELECT r.id,r.display_name,r.points_cost FROM reward_definitions r JOIN memberships m ON m.loyalty_program_id=r.loyalty_program_id AND m.id=$2 JOIN reward_accounts a ON a.id=m.reward_account_id WHERE r.business_id=$1 AND r.loyalty_program_id=$3 AND r.enabled=true AND a.available_points >= r.points_cost", [businessId, membershipId, programId]));
    return result.rows.map((row) => ({ rewardDefinitionId: row.id, displayName: row.display_name, pointsCost: String(row.points_cost) }));
  }

  public async reserve(identity: UatIdentity, input: { businessId: string; membershipId: string; rewardAccountId: string; programId: string; rewardDefinitionId: string; redemptionId: string; idempotencyKey: string; requestFingerprint: string; createdAt: string; expiresAt: string }): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== input.businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId: input.businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ redemption_id: string; replayed: boolean }>("SELECT * FROM reserve_redemption($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [input.redemptionId, input.businessId, input.membershipId, input.rewardAccountId, input.programId, input.rewardDefinitionId, `${input.programId}:1`, input.createdAt, input.expiresAt, input.idempotencyKey, input.requestFingerprint]));
    const row = result.rows[0]; if (!row) throw new Error("Redemption reservation failed"); return { redemptionId: row.redemption_id, replayed: String(row.replayed), status: "RESERVED" };
  }

  public async transition(identity: UatIdentity, input: { businessId: string; redemptionId: string; targetState: "CONFIRMED" | "CANCELLED" | "EXPIRED"; transitionedAt: string }): Promise<Record<string, string>> {
    if (identity.kind !== "business" || identity.businessId !== input.businessId) throw new Error("Business tenant context is not authorized");
    const result = await this.transactions.withTransaction({ businessId: input.businessId, accessPurpose: "LOYALTY_OPERATIONS" }, async (db) => db.query<{ redemption_id: string; replayed: boolean }>("SELECT * FROM transition_redemption($1,$2,$3,$4,$5)", [input.redemptionId, input.businessId, randomUUID(), input.targetState, input.transitionedAt]));
    const row = result.rows[0]; if (!row) throw new Error("Redemption transition failed"); return { redemptionId: row.redemption_id, replayed: String(row.replayed), status: input.targetState };
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
