import type { IncomingMessage, ServerResponse } from "node:http";
import type { LocalMvpScenarioPort } from "../application/local-mvp-ports.js";
import type { LocalAuthenticationService } from "../application/local-authentication-service.js";

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
  readonly nonProductionOnly?: boolean;
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  let body = "";
  for await (const chunk of request) body += chunk;
  if (body.length === 0) return {};
  return JSON.parse(body);
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
    writeJson(response, 404, { error: "not_found" });
    })().catch(() => writeJson(response, 400, { error: "invalid_request" }));
  };
}
