export type LoyaltyProgramStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface CreateLoyaltyProgramRequest { readonly brandId: string; }
export interface LoyaltyProgramResponse {
  readonly id: string;
  readonly brandId: string;
  readonly status: LoyaltyProgramStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
export type LoyaltyProgramLifecycleCommand = "activate" | "suspend" | "reactivate" | "close";

export class LoyaltyProgramContractValidationError extends Error {
  constructor(readonly field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "LoyaltyProgramContractValidationError";
  }
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new LoyaltyProgramContractValidationError(field, "must be an object");
  }
  return value as Record<string, unknown>;
}
function exactFields(value: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of Object.keys(value)) {
    if (!fields.includes(field)) throw new LoyaltyProgramContractValidationError(field, "is not an allowed field");
  }
}
function identifier(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new LoyaltyProgramContractValidationError(field, "must be a non-empty identifier");
  return value.trim();
}
function timestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(new Date(value).getTime()) || new Date(value).toISOString() !== value) {
    throw new LoyaltyProgramContractValidationError(field, "must be a canonical UTC ISO-8601 timestamp");
  }
  return value;
}

export function validateCreateLoyaltyProgramRequest(value: unknown): CreateLoyaltyProgramRequest {
  const input = record(value, "request");
  exactFields(input, ["brandId"]);
  return { brandId: identifier(input.brandId, "brandId") };
}

export function validateLoyaltyProgramResponse(value: unknown): LoyaltyProgramResponse {
  const input = record(value, "response");
  exactFields(input, ["id", "brandId", "status", "createdAt", "updatedAt"]);
  const status = input.status;
  if (status !== "DRAFT" && status !== "ACTIVE" && status !== "SUSPENDED" && status !== "CLOSED") throw new LoyaltyProgramContractValidationError("status", "must be an approved Program status");
  return { id: identifier(input.id, "id"), brandId: identifier(input.brandId, "brandId"), status, createdAt: timestamp(input.createdAt, "createdAt"), updatedAt: timestamp(input.updatedAt, "updatedAt") };
}

export function validateLoyaltyProgramLifecycleCommand(value: unknown): LoyaltyProgramLifecycleCommand {
  if (value !== "activate" && value !== "suspend" && value !== "reactivate" && value !== "close") throw new LoyaltyProgramContractValidationError("command", "must be an explicit lifecycle command");
  return value;
}
