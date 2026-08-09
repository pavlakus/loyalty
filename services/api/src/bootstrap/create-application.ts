import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createSuccessResponse } from "@loyalty-platform/api-contracts";
import type { LocalMvpScenarioPort } from "../application/local-mvp-ports.js";
import type { LocalAuthenticationService } from "../application/local-authentication-service.js";
import type { UatApiService } from "../application/uat-api-service.js";
import type { UatIdentity, UatReceiptInput, UatReservationInput, UatTransitionInput } from "../application/uat-repository-port.js";
import { mapUatError, metadata } from "../application/uat-api-errors.js";
import { validateAccountQuery, validateAnalyticsQuery, validateBrandQuery, validateBusinessQuery, validateMembershipQuery, validateMembershipRequest, validateProgramQuery, validateReceiptRequest, validateReservationRequest, validateRewardsQuery, validateTransitionRequest } from "../application/uat-api-validation.js";

function writeJson(response: ServerResponse, statusCode: number, body: object): void {
  const payload = JSON.stringify(body, (_key, value: unknown) => typeof value === "bigint" ? value.toString() : value);
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("content-length", Buffer.byteLength(payload));
  response.end(payload);
}

function writeUatSuccess(response: ServerResponse, statusCode: number, data: unknown, requestId: string): void { writeJson(response, statusCode, createSuccessResponse(data, metadata(requestId))); }
function writeUatFailure(response: ServerResponse, error: unknown, requestId: string): void { const mapped = mapUatError(error, requestId); writeJson(response, mapped.status, mapped.body); }

export interface ApplicationDependencies {
  readonly localMvp?: LocalMvpScenarioPort;
  readonly authentication?: LocalAuthenticationService;
  readonly uat?: UatApiService;
  readonly nonProductionOnly?: boolean;
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  let body = "";
  for await (const chunk of request) body += chunk;
  if (body.length === 0) return {};
  return JSON.parse(body);
}

function bearer(request: IncomingMessage): string { const value = request.headers.authorization ?? ""; return value.startsWith("Bearer ") ? value.slice(7) : ""; }
function businessToken(request: IncomingMessage): string { return typeof request.headers["x-uat-business-token"] === "string" ? request.headers["x-uat-business-token"] : ""; }
function requestId(request: IncomingMessage): string { return typeof request.headers["x-request-id"] === "string" && request.headers["x-request-id"] !== "" ? request.headers["x-request-id"] : randomUUID(); }

function membershipInput(value: Record<string, unknown>, customer: UatIdentity, business: UatIdentity) {
  return { businessId: String(value.businessId), brandId: String(value.brandId), programId: String(value.programId), membershipId: String(value.membershipId), rewardAccountId: String(value.rewardAccountId), xpAccountId: String(value.xpAccountId), joinedAt: String(value.joinedAt), customer, business };
}

function receiptInput(value: Record<string, unknown>, identity: UatIdentity): UatReceiptInput {
  return { identity, businessId: String(value.businessId), brandId: String(value.brandId), programId: String(value.programId), membershipId: String(value.membershipId), rewardAccountId: String(value.rewardAccountId), xpAccountId: String(value.xpAccountId), receiptId: String(value.receiptId), redemptionId: String(value.redemptionId), amountMinor: String(value.amountMinor), currency: String(value.currency), occurredAt: String(value.occurredAt) };
}

function reservationInput(value: Record<string, unknown>): UatReservationInput {
  return { businessId: String(value.businessId), membershipId: String(value.membershipId), rewardAccountId: String(value.rewardAccountId), programId: String(value.programId), rewardDefinitionId: String(value.rewardDefinitionId), redemptionId: String(value.redemptionId), idempotencyKey: String(value.idempotencyKey), requestFingerprint: String(value.requestFingerprint), createdAt: String(value.createdAt), expiresAt: String(value.expiresAt) };
}

function transitionInput(value: Record<string, unknown>, redemptionId: string, targetState: UatTransitionInput["targetState"]): UatTransitionInput {
  return { businessId: String(value.businessId), redemptionId, targetState, transitionedAt: String(value.transitionedAt) };
}

export function createApplication(dependencies: ApplicationDependencies = {}): (request: IncomingMessage, response: ServerResponse) => void {
  return (request, response) => {
    void (async () => {
      const requestUrl = request.url ?? "/";
      if (requestUrl === "/health") { writeJson(response, 200, { status: "ok" }); return; }
      if (requestUrl === "/ready") { writeJson(response, 200, { status: "ready" }); return; }

      if (request.method === "POST" && requestUrl === "/api/v1/local-mvp/scenario" && dependencies.localMvp && !dependencies.nonProductionOnly) {
        try { writeJson(response, 200, { data: await dependencies.localMvp.run(await readJson(request) as Parameters<LocalMvpScenarioPort["run"]>[0]) }); }
        catch { writeJson(response, 422, { error: "local_mvp_scenario_failed", message: "The local MVP scenario could not be completed" }); }
        return;
      }
      if (request.method === "POST" && requestUrl === "/api/v1/auth/otp/request" && dependencies.authentication && !dependencies.nonProductionOnly) {
        const input = await readJson(request) as Parameters<LocalAuthenticationService["request"]>[0];
        const result = await dependencies.authentication.request(input); writeJson(response, 200, { data: { challengeId: result.challengeId, expiresAt: result.expiresAt } }); return;
      }
      if (request.method === "POST" && requestUrl === "/api/v1/auth/otp/verify" && dependencies.authentication && !dependencies.nonProductionOnly) {
        const input = await readJson(request) as Parameters<LocalAuthenticationService["verify"]>[0];
        const result = await dependencies.authentication.verify(input); writeJson(response, 200, { data: { sessionId: result.sessionId, token: result.token } }); return;
      }

      const id = requestId(request);
      if (dependencies.uat && requestUrl.startsWith("/api/v1/uat/")) {
        try {
          if (request.method === "POST" && requestUrl === "/api/v1/uat/fixtures") { writeUatSuccess(response, 201, await dependencies.uat.fixture(), id); return; }
          if (request.method === "POST" && requestUrl === "/api/v1/uat/memberships") {
            const input = validateMembershipRequest(await readJson(request));
            const customer = await dependencies.uat.resolveCustomerSession(bearer(request));
            const business = await dependencies.uat.resolveBusinessActor(businessToken(request));
            await dependencies.uat.ensureMembership(membershipInput(input, customer, business));
            writeUatSuccess(response, 201, { membershipId: input.membershipId, status: "ACTIVE" }, id); return;
          }
          if (request.method === "GET" && requestUrl === "/api/v1/uat/customers/me") {
            writeUatSuccess(response, 200, await dependencies.uat.resolveCustomer(bearer(request).length > 0 ? await dependencies.uat.resolveCustomerSession(bearer(request)) : (() => { throw new Error("customer authentication is required"); })()), id); return;
          }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/businesses/me")) { const query = validateBusinessQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.business(actor, query.businessId), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/brands")) { const query = validateBrandQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.brand(actor, query.businessId, query.brandId), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/programs")) { const query = validateProgramQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.program(actor, query.businessId, query.programId), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/memberships/")) { const query = validateMembershipQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.membership(actor, query.businessId, query.membershipId), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/xp-status/")) { const query = validateMembershipQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.xpStatus(actor, query.businessId, query.membershipId), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/rewards")) { const query = validateRewardsQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.eligibleRewards(actor, query.businessId, query.programId, query.membershipId), id); return; }
          if (request.method === "POST" && requestUrl === "/api/v1/uat/receipts") { const input = validateReceiptRequest(await readJson(request)); const customer = await dependencies.uat.resolveCustomerSession(bearer(request)); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); if (actor.businessId !== input.businessId) throw new Error("tenant context is not authorized"); writeUatSuccess(response, 201, await dependencies.uat.submitReceipt(receiptInput(input, customer)), id); return; }
          if (request.method === "POST" && requestUrl === "/api/v1/uat/redemptions/reserve") { const input = validateReservationRequest(await readJson(request)); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 201, await dependencies.uat.reserve(actor, reservationInput(input)), id); return; }
          if (request.method === "POST" && requestUrl.startsWith("/api/v1/uat/redemptions/") && requestUrl.endsWith("/confirm")) { const input = validateTransitionRequest(await readJson(request)); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.transition(actor, transitionInput(input, requestUrl.split("/").at(-2) ?? "", "CONFIRMED")), id); return; }
          if (request.method === "POST" && requestUrl.startsWith("/api/v1/uat/redemptions/") && requestUrl.endsWith("/cancel")) { const input = validateTransitionRequest(await readJson(request)); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.transition(actor, transitionInput(input, requestUrl.split("/").at(-2) ?? "", "CANCELLED")), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/reward-accounts/")) { const query = validateAccountQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.rewardAccount(actor, query.businessId, query.accountId), id); return; }
          if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/analytics")) { const query = validateAnalyticsQuery(new URL(request.url ?? "", "http://localhost")); const actor = await dependencies.uat.resolveBusinessActor(businessToken(request)); writeUatSuccess(response, 200, await dependencies.uat.analytics(actor, query.businessId, query.programId, query.from, query.to), id); return; }
          writeUatFailure(response, new Error("resource was not found"), id);
        } catch (error) { writeUatFailure(response, error, id); }
        return;
      }
      writeJson(response, 404, { error: "not_found" });
    })().catch((error) => writeJson(response, 400, { error: "invalid_request", message: error instanceof Error ? error.message : "Invalid request" }));
  };
}
