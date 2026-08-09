import type { LocalMvpScenarioResult } from "./local-mvp-ports.js";
import type { AuthenticationPersistencePort } from "./authentication-ports.js";
import { evaluateRewardEarning } from "../modules/reward/reward-earning-decision.js";
import type { UatFixture, UatIdentity, UatReceiptInput, UatRepositoryPort, UatReservationInput, UatTransitionInput } from "./uat-repository-port.js";

export type { UatFixture, UatIdentity } from "./uat-repository-port.js";

export class UatApiService {
  public constructor(
    private readonly repository: UatRepositoryPort,
    private readonly authentication: AuthenticationPersistencePort,
    private readonly environment: string,
  ) {}

  public async fixture(): Promise<UatFixture> {
    if (this.environment === "production") throw new Error("UAT fixtures are disabled in production");
    return this.repository.fixture();
  }

  public async resolveCustomerSession(token: string): Promise<UatIdentity> {
    const session = await this.authentication.resolveSession(token);
    if (!session) throw new Error("authenticated customer session is required");
    return { kind: "customer", customerId: session.customerId };
  }

  public resolveBusinessActor(token: string): Promise<UatIdentity> { return this.repository.resolveBusinessActor(token); }
  public submitReceipt(input: UatReceiptInput): Promise<LocalMvpScenarioResult> {
    const amountMinor = BigInt(input.amountMinor);
    const pointsEarned = evaluateRewardEarning({ programConfigurationVersionId: `${input.programId}:1`, currency: input.currency, rules: [{ id: "uat-purchase", minimumAmountMinor: 0n, amountIntervalMinor: 50n, pointsGranted: 1n }] }, { activityId: input.receiptId, membershipId: input.membershipId, amountMinor, currency: input.currency }).pointsAwarded;
    return this.repository.submitReceipt({ ...input, amountMinor, pointsEarned, xpEarned: 10n });
  }
  public resolveCustomer(identity: UatIdentity): Promise<Record<string, string>> { return this.repository.resolveCustomer(identity); }
  public business(identity: UatIdentity, businessId: string): Promise<Record<string, string>> { return this.repository.business(identity, businessId); }
  public brand(identity: UatIdentity, businessId: string, brandId: string): Promise<Record<string, string>> { return this.repository.brand(identity, businessId, brandId); }
  public program(identity: UatIdentity, businessId: string, programId: string): Promise<Record<string, string>> { return this.repository.program(identity, businessId, programId); }
  public membership(identity: UatIdentity, businessId: string, membershipId: string): Promise<Record<string, string>> { return this.repository.membership(identity, businessId, membershipId); }
  public xpStatus(identity: UatIdentity, businessId: string, membershipId: string): Promise<Record<string, string>> { return this.repository.xpStatus(identity, businessId, membershipId); }
  public eligibleRewards(identity: UatIdentity, businessId: string, programId: string, membershipId: string): Promise<readonly Record<string, string>[]> { return this.repository.eligibleRewards(identity, businessId, programId, membershipId); }
  public reserve(identity: UatIdentity, input: UatReservationInput): Promise<Record<string, string>> { return this.repository.reserve(identity, input); }
  public transition(identity: UatIdentity, input: UatTransitionInput): Promise<Record<string, string>> { return this.repository.transition(identity, input); }
  public ensureMembership(input: Parameters<UatRepositoryPort["ensureMembership"]>[0]): Promise<void> { return this.repository.ensureMembership(input); }
  public rewardAccount(identity: UatIdentity, businessId: string, accountId: string): Promise<Record<string, string>> { return this.repository.rewardAccount(identity, businessId, accountId); }
  public analytics(identity: UatIdentity, businessId: string, programId: string, from: string, to: string): Promise<readonly Record<string, string>[]> { return this.repository.analytics(identity, businessId, programId, from, to); }
}
