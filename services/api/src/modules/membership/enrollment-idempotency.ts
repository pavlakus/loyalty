import { createHash } from "node:crypto";

export interface EnrollmentIdempotencyInput {
  readonly customerId: string;
  readonly loyaltyProgramId: string;
  readonly idempotencyKey: string;
  readonly enrollmentSource: string;
  readonly acceptedTermsVersion: string;
  readonly marketingConsent: boolean;
}

export interface EnrollmentIdempotencyRecord {
  readonly scope: string;
  readonly idempotencyKey: string;
  readonly requestFingerprint: string;
  readonly membershipId: string;
}

export class EnrollmentIdempotencyError extends Error {
  constructor(readonly code: "INPUT_INVALID" | "IDEMPOTENCY_CONFLICT", message: string) {
    super(message);
    this.name = "EnrollmentIdempotencyError";
  }
}

function value(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new EnrollmentIdempotencyError("INPUT_INVALID", "idempotency inputs must be non-empty");
  return value.trim();
}

function fingerprint(input: EnrollmentIdempotencyInput): string {
  const canonical = JSON.stringify({
    customerId: value(input.customerId),
    loyaltyProgramId: value(input.loyaltyProgramId),
    enrollmentSource: value(input.enrollmentSource),
    acceptedTermsVersion: value(input.acceptedTermsVersion),
    marketingConsent: input.marketingConsent,
  });
  if (typeof input.marketingConsent !== "boolean") throw new EnrollmentIdempotencyError("INPUT_INVALID", "marketing consent must be boolean");
  return createHash("sha256").update(canonical).digest("hex");
}

export interface EnrollmentIdempotencyStore {
  readonly environment: "NON_PRODUCTION";
  executeOnce<T>(input: EnrollmentIdempotencyInput, membershipId: string, operation: () => T): { readonly replayed: boolean; readonly membershipId: string; readonly result: T };
}

export class InMemoryEnrollmentIdempotencyStore implements EnrollmentIdempotencyStore {
  readonly environment = "NON_PRODUCTION" as const;
  private readonly records = new Map<string, { readonly record: EnrollmentIdempotencyRecord; readonly result: unknown }>();

  executeOnce<T>(input: EnrollmentIdempotencyInput, membershipId: string, operation: () => T): { readonly replayed: boolean; readonly membershipId: string; readonly result: T } {
    const customerId = value(input.customerId);
    const loyaltyProgramId = value(input.loyaltyProgramId);
    const idempotencyKey = value(input.idempotencyKey);
    const key = `${customerId}:${loyaltyProgramId}:${idempotencyKey}`;
    const requestFingerprint = fingerprint(input);
    const existing = this.records.get(key);
    if (existing !== undefined) {
      if (existing.record.requestFingerprint !== requestFingerprint) throw new EnrollmentIdempotencyError("IDEMPOTENCY_CONFLICT", "idempotency key was reused with a different request");
      return { replayed: true, membershipId: existing.record.membershipId, result: existing.result as T };
    }
    const result = operation();
    this.records.set(key, { record: { scope: `${customerId}:${loyaltyProgramId}`, idempotencyKey, requestFingerprint, membershipId: value(membershipId) }, result });
    return { replayed: false, membershipId: value(membershipId), result };
  }
}
