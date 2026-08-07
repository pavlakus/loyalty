export const LOYALTY_PROGRAM_STATUSES = ["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"] as const;
export type LoyaltyProgramStatus = (typeof LOYALTY_PROGRAM_STATUSES)[number];

export type LoyaltyProgramLifecycleEventType =
  | "LoyaltyProgramCreated"
  | "LoyaltyProgramActivated"
  | "LoyaltyProgramDeactivated";

export interface LoyaltyProgramLifecycleEvent {
  readonly type: LoyaltyProgramLifecycleEventType;
  readonly programId: string;
  readonly brandId: string;
  readonly status: LoyaltyProgramStatus;
  readonly occurredAt: string;
}

export interface LoyaltyProgramSnapshot {
  readonly id: string;
  readonly brandId: string;
  readonly status: LoyaltyProgramStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateLoyaltyProgramInput {
  readonly id: string;
  readonly brandId: string;
  readonly createdAt: string;
}

export class LoyaltyProgramValidationError extends Error {
  constructor(
    readonly code:
      | "LOYALTY_PROGRAM_ID_INVALID"
      | "LOYALTY_PROGRAM_BRAND_ID_INVALID"
      | "LOYALTY_PROGRAM_TIMESTAMP_INVALID"
      | "LOYALTY_PROGRAM_LIFECYCLE_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "LoyaltyProgramValidationError";
  }
}

function identifier(value: string, code: "LOYALTY_PROGRAM_ID_INVALID" | "LOYALTY_PROGRAM_BRAND_ID_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new LoyaltyProgramValidationError(code, "identifier must not be empty");
  }
  return value.trim();
}

function timestamp(value: string): string {
  if (
    typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)
    || Number.isNaN(new Date(value).getTime())
    || new Date(value).toISOString() !== value
  ) {
    throw new LoyaltyProgramValidationError("LOYALTY_PROGRAM_TIMESTAMP_INVALID", "timestamp must be canonical UTC ISO-8601");
  }
  return value;
}

function lifecycleEvent(
  type: LoyaltyProgramLifecycleEventType,
  state: LoyaltyProgramSnapshot,
  occurredAt: string,
): LoyaltyProgramLifecycleEvent {
  return {
    type,
    programId: state.id,
    brandId: state.brandId,
    status: state.status,
    occurredAt,
  };
}

export class LoyaltyProgramAggregate {
  private constructor(private state: LoyaltyProgramSnapshot) {}

  static create(input: CreateLoyaltyProgramInput): {
    program: LoyaltyProgramAggregate;
    event: LoyaltyProgramLifecycleEvent;
  } {
    const createdAt = timestamp(input.createdAt);
    const snapshot: LoyaltyProgramSnapshot = {
      id: identifier(input.id, "LOYALTY_PROGRAM_ID_INVALID"),
      brandId: identifier(input.brandId, "LOYALTY_PROGRAM_BRAND_ID_INVALID"),
      status: "DRAFT",
      createdAt,
      updatedAt: createdAt,
    };
    return {
      program: new LoyaltyProgramAggregate(snapshot),
      event: lifecycleEvent("LoyaltyProgramCreated", snapshot, createdAt),
    };
  }

  get snapshot(): LoyaltyProgramSnapshot {
    return { ...this.state };
  }

  activate(occurredAt: string): LoyaltyProgramLifecycleEvent {
    return this.transition("ACTIVE", "LoyaltyProgramActivated", occurredAt);
  }

  suspend(occurredAt: string): LoyaltyProgramLifecycleEvent {
    return this.transition("SUSPENDED", "LoyaltyProgramDeactivated", occurredAt);
  }

  close(occurredAt: string): LoyaltyProgramLifecycleEvent {
    return this.transition("CLOSED", "LoyaltyProgramDeactivated", occurredAt);
  }

  private transition(
    target: Exclude<LoyaltyProgramStatus, "DRAFT">,
    eventType: Exclude<LoyaltyProgramLifecycleEventType, "LoyaltyProgramCreated">,
    occurredAt: string,
  ): LoyaltyProgramLifecycleEvent {
    const timestampValue = timestamp(occurredAt);
    const allowed =
      (this.state.status === "DRAFT" && (target === "ACTIVE" || target === "CLOSED"))
      || (this.state.status === "ACTIVE" && (target === "SUSPENDED" || target === "CLOSED"))
      || (this.state.status === "SUSPENDED" && (target === "ACTIVE" || target === "CLOSED"));

    if (!allowed) {
      throw new LoyaltyProgramValidationError("LOYALTY_PROGRAM_LIFECYCLE_CONFLICT", "Loyalty Program lifecycle transition is not allowed");
    }

    this.state = { ...this.state, status: target, updatedAt: timestampValue };
    return lifecycleEvent(eventType, this.state, timestampValue);
  }
}
