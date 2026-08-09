import { requestPhoneVerification, type PhoneVerificationRequest } from "../modules/authentication/request-phone-verification.js";
import { verifyPhoneVerification } from "../modules/authentication/verify-phone-verification.js";
import type { AuthenticationPersistencePort } from "./authentication-ports.js";
import type { OtpDeliveryProvider } from "../modules/authentication/otp-delivery-provider.js";
import { normalizePhoneNumber } from "../modules/authentication/phone-number.js";
import { NonProductionInMemoryOtpRateLimitStore } from "../modules/authentication/otp-rate-limiter.js";

export class LocalAuthenticationService {
  private readonly rateLimitStore = new NonProductionInMemoryOtpRateLimitStore("test");
  public constructor(private readonly persistence: AuthenticationPersistencePort, private readonly delivery: OtpDeliveryProvider) {}

  public async request(input: PhoneVerificationRequest): Promise<{ challengeId: string; expiresAt: number }> {
    const phone = normalizePhoneNumber({ input: input.phoneInput, region: input.region });
    if (!await this.persistence.findCustomerIdByPhone(phone.e164)) throw new Error("customer identity was not found");
    return requestPhoneVerification(input, { otpLength: 6, challengeTtlMs: 300000, rateLimit: { limit: 5, windowMs: 60000 } }, this.rateLimitStore, this.persistence, this.delivery);
  }

  public async verify(input: { challengeId: string; otpCode: string }): Promise<{ sessionId: string; token: string }> {
    await verifyPhoneVerification(input, { maximumAttempts: 5 }, this.persistence);
    const customerId = await this.persistence.customerIdForChallenge(input.challengeId);
    if (!customerId) throw new Error("verified customer identity was not found");
    return this.persistence.createSession(customerId, Date.now() + 3600000);
  }
}

export class NonProductionCapturingOtpDelivery implements OtpDeliveryProvider {
  readonly environmentClassification = "NON_PRODUCTION" as const;
  public lastCode: string | undefined;
  public constructor(environment: string) { if (environment === "production") throw new Error("A production OTP delivery provider is required"); }
  public async deliver(request: { destinationE164: string; otpCode: string; correlationId: string }): Promise<{ providerMessageId: null }> { this.lastCode = request.otpCode; return { providerMessageId: null }; }
}
