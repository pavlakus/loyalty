import { randomUUID } from "node:crypto";
import { normalizePhoneNumber } from "./phone-number.js";
import { generateOtp, hashOtp } from "./otp-security.js";
import { checkOtpRequestRateLimit, type OtpRateLimitDimensions, type OtpRateLimitPolicy, type OtpRateLimitStore } from "./otp-rate-limiter.js";
import type { OtpDeliveryProvider } from "./otp-delivery-provider.js";

export interface PhoneVerificationRequest {
  readonly phoneInput: string;
  readonly region?: string;
  readonly ipAddress: string;
  readonly deviceOrClient: string;
  readonly deploymentOrBusiness: string;
  readonly correlationId: string;
}

export interface OtpChallengeStore {
  create(challenge: { id: string; phoneE164: string; hash: { salt: string; digest: string }; expiresAt: number }): Promise<void>;
}

export class NonProductionInMemoryOtpChallengeStore implements OtpChallengeStore {
  readonly environmentClassification = "NON_PRODUCTION" as const;
  readonly challenges = new Map<string, { phoneE164: string; hash: { salt: string; digest: string }; expiresAt: number }>();
  constructor(environment: string) {
    if (environment === "production") throw new Error("OTP challenge persistence requires a production store");
  }
  async create(challenge: { id: string; phoneE164: string; hash: { salt: string; digest: string }; expiresAt: number }): Promise<void> {
    this.challenges.set(challenge.id, { phoneE164: challenge.phoneE164, hash: challenge.hash, expiresAt: challenge.expiresAt });
  }
}

export interface RequestPhoneVerificationConfig {
  readonly otpLength: number;
  readonly challengeTtlMs: number;
  readonly rateLimit: OtpRateLimitPolicy;
  readonly now?: () => number;
}

export async function requestPhoneVerification(
  request: PhoneVerificationRequest,
  config: RequestPhoneVerificationConfig,
  rateLimitStore: OtpRateLimitStore,
  challengeStore: OtpChallengeStore,
  deliveryProvider: OtpDeliveryProvider,
): Promise<{ challengeId: string; expiresAt: number }> {
  const phone = normalizePhoneNumber({ input: request.phoneInput, region: request.region });
  const dimensions: OtpRateLimitDimensions = {
    normalizedPhone: phone.e164,
    ipAddress: request.ipAddress,
    deviceOrClient: request.deviceOrClient,
    deploymentOrBusiness: request.deploymentOrBusiness,
  };
  const now = config.now?.() ?? Date.now();
  const decision = checkOtpRequestRateLimit(dimensions, config.rateLimit, rateLimitStore, now);
  if (!decision.allowed) throw new Error("OTP request rate limit exceeded");
  if (!Number.isInteger(config.challengeTtlMs) || config.challengeTtlMs < 1) throw new Error("OTP challenge configuration is invalid");

  const otpCode = generateOtp(config.otpLength);
  const hash = await hashOtp(otpCode);
  const challengeId = randomUUID();
  const expiresAt = now + config.challengeTtlMs;
  await challengeStore.create({ id: challengeId, phoneE164: phone.e164, hash, expiresAt });
  await deliveryProvider.deliver({ destinationE164: phone.e164, otpCode, correlationId: request.correlationId });
  return { challengeId, expiresAt };
}
