export interface PublicMembershipToken {
  readonly value: string;
}

export interface MembershipQrPayload {
  readonly publicMemberToken: string;
}

export class PublicMembershipTokenError extends Error {
  constructor(readonly code: "TOKEN_INVALID" | "QR_PAYLOAD_INVALID", message: string) {
    super(message);
    this.name = "PublicMembershipTokenError";
  }
}

export function createPublicMembershipToken(value: unknown): PublicMembershipToken {
  if (typeof value !== "string" || value.trim() === "" || /\s/u.test(value)) throw new PublicMembershipTokenError("TOKEN_INVALID", "public Membership token must be opaque and non-empty");
  return { value };
}

export function createMembershipQrPayload(token: PublicMembershipToken): MembershipQrPayload {
  if (typeof token.value !== "string" || token.value.trim() === "") throw new PublicMembershipTokenError("QR_PAYLOAD_INVALID", "QR payload requires a public Membership token");
  return { publicMemberToken: token.value };
}
