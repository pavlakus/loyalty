import test from 'node:test';
import assert from 'node:assert/strict';
import { CanonicalJsonService } from '../src/canonical/canonical-json-service.js';

const service = new CanonicalJsonService();

test('canonicalizes object keys while preserving array order', () => {
  assert.equal(service.canonicalize({ b: 2, a: 1, list: [3, 2, 1] }), '{"a":1,"b":2,"list":[3,2,1]}');
});

test('produces stable UTF-8 bytes and lowercase SHA-256 hashes', () => {
  const left = service.canonicalBytes({ unicode: 'ž', value: 1 });
  const right = service.canonicalBytes({ value: 1, unicode: 'ž' });
  assert.deepEqual(left, right);
  assert.equal(service.sha256Bytes(left).length, 64);
  assert.match(service.sha256Bytes(left), /^[a-f0-9]{64}$/);
  assert.equal(service.contentHash({ value: 1 }), service.contentHash({ value: 1 }));
  assert.notEqual(service.contentHash({ value: 1 }), service.contentHash({ value: 2 }));
});

test('rejects unsupported and cyclic values', () => {
  assert.throws(() => service.canonicalize({ value: Number.NaN }));
  assert.throws(() => service.canonicalize({ value: 1n }));
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  assert.throws(() => service.canonicalize(cyclic));
  assert.throws(() => service.canonicalize(new Date()));
  assert.throws(() => service.canonicalize(new Map([['key', 1]])));
  assert.throws(() => service.canonicalize(new Set([1])));
  assert.throws(() => service.canonicalize(Buffer.from('x')));
  assert.throws(() => service.canonicalize(new ArrayBuffer(1)));
  assert.throws(() => service.canonicalize(new Uint8Array([1])));
  assert.throws(() => service.canonicalize(/x/));
  assert.throws(() => service.canonicalize(new Error('x')));
  assert.throws(() => service.canonicalize(new URL('https://example.com')));
  assert.throws(() => service.canonicalize(Object.create({ inherited: true })));
  const sparse: unknown[] = [];
  sparse.length = 1;
  assert.throws(() => service.canonicalize(sparse));
  const accessor = {} as { value: number };
  Object.defineProperty(accessor, 'value', { enumerable: true, get: () => 1 });
  assert.throws(() => service.canonicalize(accessor));
});
