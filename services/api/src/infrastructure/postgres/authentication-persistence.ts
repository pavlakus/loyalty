import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { verifyOtp, type OtpHash } from "../../modules/authentication/otp-security.js";
import type { AuthenticationPersistencePort } from "../../application/authentication-ports.js";

export class PostgresAuthenticationPersistence implements AuthenticationPersistencePort {
  public constructor(private readonly pool: Pool) {}

  public async findCustomerIdByPhone(phoneE164: string): Promise<string | null> {
    const result = await this.pool.query<{ id: string }>("SELECT id FROM customers WHERE normalized_phone_reference=$1 AND status='active'", [phoneE164]);
    return result.rows[0]?.id ?? null;
  }

  public async create(challenge: { id: string; phoneE164: string; hash: OtpHash; expiresAt: number }): Promise<void> {
    await this.pool.query("INSERT INTO authentication_challenges (id,customer_id,phone_reference,otp_salt,otp_digest,state,max_attempts,expires_at,created_at) SELECT $1,id,$2,$3,$4,'PENDING',5,to_timestamp($5/1000.0),CURRENT_TIMESTAMP FROM customers WHERE normalized_phone_reference=$2 AND status='active'", [challenge.id,challenge.phoneE164,challenge.hash.salt,challenge.hash.digest,challenge.expiresAt]);
  }

  public async markSent(challengeId: string): Promise<void> { await this.pool.query("UPDATE authentication_challenges SET state='PENDING' WHERE id=$1 AND state='PENDING'", [challengeId]); }
  public async customerIdForChallenge(challengeId: string): Promise<string | null> {
    const result = await this.pool.query<{ customer_id: string }>("SELECT customer_id FROM authentication_challenges WHERE id=$1", [challengeId]);
    return result.rows[0]?.customer_id ?? null;
  }

  public async verifyAndConsume(input: { challengeId: string; otpCode: string; now: number; maximumAttempts: number }): Promise<"verified" | "not_found" | "expired" | "locked" | "already_used" | "invalid_code" | "attempt_limit_exceeded"> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query<{ state: string; attempts: number; max_attempts: number; expires_at: Date; otp_salt: string; otp_digest: string }>("SELECT state,attempts,max_attempts,expires_at,otp_salt,otp_digest FROM authentication_challenges WHERE id=$1 FOR UPDATE", [input.challengeId]);
      const row = result.rows[0];
      if (!row) { await client.query("ROLLBACK"); return "not_found"; }
      if (row.state === "VERIFIED") { await client.query("ROLLBACK"); return "already_used"; }
      if (row.state === "EXPIRED") { await client.query("ROLLBACK"); return "expired"; }
      if (row.state === "LOCKED") { await client.query("ROLLBACK"); return "locked"; }
      if (input.now >= row.expires_at.getTime()) { await client.query("UPDATE authentication_challenges SET state='EXPIRED' WHERE id=$1", [input.challengeId]); await client.query("COMMIT"); return "expired"; }
      if (row.attempts >= Math.min(input.maximumAttempts, row.max_attempts)) { await client.query("UPDATE authentication_challenges SET state='LOCKED' WHERE id=$1", [input.challengeId]); await client.query("COMMIT"); return "attempt_limit_exceeded"; }
      const valid = await verifyOtp(input.otpCode, { salt: row.otp_salt, digest: row.otp_digest });
      const attempts = row.attempts + 1;
      if (!valid) { await client.query("UPDATE authentication_challenges SET attempts=$2,state=CASE WHEN $2 >= LEAST($3,$4) THEN 'LOCKED' ELSE state END WHERE id=$1", [input.challengeId, attempts, input.maximumAttempts, row.max_attempts]); await client.query("COMMIT"); return attempts >= Math.min(input.maximumAttempts, row.max_attempts) ? "attempt_limit_exceeded" : "invalid_code"; }
      await client.query("UPDATE authentication_challenges SET attempts=$2,state='VERIFIED',verified_at=to_timestamp($3/1000.0) WHERE id=$1", [input.challengeId, attempts, input.now]);
      await client.query("COMMIT"); return "verified";
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); throw error; } finally { client.release(); }
  }

  public async createSession(customerId: string, expiresAt: number): Promise<{ sessionId: string; token: string }> {
    const token = randomBytes(32).toString("base64url");
    const tokenDigest = createHash("sha256").update(token).digest("base64url");
    const sessionId = randomUUID();
    await this.pool.query("INSERT INTO authentication_sessions (id,customer_id,token_digest,expires_at,created_at) VALUES ($1,$2,$3,to_timestamp($4/1000.0),CURRENT_TIMESTAMP)", [sessionId,customerId,tokenDigest,expiresAt]);
    return { sessionId, token };
  }
}
