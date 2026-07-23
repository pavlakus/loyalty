import test from 'node:test';
import assert from 'node:assert/strict';
import { cloneAndFreezeJson } from '../src/runtime/json-values.js';

test('preserves and deeply freezes an own __proto__ JSON property', () => {
  const input = JSON.parse('{"__proto__":{"nested":[]}}') as { __proto__: { nested: unknown[] } };
  const output = cloneAndFreezeJson(input) as unknown as { readonly __proto__: { readonly nested: readonly unknown[] } };

  assert.equal(Object.hasOwn(output, '__proto__'), true);
  assert.equal(Object.getPrototypeOf(output), Object.prototype);
  assert.notEqual(output.__proto__, Object.getPrototypeOf(output));
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.__proto__), true);
  assert.equal(Object.isFrozen(output.__proto__.nested), true);
  assert.notEqual(output.__proto__, input.__proto__);

  assert.throws(() => { (output.__proto__.nested as unknown[]).push('blocked'); });
  input.__proto__.nested.push('original-only');
  assert.deepEqual(output.__proto__.nested, []);
});

test('deeply freezes ordinary nested JSON objects without sharing references', () => {
  const input = { outer: { inner: [] as unknown[] } };
  const output = cloneAndFreezeJson(input);

  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.outer), true);
  assert.equal(Object.isFrozen(output.outer.inner), true);
  assert.notEqual(output.outer, input.outer);

  input.outer.inner.push('original-only');
  assert.deepEqual(output.outer.inner, []);
  assert.throws(() => { (output.outer.inner as unknown[]).push('blocked'); });
});
