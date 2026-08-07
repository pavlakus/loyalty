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

export type ValidatedCustomerProfileUpdateRequest = CustomerProfileUpdateRequest;

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new CustomerContractValidationError(field, "must be a canonical calendar date");
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsed.getTime())
    || parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new CustomerContractValidationError(field, "must be a real calendar date");
  }
  if (parsed.getTime() > Date.now()) {
    throw new CustomerContractValidationError(field, "must not be in the future");
  }
}

function validateProfileText(value: string, field: string): void {
  if (value.length > 200 || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new CustomerContractValidationError(field, "contains unsupported text");
  }
}

export function normalizeCustomerEmail(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalized)) {
    throw new CustomerContractValidationError("email", "must be a valid email address");
  }
  return normalized;
}

export function validateCustomerPreferredLanguage(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.trim();
  if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(normalized)) {
    throw new CustomerContractValidationError(
      "preferred_language",
      "must be a stable locale identifier",
    );
  }
  return normalized;
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
  for (const field of ["first_name", "last_name"] as const) {
    if (typeof value[field] === "string") validateProfileText(value[field], field);
  }
  if (typeof value.preferred_language === "string") {
    validateCustomerPreferredLanguage(value.preferred_language);
  }
  return value as CustomerProfileUpdateRequest;
}

export function validateAndNormalizeCustomerProfileUpdateRequest(
  value: unknown,
): ValidatedCustomerProfileUpdateRequest {
  const request = validateCustomerProfileUpdateRequest(value);
  return {
    ...request,
    ...(Object.hasOwn(request, "email") ? { email: normalizeCustomerEmail(request.email ?? null) } : {}),
    ...(Object.hasOwn(request, "preferred_language")
      ? { preferred_language: validateCustomerPreferredLanguage(request.preferred_language ?? null) }
      : {}),
  };
}
