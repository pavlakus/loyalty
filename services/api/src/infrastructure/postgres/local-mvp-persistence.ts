import { randomUUID } from "node:crypto";
import type { LocalMvpPersistencePort, LocalMvpScenarioInput, LocalMvpScenarioResult } from "../../application/local-mvp-ports.js";
import type { PostgresTransactionManager } from "./transaction-context.js";

export class PostgresLocalMvpPersistence implements LocalMvpPersistencePort {
  public constructor(private readonly transactions: PostgresTransactionManager) {}

  public persistScenario(input: LocalMvpScenarioInput, pointsEarned: bigint, xpEarned: bigint): Promise<LocalMvpScenarioResult> {
    return this.transactions.withTransaction({ businessId: input.businessId, customerId: input.customerId }, async (db) => {
      const versionId = `${input.programId}:1`;
      await db.query("INSERT INTO businesses (id, legal_name, display_name, default_currency, timezone) VALUES ($1,$2,$2,$3,'UTC') ON CONFLICT (id) DO NOTHING", [input.businessId, `MVP ${input.businessId.slice(0, 8)}`, input.currency]);
      await db.query("INSERT INTO brands (id,business_id,name,default_locale,status) VALUES ($1,$2,'MVP Brand','en-US','ACTIVE') ON CONFLICT (id) DO NOTHING", [input.brandId, input.businessId]);
      await db.query("INSERT INTO loyalty_programs (id,business_id,brand_id,status) VALUES ($1,$2,$3,'ACTIVE') ON CONFLICT (id) DO NOTHING", [input.programId, input.businessId, input.brandId]);
      await db.query("INSERT INTO loyalty_program_configuration_versions (id,program_id,version,effective_from,configuration) VALUES ($1,$2,1,$3,'{}') ON CONFLICT (id) DO NOTHING", [versionId, input.programId, input.occurredAt]);
      await db.query("INSERT INTO customers (id,normalized_phone_reference) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING", [input.customerId, `mvp-${input.customerId.slice(0, 8)}`]);
      await db.query("INSERT INTO memberships (id,customer_id,business_id,brand_id,loyalty_program_id,reward_account_id,xp_account_id,status_level_id,joined_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'bronze',$8) ON CONFLICT (id) DO NOTHING", [input.membershipId,input.customerId,input.businessId,input.brandId,input.programId,input.rewardAccountId,input.xpAccountId,input.occurredAt]);
      await db.query("INSERT INTO reward_accounts (id,business_id,membership_id,loyalty_program_id) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING", [input.rewardAccountId,input.businessId,input.membershipId,input.programId]);
      await db.query("INSERT INTO xp_accounts (id,business_id,membership_id,loyalty_program_id) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING", [input.xpAccountId,input.businessId,input.membershipId,input.programId]);
      await db.query("SELECT * FROM record_receipt_with_outbox($1,$2,$3,$4,$5,'local','mvp-receipt',$6,$7,$8,$9,$9,$10,$10,'{}'::jsonb)", [input.receiptId,input.businessId,input.brandId,input.programId,input.membershipId,input.receiptId,input.amountMinor,input.currency,input.occurredAt,`receipt:${input.receiptId}`]);
      if (pointsEarned > 0n) await db.query("SELECT * FROM append_reward_ledger_transaction($1,$2,$3,$4,$5,$6,$7,$8,'EARNED',$9,$10,$11,$12)", [randomUUID(),input.businessId,input.membershipId,input.rewardAccountId,input.receiptId,`decision:${input.receiptId}`,input.programId,versionId,pointsEarned,input.occurredAt,`earn:${input.receiptId}`,`fp:${input.receiptId}`]);
      await db.query("SELECT * FROM append_xp_transaction($1,$2,$3,$4,$5,$6,$7,$8,$9,'EARNED',$10,$11,$12,$13)", [randomUUID(),input.businessId,input.membershipId,input.xpAccountId,input.receiptId,'xp-mvp',input.programId,versionId,`${input.programId}:membership-year`,xpEarned,input.occurredAt,`xp:${input.receiptId}`,`fp:${input.receiptId}`]);
      await db.query("INSERT INTO reward_definitions (id,business_id,loyalty_program_id,program_configuration_version_id,reward_type,display_name,points_cost) VALUES ('mvp-reward',$1,$2,$3,'FIXED_DISCOUNT','MVP Reward',40) ON CONFLICT (id) DO NOTHING", [input.businessId,input.programId,versionId]);
      await db.query("SELECT * FROM reserve_redemption($1,$2,$3,$4,$5,'mvp-reward',$6,$7,$8,$9,$10)", [input.redemptionId,input.businessId,input.membershipId,input.rewardAccountId,input.programId,versionId,input.occurredAt,new Date(Date.parse(input.occurredAt)+900000).toISOString(),`redeem:${input.redemptionId}`,`fp:${input.redemptionId}`]);
      await db.query("SELECT * FROM transition_redemption($1,$2,$3,'CONFIRMED',$4)", [input.redemptionId,input.businessId,randomUUID(),new Date(Date.parse(input.occurredAt)+1000).toISOString()]);
      const observations: readonly [string,string,string,string,bigint][] = [
        ["receiptCount","RECEIPT",input.receiptId,input.receiptId,1n],
        ["qualifyingReceiptCount","RECEIPT",input.receiptId,`qualifying:${input.receiptId}`,1n],
        ["qualifyingPurchaseAmount","RECEIPT",input.receiptId,`amount:${input.receiptId}`,input.amountMinor],
        ["pointsEarned","REWARD_LEDGER",input.receiptId,`points:${input.receiptId}`,pointsEarned],
        ["pointsRedeemed","REDEMPTION",input.redemptionId,`redeemed:${input.redemptionId}`,40n],
        ["redemptionCount","REDEMPTION",input.redemptionId,`count:${input.redemptionId}`,1n],
        ["redemptionPoints","REDEMPTION",input.redemptionId,`points:${input.redemptionId}`,40n],
      ];
      for (const [metric, sourceType, sourceId, key, value] of observations) {
        await db.query("SELECT * FROM record_analytics_observation($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [randomUUID(),input.businessId,input.brandId,input.programId,metric,sourceType,sourceId,versionId,metric === "membersByStatusLevel" ? "bronze" : null,metric === "qualifyingPurchaseAmount" ? input.currency : null,value,input.occurredAt,`analytics:${key}`,`fp:${key}`]);
      }
      const account = await db.query<{ available_points: bigint; redeemed_points: bigint }>("SELECT available_points, redeemed_points FROM reward_accounts WHERE id=$1", [input.rewardAccountId]);
      const analytics = await db.query("SELECT * FROM query_analytics_overview($1,$2,$3,$4)", [input.businessId,input.programId,input.occurredAt,new Date(Date.parse(input.occurredAt)+1000).toISOString()]);
      return { businessId: input.businessId, programId: input.programId, membershipId: input.membershipId, receiptId: input.receiptId, pointsEarned, xpEarned, redemptionId: input.redemptionId, availablePoints: account.rows[0]?.available_points ?? 0n, redeemedPoints: account.rows[0]?.redeemed_points ?? 0n, analyticsRows: analytics.rowCount ?? 0 };
    });
  }
}
