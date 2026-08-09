import { evaluateRewardEarning } from "../modules/reward/reward-earning-decision.js";
import type { LocalMvpPersistencePort, LocalMvpScenarioInput, LocalMvpScenarioPort, LocalMvpScenarioResult } from "./local-mvp-ports.js";

function text(value: string, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${field} is required`);
  return value.trim();
}

export class LocalMvpApplicationService {
  public constructor(private readonly persistence: LocalMvpPersistencePort) {}

  public createPort(): LocalMvpScenarioPort {
    return { run: (input) => this.run(input) };
  }

  private async run(input: LocalMvpScenarioInput): Promise<LocalMvpScenarioResult> {
    const businessId = text(input.businessId, "businessId");
    text(input.brandId, "brandId");
    const programId = text(input.programId, "programId");
    text(input.customerId, "customerId");
    const membershipId = text(input.membershipId, "membershipId");
    text(input.receiptId, "receiptId");
    text(input.rewardAccountId, "rewardAccountId");
    text(input.xpAccountId, "xpAccountId");
    text(input.redemptionId, "redemptionId");
    text(input.occurredAt, "occurredAt");
    if (typeof input.amountMinor !== "bigint" && typeof input.amountMinor !== "number" && typeof input.amountMinor !== "string") throw new Error("amountMinor is required");
    const normalizedInput = { ...input, amountMinor: BigInt(input.amountMinor as bigint | number | string) };
    const amountMinor = normalizedInput.amountMinor;
    const currency = text(input.currency, "currency");
    const decision = evaluateRewardEarning({
      programConfigurationVersionId: `${programId}:1`,
      currency,
      rules: [{ id: "mvp-purchase", minimumAmountMinor: 0n, maximumAmountMinor: undefined, amountIntervalMinor: 50n, pointsGranted: 1n }],
    }, { activityId: input.receiptId, membershipId, amountMinor, currency });
    const xpEarned = 10n;
    return this.persistence.persistScenario(normalizedInput, decision.pointsAwarded, xpEarned);
  }
}
