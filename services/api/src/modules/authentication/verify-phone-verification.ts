import type { OtpChallengeStore } from "./request-phone-verification.js";

export type VerifyPhoneVerificationFailure =
  | "OTP_CHALLENGE_NOT_FOUND"
  | "OTP_CODE_EXPIRED"
  | "OTP_CODE_ALREADY_USED"
  | "OTP_CODE_INVALID"
  | "OTP_ATTEMPT_LIMIT_EXCEEDED";

export class PhoneVerificationError extends Error {
  constructor(readonly code: VerifyPhoneVerificationFailure) {
    super(code);
    this.name = "PhoneVerificationError";
  }
}

export interface VerifyPhoneVerificationConfig {
  readonly maximumAttempts: number;
  readonly now?: () => number;
}

export async function verifyPhoneVerification(
  input: { readonly challengeId: string; readonly otpCode: string },
  config: VerifyPhoneVerificationConfig,
  challengeStore: OtpChallengeStore,
): Promise<{ readonly challengeId: string }> {
  if (!Number.isInteger(config.maximumAttempts) || config.maximumAttempts < 1) {
    throw new Error("OTP verification configuration is invalid");
  }
  if (!/^[0-9]{4,10}$/u.test(input.otpCode)) {
    throw new PhoneVerificationError("OTP_CODE_INVALID");
  }

  const result = await challengeStore.verifyAndConsume({
    challengeId: input.challengeId,
    otpCode: input.otpCode,
    now: config.now?.() ?? Date.now(),
    maximumAttempts: config.maximumAttempts,
  });

  if (result === "verified") return { challengeId: input.challengeId };
  if (result === "not_found") throw new PhoneVerificationError("OTP_CHALLENGE_NOT_FOUND");
  if (result === "expired") throw new PhoneVerificationError("OTP_CODE_EXPIRED");
  if (result === "already_used") throw new PhoneVerificationError("OTP_CODE_ALREADY_USED");
  if (result === "attempt_limit_exceeded" || result === "locked") {
    throw new PhoneVerificationError("OTP_ATTEMPT_LIMIT_EXCEEDED");
  }
  throw new PhoneVerificationError("OTP_CODE_INVALID");
}
