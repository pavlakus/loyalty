import { EventContractValidationError } from "./event-errors.js";

export const CUSTOMER_EVENT_TYPES = [
  "CustomerRegistered",
  "CustomerProfileUpdated",
  "CustomerAnonymized",
] as const;

export type CustomerEventType = (typeof CUSTOMER_EVENT_TYPES)[number];

export interface CustomerRegisteredPayload {
  readonly customer_id: string;
  readonly version: number;
}

export interface CustomerProfileUpdatedPayload {
  readonly customer_id: string;
  readonly version: number;
  readonly changed_fields: readonly string[];
}

export interface CustomerAnonymizedPayload {
  readonly customer_id: string;
  readonly version: number;
  readonly anonymized_at: string;
}

export type CustomerEventPayload =
  | CustomerRegisteredPayload
  | CustomerProfileUpdatedPayload
  | CustomerAnonymizedPayload;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireId(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new EventContractValidationError(field, "must be a non-empty string");
  }
  return value;
}

function requireVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new EventContractValidationError("version", "must be a positive integer");
  }
  return value;
}

function requireOccurredAt(value: unknown): string {
  const occurredAt = requireId(value, "anonymized_at");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(occurredAt) || Number.isNaN(Date.parse(occurredAt))) {
    throw new EventContractValidationError("anonymized_at", "must be a canonical UTC ISO-8601 timestamp");
  }
  return occurredAt;
}

export function validateCustomerEventPayload(
  eventType: CustomerEventType,
  value: unknown,
): CustomerEventPayload {
  if (!isRecord(value)) {
    throw new EventContractValidationError("payload", "must be an object");
  }
  requireId(value.customer_id, "customer_id");
  const version = requireVersion(value.version);

  if (eventType === "CustomerRegistered") {
    return value as unknown as CustomerRegisteredPayload;
  }
  if (eventType === "CustomerProfileUpdated") {
    if (!Array.isArray(value.changed_fields) || value.changed_fields.some((field) => typeof field !== "string" || field.trim() === "")) {
      throw new EventContractValidationError("changed_fields", "must contain only non-empty strings");
    }
    return { ...value, version } as CustomerProfileUpdatedPayload;
  }
  requireOccurredAt(value.anonymized_at);
  return value as unknown as CustomerAnonymizedPayload;
}
