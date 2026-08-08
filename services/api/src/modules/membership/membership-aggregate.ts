export const MEMBERSHIP_STATUSES = ["ACTIVE", "SUSPENDED", "CLOSED"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export type MembershipLifecycleEventType = "MembershipCreated" | "MembershipActivated" | "MembershipSuspended" | "MembershipClosed";

export interface MembershipSnapshot {
  readonly id: string;
  readonly customerId: string;
  readonly loyaltyProgramId: string;
  readonly brandId: string;
  readonly status: MembershipStatus;
  readonly joinedAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MembershipLifecycleEvent {
  readonly type: MembershipLifecycleEventType;
  readonly membershipId: string;
  readonly customerId: string;
  readonly loyaltyProgramId: string;
  readonly brandId: string;
  readonly status: MembershipStatus;
  readonly occurredAt: string;
}

export interface CreateMembershipInput {
  readonly id: string;
  readonly customerId: string;
  readonly loyaltyProgramId: string;
  readonly brandId: string;
  readonly loyaltyProgramStatus: "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  readonly brandStatus: "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  readonly createdAt: string;
  readonly existingMemberships?: readonly MembershipSnapshot[];
}

export class MembershipValidationError extends Error {
  constructor(
    readonly code:
      | "IDENTIFIER_INVALID"
      | "TIMESTAMP_INVALID"
      | "LOYALTY_PROGRAM_INACTIVE"
      | "BRAND_INACTIVE"
      | "MEMBERSHIP_IDENTITY_CONFLICT"
      | "LIFECYCLE_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "MembershipValidationError";
  }
}

function identifier(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new MembershipValidationError("IDENTIFIER_INVALID", "Membership identifiers must be non-empty");
  return value.trim();
}

function timestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new MembershipValidationError("TIMESTAMP_INVALID", "timestamp must be canonical UTC ISO-8601");
  }
  return value;
}

function event(type: MembershipLifecycleEventType, state: MembershipSnapshot, occurredAt: string): MembershipLifecycleEvent {
  return {
    type,
    membershipId: state.id,
    customerId: state.customerId,
    loyaltyProgramId: state.loyaltyProgramId,
    brandId: state.brandId,
    status: state.status,
    occurredAt,
  };
}

export class MembershipAggregate {
  private constructor(private state: MembershipSnapshot) {}

  static create(input: CreateMembershipInput): { membership: MembershipAggregate; event: MembershipLifecycleEvent } {
    const id = identifier(input.id);
    const customerId = identifier(input.customerId);
    const loyaltyProgramId = identifier(input.loyaltyProgramId);
    const brandId = identifier(input.brandId);
    const createdAt = timestamp(input.createdAt);
    if (input.loyaltyProgramStatus !== "ACTIVE") throw new MembershipValidationError("LOYALTY_PROGRAM_INACTIVE", "Membership requires an active Loyalty Program");
    if (input.brandStatus !== "ACTIVE") throw new MembershipValidationError("BRAND_INACTIVE", "Membership requires an active Brand");
    if (input.existingMemberships?.some((membership) => membership.customerId === customerId && membership.loyaltyProgramId === loyaltyProgramId)) {
      throw new MembershipValidationError("MEMBERSHIP_IDENTITY_CONFLICT", "Customer already has a Membership for this Loyalty Program");
    }
    const state: MembershipSnapshot = { id, customerId, loyaltyProgramId, brandId, status: "ACTIVE", joinedAt: createdAt, createdAt, updatedAt: createdAt };
    return { membership: new MembershipAggregate(state), event: event("MembershipCreated", state, createdAt) };
  }

  get snapshot(): MembershipSnapshot {
    return { ...this.state };
  }

  suspend(occurredAt: string): MembershipLifecycleEvent {
    return this.transition("SUSPENDED", "MembershipSuspended", occurredAt);
  }

  reactivate(occurredAt: string): MembershipLifecycleEvent {
    return this.transition("ACTIVE", "MembershipActivated", occurredAt);
  }

  close(occurredAt: string): MembershipLifecycleEvent {
    return this.transition("CLOSED", "MembershipClosed", occurredAt);
  }

  private transition(target: MembershipStatus, type: MembershipLifecycleEventType, occurredAt: string): MembershipLifecycleEvent {
    const occurred = timestamp(occurredAt);
    const allowed =
      (this.state.status === "ACTIVE" && (target === "SUSPENDED" || target === "CLOSED"))
      || (this.state.status === "SUSPENDED" && (target === "ACTIVE" || target === "CLOSED"));
    if (!allowed) throw new MembershipValidationError("LIFECYCLE_CONFLICT", "Membership lifecycle transition is not allowed");
    this.state = { ...this.state, status: target, updatedAt: occurred };
    return event(type, this.state, occurred);
  }
}
