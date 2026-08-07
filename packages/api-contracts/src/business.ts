export type BusinessStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface BusinessContract {
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

export interface CreateBusinessRequest {
  readonly id: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly registrationNumber?: string | null;
  readonly taxNumber?: string | null;
  readonly defaultCurrency: string;
  readonly timezone: string;
  readonly createdAt: string;
}

export interface UpdateBusinessRequest {
  readonly legalName?: string;
  readonly displayName?: string;
  readonly registrationNumber?: string | null;
  readonly taxNumber?: string | null;
  readonly defaultCurrency?: string;
  readonly timezone?: string;
}

export class BusinessContractValidationError extends Error {
  constructor(readonly field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "BusinessContractValidationError";
  }
}

function ensureRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new BusinessContractValidationError("request", "must be an object");
  }
  return value as Record<string, unknown>;
}

function ensureText(record: Record<string, unknown>, field: string, required: boolean): void {
  const value = record[field];
  if (value === undefined && !required) return;
  if (typeof value !== "string" || (required && value.trim() === "")) {
    throw new BusinessContractValidationError(field, "must be non-empty text");
  }
}

function ensureNullableText(record: Record<string, unknown>, field: string): void {
  const value = record[field];
  if (value !== undefined && value !== null && (typeof value !== "string" || value.trim() === "")) {
    throw new BusinessContractValidationError(field, "must be null or non-empty text");
  }
}

function ensureAllowedFields(record: Record<string, unknown>, fields: readonly string[]): void {
  for (const key of Object.keys(record)) {
    if (!fields.includes(key)) throw new BusinessContractValidationError(key, "is not an allowed field");
  }
}

export function validateCreateBusinessRequest(value: unknown): CreateBusinessRequest {
  const record = ensureRecord(value);
  ensureAllowedFields(record, ["id", "legalName", "displayName", "registrationNumber", "taxNumber", "defaultCurrency", "timezone", "createdAt"]);
  ensureText(record, "id", true);
  ensureText(record, "legalName", true);
  ensureText(record, "displayName", true);
  ensureNullableText(record, "registrationNumber");
  ensureNullableText(record, "taxNumber");
  ensureText(record, "defaultCurrency", true);
  ensureText(record, "timezone", true);
  ensureText(record, "createdAt", true);
  return { ...value as CreateBusinessRequest };
}

export function validateUpdateBusinessRequest(value: unknown): UpdateBusinessRequest {
  const record = ensureRecord(value);
  ensureAllowedFields(record, ["legalName", "displayName", "registrationNumber", "taxNumber", "defaultCurrency", "timezone"]);
  ensureText(record, "legalName", false);
  ensureText(record, "displayName", false);
  ensureNullableText(record, "registrationNumber");
  ensureNullableText(record, "taxNumber");
  ensureText(record, "defaultCurrency", false);
  ensureText(record, "timezone", false);
  if (Object.keys(record).length === 0) throw new BusinessContractValidationError("request", "must contain an update");
  return { ...value as UpdateBusinessRequest };
}
