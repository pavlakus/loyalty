export interface EventEnvelope<TPayload = unknown> {
  readonly event_id: string;
  readonly event_type: string;
  readonly event_version: number;
  readonly execution_id: string;
  readonly parent_event_id: string | null;
  readonly root_event_id: string;
  readonly business_id: string | null;
  readonly brand_id: string | null;
  readonly loyalty_program_id: string | null;
  readonly membership_id: string | null;
  readonly occurred_at: string;
  readonly idempotency_key: string;
  readonly correlation_id: string;
  readonly causation_id: string | null;
  readonly payload: TPayload;
}

export { EventContractValidationError } from "./event-errors.js";
import { EventContractValidationError } from "./event-errors.js";

const REQUIRED_STRING_FIELDS = [
  "event_id",
  "event_type",
  "execution_id",
  "root_event_id",
  "occurred_at",
  "idempotency_key",
  "correlation_id",
] as const;

const NULLABLE_STRING_FIELDS = [
  "parent_event_id",
  "business_id",
  "brand_id",
  "loyalty_program_id",
  "membership_id",
  "causation_id",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new EventContractValidationError(field, "must be a non-empty string");
  }
  return value;
}

function validateOccurredAt(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new EventContractValidationError("occurred_at", "must be a canonical UTC ISO-8601 timestamp");
  }
}

export function validateEventEnvelope<TPayload = unknown>(value: unknown): EventEnvelope<TPayload> {
  if (!isRecord(value)) {
    throw new EventContractValidationError("event", "must be an object");
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    requireNonEmptyString(value, field);
  }
  for (const field of NULLABLE_STRING_FIELDS) {
    const fieldValue = value[field];
    if (fieldValue !== null && (typeof fieldValue !== "string" || fieldValue.trim() === "")) {
      throw new EventContractValidationError(field, "must be null or a non-empty string");
    }
  }

  const version = value.event_version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new EventContractValidationError("event_version", "must be a positive integer");
  }
  validateOccurredAt(value.occurred_at as string);
  if (!("payload" in value) || value.payload === undefined) {
    throw new EventContractValidationError("payload", "is required");
  }

  return value as unknown as EventEnvelope<TPayload>;
}

export {
  CUSTOMER_EVENT_TYPES,
  validateCustomerEventPayload,
  type CustomerAnonymizedPayload,
  type CustomerEventPayload,
  type CustomerEventType,
  type CustomerProfileUpdatedPayload,
  type CustomerRegisteredPayload,
} from "./customer.js";
