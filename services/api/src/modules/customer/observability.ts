const CUSTOMER_METRIC_NAMES = [
  "customer_registrations_total",
  "customer_duplicate_registration_prevented_total",
  "customer_profile_update_success_total",
  "customer_profile_update_failure_total",
  "customer_anonymization_requests_total",
  "customer_anonymization_success_total",
  "customer_anonymization_failure_total",
  "customer_access_denied_total",
  "customer_profile_version_conflict_total",
  "customer_registration_latency_ms",
  "customer_anonymization_duration_ms",
] as const;

export type CustomerMetricName = (typeof CUSTOMER_METRIC_NAMES)[number];

export interface CustomerLogRecord {
  readonly event: string;
  readonly outcome: "success" | "failure";
  readonly correlation_id: string;
  readonly customer_id: string | null;
  readonly duration_ms: number | null;
  readonly error_code: string | null;
}

export interface CustomerLogger {
  write(record: CustomerLogRecord): void;
}

export interface CustomerMetrics {
  increment(name: CustomerMetricName, labels: Readonly<Record<string, string>>): void;
  observe(name: Extract<CustomerMetricName, "customer_registration_latency_ms" | "customer_anonymization_duration_ms">, valueMs: number): void;
}

export class CustomerObservabilityValidationError extends Error {
  readonly code: "CUSTOMER_OBSERVABILITY_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "CustomerObservabilityValidationError";
    this.code = "CUSTOMER_OBSERVABILITY_INVALID";
  }
}

function safeString(value: string, field: string): string {
  if (typeof value !== "string" || value.trim() === "" || value.length > 200 || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new CustomerObservabilityValidationError(`${field} must be a safe non-empty string`);
  }
  return value.trim();
}

function validateDuration(value: number | null): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value) || value < 0) {
    throw new CustomerObservabilityValidationError("duration_ms must be a non-negative finite number");
  }
  return value;
}

export function logCustomerOperation(
  input: CustomerLogRecord,
  logger: CustomerLogger,
): void {
  logger.write({
    event: safeString(input.event, "event"),
    outcome: input.outcome === "success" || input.outcome === "failure"
      ? input.outcome
      : (() => { throw new CustomerObservabilityValidationError("outcome is invalid"); })(),
    correlation_id: safeString(input.correlation_id, "correlation_id"),
    customer_id: input.customer_id === null ? null : safeString(input.customer_id, "customer_id"),
    duration_ms: validateDuration(input.duration_ms),
    error_code: input.error_code === null ? null : safeString(input.error_code, "error_code"),
  });
}

export function incrementCustomerMetric(
  name: CustomerMetricName,
  labels: Readonly<Record<string, string>>,
  metrics: CustomerMetrics,
): void {
  if (!(CUSTOMER_METRIC_NAMES as readonly string[]).includes(name)) {
    throw new CustomerObservabilityValidationError("metric name is not approved");
  }
  for (const [key, value] of Object.entries(labels)) {
    if (/(id|phone|email|name|token|secret|credential|payload)/iu.test(key)) {
      throw new CustomerObservabilityValidationError("metric labels must not contain personal or secret identifiers");
    }
    safeString(key, "metric label");
    safeString(value, "metric label value");
  }
  metrics.increment(name, labels);
}

export function observeCustomerMetric(
  name: Extract<CustomerMetricName, "customer_registration_latency_ms" | "customer_anonymization_duration_ms">,
  valueMs: number,
  metrics: CustomerMetrics,
): void {
  validateDuration(valueMs);
  metrics.observe(name, valueMs);
}
