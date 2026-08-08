export type MembershipStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type MembershipLifecycleCommand = "suspend" | "reactivate" | "close";

export interface CreateMembershipRequest {
  readonly enrollmentSource: string;
  readonly acceptedTermsVersion: string;
  readonly marketingConsent: boolean;
  readonly idempotencyKey: string;
}

export interface MembershipResponse {
  readonly membershipId: string;
  readonly loyaltyProgramId: string;
  readonly brandId: string;
  readonly publicMemberToken: string;
  readonly status: MembershipStatus;
  readonly joinedAt: string;
  readonly initialStatus: string;
  readonly rewardBalance: number;
  readonly pendingBalance: number;
  readonly currentXp: number;
  readonly welcomeActionsPending: boolean;
}

export class MembershipContractValidationError extends Error {
  constructor(readonly field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "MembershipContractValidationError";
  }
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new MembershipContractValidationError(field, "must be an object");
  return value as Record<string, unknown>;
}

function exactFields(value: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of Object.keys(value)) if (!fields.includes(field)) throw new MembershipContractValidationError(field, "is not an allowed Membership field");
}

function identifier(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new MembershipContractValidationError(field, "must be a non-empty identifier");
  return value.trim();
}

function timestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(new Date(value).getTime()) || new Date(value).toISOString() !== value) throw new MembershipContractValidationError(field, "must be canonical UTC ISO-8601");
  return value;
}

export function validateCreateMembershipRequest(value: unknown): CreateMembershipRequest {
  const input = record(value, "request");
  exactFields(input, ["enrollmentSource", "acceptedTermsVersion", "marketingConsent", "idempotencyKey"]);
  if (typeof input.marketingConsent !== "boolean") throw new MembershipContractValidationError("marketingConsent", "must be boolean");
  return {
    enrollmentSource: identifier(input.enrollmentSource, "enrollmentSource"),
    acceptedTermsVersion: identifier(input.acceptedTermsVersion, "acceptedTermsVersion"),
    marketingConsent: input.marketingConsent,
    idempotencyKey: identifier(input.idempotencyKey, "idempotencyKey"),
  };
}

export function validateMembershipResponse(value: unknown): MembershipResponse {
  const input = record(value, "response");
  exactFields(input, ["membershipId", "loyaltyProgramId", "brandId", "publicMemberToken", "status", "joinedAt", "initialStatus", "rewardBalance", "pendingBalance", "currentXp", "welcomeActionsPending"]);
  if (input.status !== "ACTIVE" && input.status !== "SUSPENDED" && input.status !== "CLOSED") throw new MembershipContractValidationError("status", "must be an approved Membership status");
  for (const field of ["rewardBalance", "pendingBalance", "currentXp"] as const) if (typeof input[field] !== "number" || !Number.isSafeInteger(input[field]) || input[field] < 0) throw new MembershipContractValidationError(field, "must be a non-negative integer");
  if (typeof input.welcomeActionsPending !== "boolean") throw new MembershipContractValidationError("welcomeActionsPending", "must be boolean");
  const rewardBalance = input.rewardBalance as number;
  const pendingBalance = input.pendingBalance as number;
  const currentXp = input.currentXp as number;
  return {
    membershipId: identifier(input.membershipId, "membershipId"), loyaltyProgramId: identifier(input.loyaltyProgramId, "loyaltyProgramId"), brandId: identifier(input.brandId, "brandId"),
    publicMemberToken: identifier(input.publicMemberToken, "publicMemberToken"), status: input.status, joinedAt: timestamp(input.joinedAt, "joinedAt"), initialStatus: identifier(input.initialStatus, "initialStatus"),
    rewardBalance, pendingBalance, currentXp, welcomeActionsPending: input.welcomeActionsPending,
  };
}

export function validateMembershipLifecycleCommand(value: unknown): MembershipLifecycleCommand {
  if (value !== "suspend" && value !== "reactivate" && value !== "close") throw new MembershipContractValidationError("command", "must be an explicit Membership lifecycle command");
  return value;
}
