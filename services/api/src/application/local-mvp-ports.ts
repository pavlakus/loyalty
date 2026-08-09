export interface LocalMvpScenarioInput {
  readonly businessId: string;
  readonly brandId: string;
  readonly programId: string;
  readonly customerId: string;
  readonly membershipId: string;
  readonly rewardAccountId: string;
  readonly xpAccountId: string;
  readonly receiptId: string;
  readonly redemptionId: string;
  readonly amountMinor: bigint;
  readonly currency: string;
  readonly occurredAt: string;
}

export interface LocalMvpScenarioResult {
  readonly businessId: string;
  readonly programId: string;
  readonly membershipId: string;
  readonly receiptId: string;
  readonly pointsEarned: bigint;
  readonly xpEarned: bigint;
  readonly redemptionId: string;
  readonly availablePoints: bigint;
  readonly redeemedPoints: bigint;
  readonly analyticsRows: number;
}

export interface LocalMvpScenarioPort {
  run(input: LocalMvpScenarioInput): Promise<LocalMvpScenarioResult>;
}

export interface LocalMvpPersistencePort {
  persistScenario(input: LocalMvpScenarioInput, pointsEarned: bigint, xpEarned: bigint): Promise<LocalMvpScenarioResult>;
}
