import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";

const MIN_OTP_LENGTH = 4;
const MAX_OTP_LENGTH = 10;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

export class OtpSecurityValidationError extends Error {
  readonly code = "OTP_SECURITY_INVALID" as const;
  constructor() {
    super("OTP security input is invalid");
    this.name = "OtpSecurityValidationError";
  }
}

export interface OtpHash {
  readonly salt: string;
  readonly digest: string;
}

function validateLength(length: number): void {
  if (!Number.isInteger(length) || length < MIN_OTP_LENGTH || length > MAX_OTP_LENGTH) {
    throw new OtpSecurityValidationError();
  }
}

/** Generates a numeric OTP using cryptographically secure randomness. */
export function generateOtp(length: number): string {
  validateLength(length);
  let value = "";
  for (let index = 0; index < length; index += 1) value += randomInt(0, 10).toString();
  return value;
}

function derive(code: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(code, salt, KEY_BYTES, (error, derived) => {
      if (error) reject(new OtpSecurityValidationError());
      else resolve(derived);
    });
  });
}

/** Hashes an OTP with a unique salt; the raw code is never returned or persisted. */
export async function hashOtp(code: string): Promise<OtpHash> {
  if (!/^\d{4,10}$/u.test(code)) throw new OtpSecurityValidationError();
  const salt = randomBytes(SALT_BYTES);
  const digest = await derive(code, salt);
  return { salt: salt.toString("base64url"), digest: digest.toString("base64url") };
}

export async function verifyOtp(code: string, stored: OtpHash): Promise<boolean> {
  if (!/^\d{4,10}$/u.test(code) || typeof stored.salt !== "string" || typeof stored.digest !== "string") return false;
  try {
    const digest = await derive(code, Buffer.from(stored.salt, "base64url"));
    const expected = Buffer.from(stored.digest, "base64url");
    return expected.length === digest.length && timingSafeEqual(expected, digest);
  } catch {
    return false;
  }
}
