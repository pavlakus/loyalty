export const PROGRAM_EVENT_TYPES = [
  "LoyaltyProgramCreated",
  "LoyaltyProgramActivated",
  "LoyaltyProgramDeactivated",
  "StrategySelected",
  "StrategyRecommendationGenerated",
  "StrategyAccepted",
  "StrategyConfigurationChanged",
] as const;

export type ProgramEventType = (typeof PROGRAM_EVENT_TYPES)[number];
export type ProgramEventStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";

interface ProgramEventOwnership {
  readonly program_id: string;
  readonly brand_id: string;
}
interface LifecyclePayload extends ProgramEventOwnership { readonly status: ProgramEventStatus }
interface StrategyPayload extends ProgramEventOwnership { readonly strategy_key: string }
interface RecommendationPayload extends ProgramEventOwnership { readonly recommendation_id: string; readonly configuration_sections: readonly string[] }
interface StrategyDecisionPayload extends ProgramEventOwnership { readonly decision: "ACCEPT" | "MODIFY" | "REPLACE" }
interface ConfigurationChangedPayload extends ProgramEventOwnership { readonly changed_sections: readonly string[] }
type ProgramEventPayload = LifecyclePayload | StrategyPayload | RecommendationPayload | StrategyDecisionPayload | ConfigurationChangedPayload;

export interface SuccessfulProgramApplication {
  readonly status: "SUCCEEDED";
  readonly operation_id: string;
}

export interface ProgramEventInput {
  readonly event_id: string;
  readonly event_type: ProgramEventType;
  readonly execution_id: string;
  readonly root_event_id: string;
  readonly parent_event_id: string | null;
  readonly business_id: string;
  readonly brand_id: string;
  readonly loyalty_program_id: string;
  readonly occurred_at: string;
  readonly idempotency_key: string;
  readonly correlation_id: string;
  readonly causation_id: string | null;
  readonly actor_id: string | null;
  readonly application: SuccessfulProgramApplication;
  readonly payload: ProgramEventPayload;
}

export interface ProgramEvent {
  readonly event_id: string;
  readonly event_type: ProgramEventType;
  readonly event_version: 1;
  readonly execution_id: string;
  readonly root_event_id: string;
  readonly parent_event_id: string | null;
  readonly business_id: string;
  readonly brand_id: string;
  readonly loyalty_program_id: string;
  readonly occurred_at: string;
  readonly idempotency_key: string;
  readonly correlation_id: string;
  readonly causation_id: string | null;
  readonly actor_id: string | null;
  readonly payload: ProgramEventPayload;
}

export class ProgramEventValidationError extends Error {
  constructor(readonly code: "IDENTIFIER_INVALID" | "TIMESTAMP_INVALID" | "APPLICATION_INVALID" | "PAYLOAD_INVALID" | "DUPLICATE_EVENT", message: string) {
    super(message);
    this.name = "ProgramEventValidationError";
  }
}

function identifier(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new ProgramEventValidationError("IDENTIFIER_INVALID", "event identifiers must be non-empty");
  return value.trim();
}

function timestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new ProgramEventValidationError("TIMESTAMP_INVALID", "event timestamp must be canonical UTC ISO-8601");
  }
  return value;
}

function validatePayload(eventType: ProgramEventType, payload: ProgramEventPayload, programId: string, brandId: string): ProgramEventPayload {
  if (payload.program_id !== programId || payload.brand_id !== brandId) throw new ProgramEventValidationError("PAYLOAD_INVALID", "event payload ownership does not match its envelope");
  if (eventType === "LoyaltyProgramCreated" || eventType === "LoyaltyProgramActivated" || eventType === "LoyaltyProgramDeactivated") {
    const lifecycle = payload as LifecyclePayload;
    if (!( ["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"] as const).includes(lifecycle.status)) throw new ProgramEventValidationError("PAYLOAD_INVALID", "event status is not approved");
    if (eventType === "LoyaltyProgramCreated" && lifecycle.status !== "DRAFT") throw new ProgramEventValidationError("PAYLOAD_INVALID", "created Programs must be DRAFT");
    if (eventType === "LoyaltyProgramActivated" && lifecycle.status !== "ACTIVE") throw new ProgramEventValidationError("PAYLOAD_INVALID", "activated Programs must be ACTIVE");
    if (eventType === "LoyaltyProgramDeactivated" && lifecycle.status !== "SUSPENDED" && lifecycle.status !== "CLOSED") throw new ProgramEventValidationError("PAYLOAD_INVALID", "deactivated Programs must be SUSPENDED or CLOSED");
  }
  if (eventType === "StrategySelected" && (payload as StrategyPayload).strategy_key.trim() === "") throw new ProgramEventValidationError("PAYLOAD_INVALID", "strategy key must be non-empty");
  if (eventType === "StrategyRecommendationGenerated" && ((payload as RecommendationPayload).recommendation_id.trim() === "" || (payload as RecommendationPayload).configuration_sections.some((section) => section.trim() === ""))) throw new ProgramEventValidationError("PAYLOAD_INVALID", "recommendation payload is invalid");
  if (eventType === "StrategyConfigurationChanged" && (payload as ConfigurationChangedPayload).changed_sections.some((section) => section.trim() === "")) throw new ProgramEventValidationError("PAYLOAD_INVALID", "changed configuration sections must be named");
  return payload;
}

export function createProgramEvent(input: ProgramEventInput): ProgramEvent {
  if (input.application.status !== "SUCCEEDED" || input.application.operation_id.trim() === "") throw new ProgramEventValidationError("APPLICATION_INVALID", "events require a successful application operation");
  const programId = identifier(input.loyalty_program_id);
  const brandId = identifier(input.brand_id);
  return {
    event_id: identifier(input.event_id),
    event_type: input.event_type,
    event_version: 1,
    execution_id: identifier(input.execution_id),
    root_event_id: identifier(input.root_event_id),
    parent_event_id: input.parent_event_id === null ? null : identifier(input.parent_event_id),
    business_id: identifier(input.business_id),
    brand_id: brandId,
    loyalty_program_id: programId,
    occurred_at: timestamp(input.occurred_at),
    idempotency_key: identifier(input.idempotency_key),
    correlation_id: identifier(input.correlation_id),
    causation_id: input.causation_id === null ? null : identifier(input.causation_id),
    actor_id: input.actor_id === null ? null : identifier(input.actor_id),
    payload: validatePayload(input.event_type, input.payload, programId, brandId),
  };
}
