export interface CustomerAuditRecordInput {
  readonly actor_id: string;
  readonly actor_role: string;
  readonly business_id: string | null;
  readonly action: string;
  readonly target_entity: string;
  readonly reason: string;
  readonly occurred_at: string;
  readonly request_id: string;
}

export type CustomerAuditRecord = Readonly<CustomerAuditRecordInput>;

export interface CustomerAuditRepository {
  /** Must append without update/delete semantics. */
  appendCustomerAuditRecord(record: CustomerAuditRecord): Promise<void>;
}

export class CustomerAuditValidationError extends Error {
  readonly code: "CUSTOMER_AUDIT_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "CustomerAuditValidationError";
    this.code = "CUSTOMER_AUDIT_INVALID";
  }
}

function requireSafeString(value: string, field: string): string {
  if (
    typeof value !== "string"
    || value.trim() === ""
    || value.length > 200
    || /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new CustomerAuditValidationError(`${field} must be a safe non-empty string`);
  }
  return value.trim();
}

function validateOccurredAt(value: string): string {
  const occurredAt = requireSafeString(value, "occurred_at");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(occurredAt) || Number.isNaN(Date.parse(occurredAt))) {
    throw new CustomerAuditValidationError("occurred_at must be canonical UTC time");
  }
  return occurredAt;
}

/** Builds and appends the immutable, privacy-safe Customer audit record. */
export async function recordCustomerAudit(
  input: CustomerAuditRecordInput,
  repository: CustomerAuditRepository,
): Promise<CustomerAuditRecord> {
  const record: CustomerAuditRecord = {
    actor_id: requireSafeString(input.actor_id, "actor_id"),
    actor_role: requireSafeString(input.actor_role, "actor_role"),
    business_id: input.business_id === null ? null : requireSafeString(input.business_id, "business_id"),
    action: requireSafeString(input.action, "action"),
    target_entity: requireSafeString(input.target_entity, "target_entity"),
    reason: requireSafeString(input.reason, "reason"),
    occurred_at: validateOccurredAt(input.occurred_at),
    request_id: requireSafeString(input.request_id, "request_id"),
  };
  await repository.appendCustomerAuditRecord(record);
  return record;
}
