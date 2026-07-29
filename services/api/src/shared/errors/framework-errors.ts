import {
  createErrorResponse,
  type ApiErrorItem,
  type ApiResponseMetadata,
} from "@loyalty-platform/api-contracts";

export const ERROR_CATEGORIES = {
  ValidationError: { defaultStatus: 400, retryable: false, logSeverity: "info" },
  AuthenticationError: { defaultStatus: 401, retryable: false, logSeverity: "info" },
  AuthorizationError: { defaultStatus: 403, retryable: false, logSeverity: "info" },
  NotFoundError: { defaultStatus: 404, retryable: false, logSeverity: "info" },
  BusinessRuleError: { defaultStatus: 422, retryable: false, logSeverity: "info" },
  ConflictError: { defaultStatus: 409, retryable: false, logSeverity: "info" },
  ConcurrencyError: { defaultStatus: 409, retryable: true, logSeverity: "warn" },
  RateLimitError: { defaultStatus: 429, retryable: true, logSeverity: "warn" },
  TemporaryInfrastructureError: { defaultStatus: 503, retryable: true, logSeverity: "error" },
  PermanentProviderError: { defaultStatus: 502, retryable: false, logSeverity: "error" },
  UnexpectedError: { defaultStatus: 500, retryable: false, logSeverity: "error" },
} as const;

export type ErrorCategory = keyof typeof ERROR_CATEGORIES;

export interface FrameworkErrorInput {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly safeMessage: string;
  readonly requestId: string;
  readonly field?: string | null;
  readonly httpStatus?: number;
  readonly retryable?: boolean;
}

export class FrameworkError extends Error {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly safeMessage: string;
  readonly requestId: string;
  readonly httpStatus: number;
  readonly retryable: boolean;
  readonly logSeverity: "info" | "warn" | "error";
  readonly field: string | null;

  constructor(input: FrameworkErrorInput) {
    super(input.safeMessage);
    this.name = "FrameworkError";
    this.category = input.category;
    this.code = input.code;
    this.safeMessage = input.safeMessage;
    this.requestId = input.requestId;
    this.httpStatus = input.httpStatus ?? ERROR_CATEGORIES[input.category].defaultStatus;
    this.retryable = input.retryable ?? ERROR_CATEGORIES[input.category].retryable;
    this.logSeverity = ERROR_CATEGORIES[input.category].logSeverity;
    this.field = input.field ?? null;
  }
}

export function createFrameworkError(input: FrameworkErrorInput): FrameworkError {
  return new FrameworkError(input);
}

export interface MappedErrorResponse {
  readonly status: number;
  readonly body: ReturnType<typeof createErrorResponse>;
}

export function mapFrameworkError(
  error: unknown,
  metadata: ApiResponseMetadata,
): MappedErrorResponse {
  if (error instanceof FrameworkError) {
    const item: ApiErrorItem = {
      code: error.code,
      message: error.safeMessage,
      field: error.field,
    };
    return { status: error.httpStatus, body: createErrorResponse([item], metadata) };
  }

  return {
    status: ERROR_CATEGORIES.UnexpectedError.defaultStatus,
    body: createErrorResponse([
      { code: "INTERNAL_ERROR", message: "An unexpected error occurred.", field: null },
    ], metadata),
  };
}
