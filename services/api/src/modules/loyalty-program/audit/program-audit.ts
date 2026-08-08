import type { ProgramEvent } from "../events/program-events.js";
import { ProgramEventValidationError } from "../events/program-events.js";

export interface ProgramAuditRecord {
  readonly audit_id: string;
  readonly event_id: string;
  readonly event_type: ProgramEvent["event_type"];
  readonly event_version: 1;
  readonly business_id: string;
  readonly brand_id: string;
  readonly loyalty_program_id: string;
  readonly actor_id: string | null;
  readonly occurred_at: string;
  readonly correlation_id: string;
  readonly causation_id: string | null;
}

export function createProgramAuditRecord(event: ProgramEvent, auditId: string): ProgramAuditRecord {
  if (auditId.trim() === "") throw new ProgramEventValidationError("IDENTIFIER_INVALID", "audit identifier must be non-empty");
  return {
    audit_id: auditId.trim(),
    event_id: event.event_id,
    event_type: event.event_type,
    event_version: event.event_version,
    business_id: event.business_id,
    brand_id: event.brand_id,
    loyalty_program_id: event.loyalty_program_id,
    actor_id: event.actor_id,
    occurred_at: event.occurred_at,
    correlation_id: event.correlation_id,
    causation_id: event.causation_id,
  };
}

export function appendProgramAuditRecord(history: readonly ProgramAuditRecord[], record: ProgramAuditRecord): readonly ProgramAuditRecord[] {
  if (history.some((entry) => entry.event_id === record.event_id || entry.audit_id === record.audit_id)) {
    throw new ProgramEventValidationError("DUPLICATE_EVENT", "audit history already contains this event");
  }
  return [...history, record];
}
