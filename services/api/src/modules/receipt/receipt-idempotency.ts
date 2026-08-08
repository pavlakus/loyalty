import { createHash } from "node:crypto";

export interface ReceiptIdempotencyInput { readonly businessId: string; readonly sourceId: string; readonly idempotencyKey: string; readonly membershipId: string; readonly amountMinor: number; readonly currency: string; readonly occurredAt: string; }
export class ReceiptIdempotencyError extends Error { constructor(readonly code: "INPUT_INVALID" | "IDEMPOTENCY_CONFLICT", message: string) { super(message); this.name = "ReceiptIdempotencyError"; } }
function text(value: unknown, field: string): string { if (typeof value !== "string" || value.trim() === "") throw new ReceiptIdempotencyError("INPUT_INVALID", `${field} must be non-empty`); return value.trim(); }
function fingerprint(input: ReceiptIdempotencyInput): string { if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor < 0) throw new ReceiptIdempotencyError("INPUT_INVALID", "amountMinor must be a non-negative integer"); return createHash("sha256").update(JSON.stringify({ businessId: text(input.businessId, "businessId"), sourceId: text(input.sourceId, "sourceId"), membershipId: text(input.membershipId, "membershipId"), amountMinor: input.amountMinor, currency: text(input.currency, "currency").toUpperCase(), occurredAt: text(input.occurredAt, "occurredAt") })).digest("hex"); }
export interface ReceiptIdempotencyStore { readonly environment: "NON_PRODUCTION"; executeOnce<T>(input: ReceiptIdempotencyInput, receiptId: string, operation: () => T): { readonly replayed: boolean; readonly receiptId: string; readonly result: T }; }
export class InMemoryReceiptIdempotencyStore implements ReceiptIdempotencyStore {
  readonly environment = "NON_PRODUCTION" as const;
  private readonly records = new Map<string, { readonly fingerprint: string; readonly receiptId: string; readonly result: unknown }>();
  executeOnce<T>(input: ReceiptIdempotencyInput, receiptId: string, operation: () => T): { readonly replayed: boolean; readonly receiptId: string; readonly result: T } {
    const businessId = text(input.businessId, "businessId"); const sourceId = text(input.sourceId, "sourceId"); const key = text(input.idempotencyKey, "idempotencyKey"); const scope = `${businessId}:${sourceId}:${key}`; const requestFingerprint = fingerprint(input); const existing = this.records.get(scope);
    if (existing) { if (existing.fingerprint !== requestFingerprint) throw new ReceiptIdempotencyError("IDEMPOTENCY_CONFLICT", "receipt idempotency key was reused with a different request"); return { replayed: true, receiptId: existing.receiptId, result: existing.result as T }; }
    const result = operation(); this.records.set(scope, { fingerprint: requestFingerprint, receiptId: text(receiptId, "receiptId"), result }); return { replayed: false, receiptId: text(receiptId, "receiptId"), result };
  }
}
