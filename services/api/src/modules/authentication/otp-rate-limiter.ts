export interface OtpRateLimitDimensions {
  readonly normalizedPhone: string;
  readonly ipAddress: string;
  readonly deviceOrClient: string;
  readonly deploymentOrBusiness: string;
}

export interface OtpRateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

export interface OtpRateLimitStore {
  /** Must atomically check and consume one request for the effective bucket. */
  checkAndConsume(bucketKey: string, nowMs: number, windowMs: number, limit: number): OtpRateLimitDecision;
}

export interface OtpRateLimitPolicy {
  readonly windowMs: number;
  readonly limit: number;
}

export class OtpRateLimitConfigurationError extends Error {
  readonly code = "OTP_RATE_LIMIT_CONFIGURATION_INVALID" as const;
  constructor() {
    super("OTP rate-limit configuration is invalid");
    this.name = "OtpRateLimitConfigurationError";
  }
}

export class NonProductionInMemoryOtpRateLimitStore implements OtpRateLimitStore {
  readonly environmentClassification = "NON_PRODUCTION" as const;
  private readonly buckets = new Map<string, { windowStartedAt: number; count: number }>();

  constructor(environment: string) {
    if (environment === "production") throw new OtpRateLimitConfigurationError();
  }

  checkAndConsume(bucketKey: string, nowMs: number, windowMs: number, limit: number): OtpRateLimitDecision {
    const current = this.buckets.get(bucketKey);
    const bucket = !current || nowMs - current.windowStartedAt >= windowMs
      ? { windowStartedAt: nowMs, count: 0 }
      : current;
    if (bucket.count >= limit) {
      this.buckets.set(bucketKey, bucket);
      return { allowed: false, retryAfterSeconds: Math.ceil((bucket.windowStartedAt + windowMs - nowMs) / 1000) };
    }
    bucket.count += 1;
    this.buckets.set(bucketKey, bucket);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export function checkOtpRequestRateLimit(
  dimensions: OtpRateLimitDimensions,
  policy: OtpRateLimitPolicy,
  store: OtpRateLimitStore,
  nowMs = Date.now(),
): OtpRateLimitDecision {
  if (Object.values(dimensions).some((value) => typeof value !== "string" || value.trim() === "") || !Number.isInteger(policy.limit) || policy.limit < 1 || !Number.isInteger(policy.windowMs) || policy.windowMs < 1) {
    throw new OtpRateLimitConfigurationError();
  }
  const bucketKey = Object.values(dimensions).map((value) => value.trim()).join("|");
  return store.checkAndConsume(bucketKey, nowMs, policy.windowMs, policy.limit);
}
