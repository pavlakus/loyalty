export interface MembershipAccountRelationshipInput {
  readonly membershipId: string;
  readonly rewardAccountId: string;
  readonly xpAccountId: string;
}

export interface MembershipAccountRelationships {
  readonly membershipId: string;
  readonly rewardAccountId: string;
  readonly xpAccountId: string;
}

export class MembershipAccountRelationshipError extends Error {
  constructor(readonly code: "IDENTIFIER_INVALID" | "ACCOUNT_CONCEPT_CONFLICT", message: string) {
    super(message);
    this.name = "MembershipAccountRelationshipError";
  }
}

function identifier(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new MembershipAccountRelationshipError("IDENTIFIER_INVALID", "account relationship identifiers must be non-empty");
  return value.trim();
}

export function createMembershipAccountRelationships(input: MembershipAccountRelationshipInput): MembershipAccountRelationships {
  const membershipId = identifier(input.membershipId);
  const rewardAccountId = identifier(input.rewardAccountId);
  const xpAccountId = identifier(input.xpAccountId);
  if (rewardAccountId === xpAccountId) throw new MembershipAccountRelationshipError("ACCOUNT_CONCEPT_CONFLICT", "Reward and XP accounts must remain separate");
  return { membershipId, rewardAccountId, xpAccountId };
}
