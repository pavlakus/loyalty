export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type JsonObject = { readonly [key: string]: JsonValue };
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export function assertJsonDomain(value: unknown): asserts value is JsonValue {
  visit(value, new WeakSet<object>());
}

export function cloneAndFreezeJson<T>(value: T): DeepReadonly<T> {
  assertJsonDomain(value);
  return deepFreeze(cloneJson(value)) as DeepReadonly<T>;
}

export function freezeJson<T>(value: T): DeepReadonly<T> {
  assertJsonDomain(value);
  return deepFreeze(value) as DeepReadonly<T>;
}

function visit(value: unknown, ancestors: WeakSet<object>): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('non-finite number is not valid JSON');
    return;
  }
  if (value === undefined || typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
    throw new TypeError('unsupported value is not valid JSON');
  }
  if (typeof value !== 'object') throw new TypeError('unsupported value is not valid JSON');
  if (ancestors.has(value)) throw new TypeError('cyclic value is not valid JSON');
  ancestors.add(value);
  if (Array.isArray(value)) visitArray(value, ancestors);
  else visitObject(value, ancestors);
  ancestors.delete(value);
}

function visitArray(value: readonly unknown[], ancestors: WeakSet<object>): void {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key === 'symbol')) throw new TypeError('symbol-keyed array properties are unsupported');
  if (keys.some((key) => typeof key === 'string' && key !== 'length' && !isArrayIndex(key))) throw new TypeError('custom array properties are unsupported');
  if (Object.keys(value).length !== value.length) throw new TypeError('sparse arrays are unsupported');
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !('value' in descriptor)) throw new TypeError('accessor array properties are unsupported');
    visit(descriptor.value, ancestors);
  }
}

function visitObject(value: object, ancestors: WeakSet<object>): void {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError('only plain objects are valid JSON');
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === 'symbol') throw new TypeError('symbol-keyed properties are unsupported');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) throw new TypeError('non-enumerable and accessor properties are unsupported');
    visit(descriptor.value, ancestors);
  }
}

function cloneJson<T extends JsonValue>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => cloneJson(item)) as unknown as T;
  const result: Record<string, JsonValue> = {};
  for (const [key, child] of Object.entries(value)) {
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      value: cloneJson(child),
      writable: true,
    });
  }
  return result as T;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function isArrayIndex(key: string): boolean {
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < 4294967295 && String(index) === key;
}
