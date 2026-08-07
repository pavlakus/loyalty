export type BrandStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
export type BrandLifecycleEventType = "BrandCreated" | "BrandActivated" | "BrandSuspended" | "BrandClosed";

export interface BrandLifecycleEvent { readonly type: BrandLifecycleEventType; readonly brandId: string; readonly businessId: string; readonly occurredAt: string; }
export interface BrandSnapshot {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly defaultLocale: string;
  readonly status: BrandStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
export interface CreateBrandInput { readonly id: string; readonly businessId: string; readonly name: string; readonly defaultLocale: string; readonly createdAt: string; }

export class BrandValidationError extends Error {
  constructor(readonly code: "BRAND_ID_INVALID" | "BRAND_BUSINESS_ID_INVALID" | "BRAND_NAME_INVALID" | "BRAND_LOCALE_INVALID" | "BRAND_TIMESTAMP_INVALID" | "BRAND_LIFECYCLE_CONFLICT", message: string) { super(message); this.name = "BrandValidationError"; }
}

function id(value: string, code: "BRAND_ID_INVALID" | "BRAND_BUSINESS_ID_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new BrandValidationError(code, "identifier must not be empty");
  return value.trim();
}
function name(value: string): string {
  if (typeof value !== "string") throw new BrandValidationError("BRAND_NAME_INVALID", "name must be text");
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (normalized === "") throw new BrandValidationError("BRAND_NAME_INVALID", "name must not be empty");
  return normalized;
}
function locale(value: string): string {
  if (typeof value !== "string" || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u.test(value.trim())) throw new BrandValidationError("BRAND_LOCALE_INVALID", "locale must be a BCP 47 language tag");
  return value.trim();
}
function timestamp(value: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || new Date(value).toISOString() !== value) throw new BrandValidationError("BRAND_TIMESTAMP_INVALID", "timestamp must be canonical UTC ISO-8601");
  return value;
}

export class BrandAggregate {
  private constructor(private state: BrandSnapshot) {}
  static create(input: CreateBrandInput): { brand: BrandAggregate; event: BrandLifecycleEvent } {
    const snapshot: BrandSnapshot = { id: id(input.id, "BRAND_ID_INVALID"), businessId: id(input.businessId, "BRAND_BUSINESS_ID_INVALID"), name: name(input.name), defaultLocale: locale(input.defaultLocale), status: "DRAFT", createdAt: timestamp(input.createdAt), updatedAt: timestamp(input.createdAt) };
    return { brand: new BrandAggregate(snapshot), event: { type: "BrandCreated", brandId: snapshot.id, businessId: snapshot.businessId, occurredAt: snapshot.createdAt } };
  }
  get snapshot(): BrandSnapshot { return { ...this.state }; }
  activate(at: string): BrandLifecycleEvent { return this.transition("ACTIVE", "BrandActivated", at); }
  suspend(at: string): BrandLifecycleEvent { return this.transition("SUSPENDED", "BrandSuspended", at); }
  close(at: string): BrandLifecycleEvent { return this.transition("CLOSED", "BrandClosed", at); }
  private transition(target: BrandStatus, type: Exclude<BrandLifecycleEventType, "BrandCreated">, at: string): BrandLifecycleEvent {
    const occurredAt = timestamp(at);
    const allowed = (this.state.status === "DRAFT" && (target === "ACTIVE" || target === "CLOSED")) || (this.state.status === "ACTIVE" && (target === "SUSPENDED" || target === "CLOSED")) || (this.state.status === "SUSPENDED" && (target === "ACTIVE" || target === "CLOSED"));
    if (!allowed) throw new BrandValidationError("BRAND_LIFECYCLE_CONFLICT", "Brand lifecycle transition is not allowed");
    this.state = { ...this.state, status: target, updatedAt: occurredAt };
    return { type, brandId: this.state.id, businessId: this.state.businessId, occurredAt };
  }
}
