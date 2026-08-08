export type MembershipYearStatus = "OPEN" | "COMPLETED";

export interface MembershipYearBoundaryInput {
  readonly id: string;
  readonly membershipId: string;
  readonly periodNumber: number;
  readonly periodStart: string;
  readonly periodEnd: string;
}

export interface MembershipYearBoundary {
  readonly id: string;
  readonly membershipId: string;
  readonly periodNumber: number;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly status: MembershipYearStatus;
}

export class MembershipYearValidationError extends Error {
  constructor(readonly code: "IDENTIFIER_INVALID" | "PERIOD_INVALID" | "RENEWAL_CONFLICT", message: string) {
    super(message);
    this.name = "MembershipYearValidationError";
  }
}

function identifier(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new MembershipYearValidationError("IDENTIFIER_INVALID", "Membership Year identifiers must be non-empty");
  return value.trim();
}

function timestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) throw new MembershipYearValidationError("PERIOD_INVALID", "Membership Year boundaries must be canonical UTC ISO-8601");
  return value;
}

export function createMembershipYearBoundary(input: MembershipYearBoundaryInput): MembershipYearBoundary {
  const periodStart = timestamp(input.periodStart);
  const periodEnd = timestamp(input.periodEnd);
  if (!Number.isInteger(input.periodNumber) || input.periodNumber < 1 || Date.parse(periodEnd) <= Date.parse(periodStart)) throw new MembershipYearValidationError("PERIOD_INVALID", "Membership Year must have a positive number and end after start");
  return { id: identifier(input.id), membershipId: identifier(input.membershipId), periodNumber: input.periodNumber, periodStart, periodEnd, status: "OPEN" };
}

export function completeMembershipYear(year: MembershipYearBoundary): MembershipYearBoundary {
  if (year.status === "COMPLETED") throw new MembershipYearValidationError("RENEWAL_CONFLICT", "Membership Year has already been completed");
  return { ...year, status: "COMPLETED" };
}

export function assertRenewalPeriodAvailable(history: readonly MembershipYearBoundary[], periodNumber: number): void {
  if (history.some((year) => year.periodNumber === periodNumber)) throw new MembershipYearValidationError("RENEWAL_CONFLICT", "Membership Year period has already been recorded");
}
