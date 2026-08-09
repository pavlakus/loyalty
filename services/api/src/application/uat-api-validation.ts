export class UatRequestValidationError extends Error {
  public constructor(readonly field: string, message: string) {
    super(message);
    this.name = "UatRequestValidationError";
  }
}

type RecordValue = Record<string, unknown>;

function record(value: unknown, field = "request"): RecordValue {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new UatRequestValidationError(field, "must be an object");
  return value as RecordValue;
}

function exact(input: RecordValue, fields: readonly string[]): void {
  for (const key of Object.keys(input)) if (!fields.includes(key)) throw new UatRequestValidationError(key, "is not allowed");
}

function text(input: RecordValue, field: string): string {
  if (typeof input[field] !== "string" || input[field].trim() === "") throw new UatRequestValidationError(field, "must be a non-empty string");
  return input[field] as string;
}

function iso(input: RecordValue, field: string): string {
  const value = text(input, field);
  if (Number.isNaN(Date.parse(value))) throw new UatRequestValidationError(field, "must be an ISO-8601 timestamp");
  return value;
}

function identifier(input: RecordValue, field: string): string { return text(input, field); }

export function validateMembershipRequest(value: unknown): RecordValue {
  const input = record(value); exact(input, ["businessId", "brandId", "programId", "membershipId", "rewardAccountId", "xpAccountId", "joinedAt"]);
  for (const field of ["businessId", "brandId", "programId", "membershipId", "rewardAccountId", "xpAccountId"]) identifier(input, field);
  iso(input, "joinedAt"); return input;
}

export function validateReceiptRequest(value: unknown): RecordValue {
  const input = record(value); exact(input, ["businessId", "brandId", "programId", "membershipId", "rewardAccountId", "xpAccountId", "receiptId", "redemptionId", "amountMinor", "currency", "occurredAt"]);
  for (const field of ["businessId", "brandId", "programId", "membershipId", "rewardAccountId", "xpAccountId", "receiptId", "redemptionId"]) identifier(input, field);
  if (typeof input.amountMinor !== "string" || !/^(0|[1-9][0-9]*)$/u.test(input.amountMinor)) throw new UatRequestValidationError("amountMinor", "must be a non-negative integer string");
  const currency = text(input, "currency").toUpperCase(); if (!/^[A-Z]{3}$/u.test(currency)) throw new UatRequestValidationError("currency", "must be an ISO 4217 code"); input.currency = currency;
  iso(input, "occurredAt"); return input;
}

export function validateReservationRequest(value: unknown): RecordValue {
  const input = record(value); exact(input, ["businessId", "membershipId", "rewardAccountId", "programId", "rewardDefinitionId", "redemptionId", "idempotencyKey", "requestFingerprint", "createdAt", "expiresAt"]);
  for (const field of ["businessId", "membershipId", "rewardAccountId", "programId", "rewardDefinitionId", "redemptionId", "idempotencyKey", "requestFingerprint"]) identifier(input, field);
  iso(input, "createdAt"); iso(input, "expiresAt"); return input;
}

export function validateTransitionRequest(value: unknown): RecordValue {
  const input = record(value); exact(input, ["businessId", "transitionedAt"]); identifier(input, "businessId"); iso(input, "transitionedAt"); return input;
}

export function validateBusinessQuery(url: URL): { businessId: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId"]); return { businessId: identifier(input, "businessId") };
}

export function validateBrandQuery(url: URL): { businessId: string; brandId: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId", "brandId"]); return { businessId: identifier(input, "businessId"), brandId: identifier(input, "brandId") };
}

export function validateProgramQuery(url: URL): { businessId: string; programId: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId", "programId"]); return { businessId: identifier(input, "businessId"), programId: identifier(input, "programId") };
}

export function validateMembershipQuery(url: URL): { businessId: string; membershipId: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId"]); return { businessId: identifier(input, "businessId"), membershipId: text({ membershipId: url.pathname.split("/").pop() ?? "" }, "membershipId") };
}

export function validateRewardsQuery(url: URL): { businessId: string; programId: string; membershipId: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId", "programId", "membershipId"]); return { businessId: identifier(input, "businessId"), programId: identifier(input, "programId"), membershipId: identifier(input, "membershipId") };
}

export function validateAccountQuery(url: URL): { businessId: string; accountId: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId"]); return { businessId: identifier(input, "businessId"), accountId: text({ accountId: url.pathname.split("/").pop() ?? "" }, "accountId") };
}

export function validateAnalyticsQuery(url: URL): { businessId: string; programId: string; from: string; to: string } {
  const values = Object.fromEntries(url.searchParams.entries()); const input = record(values, "query"); exact(input, ["businessId", "programId", "from", "to"]);
  const from = input.from === undefined ? "1970-01-01T00:00:00.000Z" : iso(input, "from");
  const to = input.to === undefined ? "2999-01-01T00:00:00.000Z" : iso(input, "to");
  if (Date.parse(from) >= Date.parse(to)) throw new UatRequestValidationError("from", "must precede to");
  return { businessId: identifier(input, "businessId"), programId: identifier(input, "programId"), from, to };
}
