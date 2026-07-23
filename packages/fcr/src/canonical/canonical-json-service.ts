import { createHash } from 'node:crypto';
import * as canonicalizeModule from 'canonicalize';
import { assertJsonDomain } from '../runtime/json-values.js';

const canonicalize = canonicalizeModule.default as unknown as (input: unknown) => string | undefined;

export class CanonicalJsonService {
  public canonicalize(value: unknown): string {
    assertJsonDomain(value);
    const result = canonicalize(value);
    if (result === undefined) throw new Error('RFC 8785 canonicalization returned undefined');
    return result;
  }

  public canonicalBytes(value: unknown): Uint8Array {
    return Buffer.from(this.canonicalize(value), 'utf8');
  }

  public sha256(value: unknown): string {
    return createHash('sha256').update(this.canonicalBytes(value)).digest('hex');
  }

  public sha256Bytes(bytes: Uint8Array): string {
    return createHash('sha256').update(bytes).digest('hex');
  }

  public contentHash(value: unknown): string {
    return this.sha256(value);
  }
}
