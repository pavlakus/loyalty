import { createFrameworkError, mapFrameworkError, type MappedErrorResponse } from "../shared/errors/framework-errors.js";
import { UatRequestValidationError } from "./uat-api-validation.js";

export function mapUatError(error: unknown, requestId: string): MappedErrorResponse {
  if (error instanceof UatRequestValidationError) return mapFrameworkError(createFrameworkError({ category: "ValidationError", code: "REQUEST_INVALID", safeMessage: "The request is invalid.", requestId, field: error.field }), metadata(requestId));
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("authentication") || message.includes("session is required")) return mapFrameworkError(createFrameworkError({ category: "AuthenticationError", code: "AUTHENTICATION_REQUIRED", safeMessage: "Authentication is required.", requestId }), metadata(requestId));
  if (message.includes("not authorized") || message.includes("tenant context")) return mapFrameworkError(createFrameworkError({ category: "AuthorizationError", code: "ACCESS_DENIED", safeMessage: "You are not authorized to access this resource.", requestId }), metadata(requestId));
  if (message.includes("was not found") || message.includes("not found")) return mapFrameworkError(createFrameworkError({ category: "NotFoundError", code: "RESOURCE_NOT_FOUND", safeMessage: "The requested resource was not found.", requestId }), metadata(requestId));
  if (message.includes("idempot") || message.includes("already") || message.includes("duplicate")) return mapFrameworkError(createFrameworkError({ category: "ConflictError", code: "REQUEST_CONFLICT", safeMessage: "The request conflicts with existing state.", requestId }), metadata(requestId));
  return mapFrameworkError(error, metadata(requestId));
}

export function metadata(requestId: string) { return { request_id: requestId, timestamp: new Date().toISOString() }; }
