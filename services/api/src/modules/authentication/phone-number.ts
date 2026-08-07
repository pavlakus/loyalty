import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export class PhoneNumberValidationError extends Error {
  readonly code = "PHONE_NUMBER_INVALID" as const;

  constructor() {
    super("phone number is invalid");
    this.name = "PhoneNumberValidationError";
  }
}

export interface PhoneNumberNormalizationRequest {
  readonly input: string;
  readonly region?: string;
}

export interface NormalizedPhoneNumber {
  readonly e164: string;
}

/** Normalizes a phone identity without applying an application-global region default. */
export function normalizePhoneNumber(
  request: PhoneNumberNormalizationRequest,
): NormalizedPhoneNumber {
  if (typeof request.input !== "string" || request.input.trim() === "") {
    throw new PhoneNumberValidationError();
  }

  const input = request.input.trim();
  const region = request.region?.trim().toUpperCase();
  if (!input.startsWith("+") && !region) {
    throw new PhoneNumberValidationError();
  }
  if (region !== undefined && !/^[A-Z]{2}$/u.test(region)) {
    throw new PhoneNumberValidationError();
  }

  const parsed = parsePhoneNumberFromString(input, region as CountryCode | undefined);
  if (!parsed || !parsed.isValid()) {
    throw new PhoneNumberValidationError();
  }
  return { e164: parsed.number };
}
