export const BUSINESS_STATUSES = ["ACTIVE", "SUSPENDED", "CLOSED"] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export type BusinessLifecycleEventType =
  | "BusinessCreated"
  | "BusinessActivated"
  | "BusinessSuspended"
  | "BusinessClosed";

export interface BusinessLifecycleEvent {
  readonly type: BusinessLifecycleEventType;
  readonly businessId: string;
  readonly occurredAt: string;
}

export interface BusinessSnapshot {
  readonly id: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly registrationNumber: string | null;
  readonly taxNumber: string | null;
  readonly defaultCurrency: string;
  readonly timezone: string;
  readonly status: BusinessStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateBusinessInput {
  readonly id: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly registrationNumber?: string | null;
  readonly taxNumber?: string | null;
  readonly defaultCurrency: string;
  readonly timezone: string;
  readonly createdAt: string;
}

export class BusinessValidationError extends Error {
  constructor(
    readonly code:
      | "BUSINESS_ID_INVALID"
      | "BUSINESS_NAME_INVALID"
      | "BUSINESS_REGISTRATION_INVALID"
      | "BUSINESS_TAX_INVALID"
      | "BUSINESS_CURRENCY_INVALID"
      | "BUSINESS_TIMEZONE_INVALID"
      | "BUSINESS_TIMESTAMP_INVALID"
      | "BUSINESS_STATUS_INVALID"
      | "BUSINESS_LIFECYCLE_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "BusinessValidationError";
  }
}

function normalizeRequiredText(value: string, code: "BUSINESS_ID_INVALID" | "BUSINESS_NAME_INVALID"): string {
  if (typeof value !== "string") throw new BusinessValidationError(code, "value must be text");
  const normalized = value.trim();
  if (normalized === "") throw new BusinessValidationError(code, "value must not be empty");
  return normalized;
}

function normalizeOptionalText(value: string | null | undefined, code: "BUSINESS_REGISTRATION_INVALID" | "BUSINESS_TAX_INVALID"): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new BusinessValidationError(code, "value must be text");
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

function validateCurrency(value: string): string {
  if (typeof value !== "string" || !/^[A-Z]{3}$/u.test(value)) {
    throw new BusinessValidationError("BUSINESS_CURRENCY_INVALID", "currency must be an ISO 4217 code");
  }
  try {
    if (!Intl.supportedValuesOf("currency").includes(value)) {
      throw new BusinessValidationError("BUSINESS_CURRENCY_INVALID", "currency must be an ISO 4217 code");
    }
  } catch (error) {
    if (error instanceof BusinessValidationError) throw error;
    throw new BusinessValidationError("BUSINESS_CURRENCY_INVALID", "currency must be an ISO 4217 code");
  }
  return value;
}

function validateTimezone(value: string): string {
  if (typeof value !== "string" || value.trim() === "" || /^[+-]\d{2}:\d{2}$/u.test(value.trim())) {
    throw new BusinessValidationError("BUSINESS_TIMEZONE_INVALID", "timezone must be an IANA identifier");
  }
  const timezone = value.trim();
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new BusinessValidationError("BUSINESS_TIMEZONE_INVALID", "timezone must be an IANA identifier");
  }
  return timezone;
}

function validateTimestamp(value: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    throw new BusinessValidationError("BUSINESS_TIMESTAMP_INVALID", "timestamp must be canonical UTC ISO-8601");
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new BusinessValidationError("BUSINESS_TIMESTAMP_INVALID", "timestamp must be canonical UTC ISO-8601");
  }
  return value;
}

function lifecycleEvent(type: BusinessLifecycleEventType, businessId: string, occurredAt: string): BusinessLifecycleEvent {
  return { type, businessId, occurredAt };
}

export class BusinessAggregate {
  private constructor(private state: BusinessSnapshot) {}

  static create(input: CreateBusinessInput): { business: BusinessAggregate; event: BusinessLifecycleEvent } {
    const snapshot: BusinessSnapshot = {
      id: normalizeRequiredText(input.id, "BUSINESS_ID_INVALID"),
      legalName: normalizeRequiredText(input.legalName, "BUSINESS_NAME_INVALID"),
      displayName: normalizeRequiredText(input.displayName, "BUSINESS_NAME_INVALID"),
      registrationNumber: normalizeOptionalText(input.registrationNumber, "BUSINESS_REGISTRATION_INVALID"),
      taxNumber: normalizeOptionalText(input.taxNumber, "BUSINESS_TAX_INVALID"),
      defaultCurrency: validateCurrency(input.defaultCurrency),
      timezone: validateTimezone(input.timezone),
      status: "ACTIVE",
      createdAt: validateTimestamp(input.createdAt),
      updatedAt: validateTimestamp(input.createdAt),
    };
    return { business: new BusinessAggregate(snapshot), event: lifecycleEvent("BusinessCreated", snapshot.id, snapshot.createdAt) };
  }

  get snapshot(): BusinessSnapshot {
    return { ...this.state };
  }

  suspend(occurredAt: string): BusinessLifecycleEvent {
    return this.transition("SUSPENDED", "BusinessSuspended", occurredAt);
  }

  activate(occurredAt: string): BusinessLifecycleEvent {
    return this.transition("ACTIVE", "BusinessActivated", occurredAt);
  }

  close(occurredAt: string): BusinessLifecycleEvent {
    return this.transition("CLOSED", "BusinessClosed", occurredAt);
  }

  private transition(target: BusinessStatus, eventType: Exclude<BusinessLifecycleEventType, "BusinessCreated">, occurredAt: string): BusinessLifecycleEvent {
    const timestamp = validateTimestamp(occurredAt);
    const allowed = (this.state.status === "ACTIVE" && (target === "SUSPENDED" || target === "CLOSED"))
      || (this.state.status === "SUSPENDED" && (target === "ACTIVE" || target === "CLOSED"));
    if (!allowed) {
      throw new BusinessValidationError("BUSINESS_LIFECYCLE_CONFLICT", "Business lifecycle transition is not allowed");
    }
    this.state = { ...this.state, status: target, updatedAt: timestamp };
    return lifecycleEvent(eventType, this.state.id, timestamp);
  }
}
