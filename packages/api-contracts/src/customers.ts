export type CustomerStatus = "active" | "suspended" | "anonymized" | "closed";

export interface CustomerProfile {
  readonly customer_id: string;
  /** A privacy-safe representation supplied by the Customer module. */
  readonly verified_phone: string;
  readonly first_name: string | null;
  readonly last_name: string | null;
  readonly email: string | null;
  readonly preferred_language: string | null;
  readonly birth_date: string | null;
  readonly status: CustomerStatus;
  readonly version: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CustomerProfileUpdateRequest {
  readonly first_name?: string | null;
  readonly last_name?: string | null;
  readonly email?: string | null;
  readonly birth_date?: string | null;
  readonly preferred_language?: string | null;
}

export interface CustomerApiError {
  readonly code: string;
  readonly message: string;
  readonly field: string | null;
}

export interface CustomerMembershipSummary {
  readonly membership_id: string;
  readonly brand_id: string;
  readonly loyalty_program_id: string;
  readonly status: string;
}

export interface CustomerPrivacyState {
  readonly customer_id: string;
  readonly status: CustomerStatus;
  readonly anonymized_at: string | null;
}

export class CustomerContractValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "CustomerContractValidationError";
    this.field = field;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const ALLOWED_UPDATE_FIELDS = new Set([
  "first_name",
  "last_name",
  "email",
  "birth_date",
  "preferred_language",
]);

function validateNullableString(record: Record<string, unknown>, field: string): void {
  const value = record[field];
  if (value !== null && (typeof value !== "string" || value.trim() === "")) {
    throw new CustomerContractValidationError(field, "must be null or a non-empty string");
  }
}

function validateCanonicalDate(value: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new CustomerContractValidationError(field, "must be a canonical calendar date");
  }
}

export function validateCustomerProfileUpdateRequest(
  value: unknown,
): CustomerProfileUpdateRequest {
  if (!isRecord(value)) {
    throw new CustomerContractValidationError("request", "must be an object");
  }

  for (const field of Object.keys(value)) {
    if (!ALLOWED_UPDATE_FIELDS.has(field)) {
      throw new CustomerContractValidationError(field, "is not an allowed profile field");
    }
    validateNullableString(value, field);
  }

  if (typeof value.birth_date === "string") {
    validateCanonicalDate(value.birth_date, "birth_date");
  }
  return value as CustomerProfileUpdateRequest;
}
