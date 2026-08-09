import type { LocalMvpScenarioResult } from "./local-mvp-ports.js";

export interface UatFixture { readonly businessId: string; readonly brandId: string; readonly programId: string; readonly customerId: string; readonly membershipId: string; readonly rewardAccountId: string; readonly xpAccountId: string; readonly rewardDefinitionId: string; readonly receiptId: string; readonly redemptionId: string; readonly phone: string; readonly businessActorToken: string; }
export interface UatIdentity { readonly kind: "customer" | "business"; readonly customerId?: string; readonly businessId?: string; }
export interface UatReceiptInput { readonly identity: UatIdentity; readonly businessId: string; readonly brandId: string; readonly programId: string; readonly membershipId: string; readonly rewardAccountId: string; readonly xpAccountId: string; readonly receiptId: string; readonly redemptionId: string; readonly amountMinor: string; readonly currency: string; readonly occurredAt: string; }
export interface UatReceiptPersistenceInput extends Omit<UatReceiptInput, "amountMinor"> { readonly amountMinor: bigint; readonly pointsEarned: bigint; readonly xpEarned: bigint; }
export interface UatReservationInput { readonly businessId: string; readonly membershipId: string; readonly rewardAccountId: string; readonly programId: string; readonly rewardDefinitionId: string; readonly redemptionId: string; readonly idempotencyKey: string; readonly requestFingerprint: string; readonly createdAt: string; readonly expiresAt: string; }
export interface UatTransitionInput { readonly businessId: string; readonly redemptionId: string; readonly targetState: "CONFIRMED" | "CANCELLED" | "EXPIRED"; readonly transitionedAt: string; }
export interface UatRepositoryPort {
  fixture(): Promise<UatFixture>;
  resolveBusinessActor(token: string): Promise<UatIdentity>;
  submitReceipt(input: UatReceiptPersistenceInput): Promise<LocalMvpScenarioResult>;
  resolveCustomer(identity: UatIdentity): Promise<Record<string, string>>;
  business(identity: UatIdentity, businessId: string): Promise<Record<string, string>>;
  brand(identity: UatIdentity, businessId: string, brandId: string): Promise<Record<string, string>>;
  program(identity: UatIdentity, businessId: string, programId: string): Promise<Record<string, string>>;
  membership(identity: UatIdentity, businessId: string, membershipId: string): Promise<Record<string, string>>;
  xpStatus(identity: UatIdentity, businessId: string, membershipId: string): Promise<Record<string, string>>;
  eligibleRewards(identity: UatIdentity, businessId: string, programId: string, membershipId: string): Promise<readonly Record<string, string>[]>;
  reserve(identity: UatIdentity, input: UatReservationInput): Promise<Record<string, string>>;
  transition(identity: UatIdentity, input: UatTransitionInput): Promise<Record<string, string>>;
  ensureMembership(input: { customer: UatIdentity; business: UatIdentity; businessId: string; brandId: string; programId: string; membershipId: string; rewardAccountId: string; xpAccountId: string; joinedAt: string }): Promise<void>;
  rewardAccount(identity: UatIdentity, businessId: string, accountId: string): Promise<Record<string, string>>;
  analytics(identity: UatIdentity, businessId: string, programId: string, from: string, to: string): Promise<readonly Record<string, string>[]>;
}
