import type { OtpChallengeStore } from "../modules/authentication/request-phone-verification.js";

export interface AuthenticationPersistencePort extends OtpChallengeStore {
  findCustomerIdByPhone(phoneE164: string): Promise<string | null>;
  customerIdForChallenge(challengeId: string): Promise<string | null>;
  createSession(customerId: string, expiresAt: number): Promise<{ sessionId: string; token: string }>;
}
