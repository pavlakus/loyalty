export const RECEIPT_STATUSES = ["ACCEPTED"] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number];

export interface ReceiptSnapshot {
  readonly id: string;
  readonly businessId: string;
  readonly brandId: string;
  readonly loyaltyProgramId: string;
  readonly membershipId: string;
  readonly locationId: string;
  readonly receiptNumber: string;
  readonly sourceId: string;
  readonly amountMinor: number;
  readonly currency: string;
  readonly occurredAt: string;
  readonly createdAt: string;
  readonly status: ReceiptStatus;
}

export class ReceiptValidationError extends Error {
  constructor(readonly code: "INPUT_INVALID" | "RECEIPT_IMMUTABLE", message: string) {
    super(message);
    this.name = "ReceiptValidationError";
  }
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new ReceiptValidationError("INPUT_INVALID", `${field} must be non-empty`);
  return value.trim();
}

function utc(value: unknown, field: string): string {
  const result = text(value, field);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(result) || Number.isNaN(Date.parse(result))) throw new ReceiptValidationError("INPUT_INVALID", `${field} must be canonical UTC`);
  return result;
}

function currency(value: unknown): string {
  const result = text(value, "currency").toUpperCase();
  if (!/^[A-Z]{3}$/u.test(result)) throw new ReceiptValidationError("INPUT_INVALID", "currency must be an ISO 4217 code");
  return result;
}

export interface CreateReceiptInput {
  readonly id: string;
  readonly businessId: string;
  readonly brandId: string;
  readonly loyaltyProgramId: string;
  readonly membershipId: string;
  readonly locationId: string;
  readonly receiptNumber: string;
  readonly sourceId: string;
  readonly amountMinor: number;
  readonly currency: string;
  readonly occurredAt: string;
  readonly createdAt: string;
}

export class ReceiptAggregate {
  private constructor(readonly snapshot: ReceiptSnapshot) {}

  static record(input: CreateReceiptInput): { readonly receipt: ReceiptAggregate } {
    if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor < 0) throw new ReceiptValidationError("INPUT_INVALID", "amountMinor must be a non-negative integer minor-unit amount");
    const snapshot: ReceiptSnapshot = Object.freeze({
      id: text(input.id, "id"),
      businessId: text(input.businessId, "businessId"),
      brandId: text(input.brandId, "brandId"),
      loyaltyProgramId: text(input.loyaltyProgramId, "loyaltyProgramId"),
      membershipId: text(input.membershipId, "membershipId"),
      locationId: text(input.locationId, "locationId"),
      receiptNumber: text(input.receiptNumber, "receiptNumber"),
      sourceId: text(input.sourceId, "sourceId"),
      amountMinor: input.amountMinor,
      currency: currency(input.currency),
      occurredAt: utc(input.occurredAt, "occurredAt"),
      createdAt: utc(input.createdAt, "createdAt"),
      status: "ACCEPTED",
    });
    return { receipt: new ReceiptAggregate(snapshot) };
  }

  toSnapshot(): ReceiptSnapshot {
    return this.snapshot;
  }
}
