import type { IncomingMessage, ServerResponse } from "node:http";
import type { LocalMvpScenarioPort } from "../application/local-mvp-ports.js";
import type { LocalAuthenticationService } from "../application/local-authentication-service.js";
import type { UatApiService } from "../application/uat-api-service.js";

function writeJson(response: ServerResponse, statusCode: number, body: object): void {
  const payload = JSON.stringify(body, (_key, value: unknown) => typeof value === "bigint" ? value.toString() : value);
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("content-length", Buffer.byteLength(payload));
  response.end(payload);
}

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

function bearer(request: IncomingMessage): string {
  const value = request.headers.authorization ?? "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

export function createApplication(dependencies: ApplicationDependencies = {}): (request: IncomingMessage, response: ServerResponse) => void {
  return (request, response) => {
    void (async () => {
    const requestUrl = request.url ?? "/";

    if (requestUrl === "/health") {
      writeJson(response, 200, { status: "ok" });
      return;
    }

    if (requestUrl === "/ready") {
      writeJson(response, 200, { status: "ready" });
      return;
    }

    if (request.method === "POST" && requestUrl === "/api/v1/local-mvp/scenario" && dependencies.localMvp && !dependencies.nonProductionOnly) {
      try {
        const result = await dependencies.localMvp.run(await readJson(request) as Parameters<LocalMvpScenarioPort["run"]>[0]);
        writeJson(response, 200, { data: result });
      } catch (error) {
        writeJson(response, 422, { error: "local_mvp_scenario_failed", message: "The local MVP scenario could not be completed" });
      }
      return;
    }
    if (request.method === "POST" && requestUrl === "/api/v1/auth/otp/request" && dependencies.authentication && !dependencies.nonProductionOnly) {
      const input = await readJson(request) as { phoneInput: string; region?: string; ipAddress: string; deviceOrClient: string; deploymentOrBusiness: string; correlationId: string };
      const result = await dependencies.authentication.request(input);
      writeJson(response, 200, { data: { challengeId: result.challengeId, expiresAt: result.expiresAt } });
      return;
    }
    if (request.method === "POST" && requestUrl === "/api/v1/auth/otp/verify" && dependencies.authentication && !dependencies.nonProductionOnly) {
      const input = await readJson(request) as { challengeId: string; otpCode: string };
      const result = await dependencies.authentication.verify(input);
      writeJson(response, 200, { data: { sessionId: result.sessionId, token: result.token } });
      return;
    }
    if (request.method === "POST" && requestUrl === "/api/v1/uat/fixtures" && dependencies.uat && !dependencies.nonProductionOnly) {
      try { writeJson(response, 201, { data: await dependencies.uat.fixture() }); } catch { writeJson(response, 403, { error: "uat_fixtures_disabled" }); }
      return;
    }
    if (dependencies.uat && requestUrl.startsWith("/api/v1/uat/")) {
      try {
        if (request.method === "POST" && requestUrl === "/api/v1/uat/memberships") {
          const input = await readJson(request) as Parameters<UatApiService["ensureMembership"]>[0];
          const customer = await dependencies.uat.resolveCustomerSession(bearer(request));
          const business = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          await dependencies.uat.ensureMembership({ ...input, customer, business });
          writeJson(response, 201, { data: { membershipId: input.membershipId, status: "ACTIVE" } });
          return;
        }
        if (request.method === "GET" && requestUrl === "/api/v1/uat/customers/me") {
          const identity = await dependencies.uat.resolveCustomerSession(bearer(request));
          writeJson(response, 200, { data: await dependencies.uat.resolveCustomer(identity) });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/businesses/me")) {
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          const businessId = new URL(request.url ?? "", "http://localhost").searchParams.get("businessId") ?? "";
          writeJson(response, 200, { data: await dependencies.uat.business(identity, businessId) });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/brands")) {
          const query = new URL(request.url ?? "", "http://localhost").searchParams;
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.brand(identity, query.get("businessId") ?? "", query.get("brandId") ?? "") });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/programs")) {
          const query = new URL(request.url ?? "", "http://localhost").searchParams;
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.program(identity, query.get("businessId") ?? "", query.get("programId") ?? "") });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/memberships/")) {
          const parsedUrl = new URL(request.url ?? "", "http://localhost");
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.membership(identity, parsedUrl.searchParams.get("businessId") ?? "", parsedUrl.pathname.split("/").pop() ?? "") });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/xp-status/")) {
          const parsedUrl = new URL(request.url ?? "", "http://localhost");
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.xpStatus(identity, parsedUrl.searchParams.get("businessId") ?? "", parsedUrl.pathname.split("/").pop() ?? "") });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/rewards")) {
          const parsedUrl = new URL(request.url ?? "", "http://localhost");
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.eligibleRewards(identity, parsedUrl.searchParams.get("businessId") ?? "", parsedUrl.searchParams.get("programId") ?? "", parsedUrl.searchParams.get("membershipId") ?? "") });
          return;
        }
        if (request.method === "POST" && requestUrl === "/api/v1/uat/receipts") {
          const input = await readJson(request) as Parameters<UatApiService["submitReceipt"]>[0];
          const customer = await dependencies.uat.resolveCustomerSession(bearer(request));
          const business = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          if (business.businessId !== input.businessId) throw new Error("tenant context is not authorized");
          const result = await dependencies.uat.submitReceipt({ ...input, identity: customer });
          writeJson(response, 201, { data: result });
          return;
        }
        if (request.method === "POST" && requestUrl === "/api/v1/uat/redemptions/reserve") {
          const input = await readJson(request) as Parameters<UatApiService["reserve"]>[1];
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 201, { data: await dependencies.uat.reserve(identity, input) });
          return;
        }
        if (request.method === "POST" && requestUrl.startsWith("/api/v1/uat/redemptions/") && requestUrl.endsWith("/confirm")) {
          const input = await readJson(request) as { businessId: string; transitionedAt: string };
          const redemptionId = requestUrl.split("/").at(-2) ?? "";
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.transition(identity, { ...input, redemptionId, targetState: "CONFIRMED" }) });
          return;
        }
        if (request.method === "POST" && requestUrl.startsWith("/api/v1/uat/redemptions/") && requestUrl.endsWith("/cancel")) {
          const input = await readJson(request) as { businessId: string; transitionedAt: string };
          const redemptionId = requestUrl.split("/").at(-2) ?? "";
          const identity = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.transition(identity, { ...input, redemptionId, targetState: "CANCELLED" }) });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/reward-accounts/")) {
          const parsedUrl = new URL(request.url ?? "", "http://localhost");
          const accountId = parsedUrl.pathname.split("/").pop() ?? "";
          const business = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          const businessId = String(parsedUrl.searchParams.get("businessId") ?? "");
          writeJson(response, 200, { data: await dependencies.uat.rewardAccount(business, businessId, accountId) });
          return;
        }
        if (request.method === "GET" && requestUrl.startsWith("/api/v1/uat/analytics")) {
          const query = new URL(request.url ?? "", "http://localhost").searchParams;
          const business = await dependencies.uat.resolveBusinessActor(String((request.headers["x-uat-business-token"] ?? "")));
          writeJson(response, 200, { data: await dependencies.uat.analytics(business, query.get("businessId") ?? "", query.get("programId") ?? "", query.get("from") ?? "1970-01-01T00:00:00.000Z", query.get("to") ?? "2999-01-01T00:00:00.000Z") });
          return;
        }
      } catch { writeJson(response, 403, { error: "uat_request_not_authorized" }); return; }
    }
    writeJson(response, 404, { error: "not_found" });
    })().catch(() => writeJson(response, 400, { error: "invalid_request" }));
  };
}
