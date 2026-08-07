export interface OtpDeliveryRequest {
  readonly destinationE164: string;
  /** In-memory only; implementations must never persist or log this value. */
  readonly otpCode: string;
  readonly correlationId: string;
}

export interface OtpDeliveryResult {
  readonly providerMessageId: string | null;
}

export interface OtpDeliveryProvider {
  deliver(request: OtpDeliveryRequest): Promise<OtpDeliveryResult>;
}

export class OtpDeliveryProviderError extends Error {
  readonly code = "OTP_DELIVERY_FAILED" as const;
  constructor() {
    super("OTP delivery failed");
    this.name = "OtpDeliveryProviderError";
  }
}

/** Provider-neutral port; no SMS, Viber, WhatsApp, email, or credential policy is selected here. */
