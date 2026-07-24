import type { IncomingMessage, ServerResponse } from "node:http";

function writeJson(response: ServerResponse, statusCode: number, body: object): void {
  const payload = JSON.stringify(body);
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("content-length", Buffer.byteLength(payload));
  response.end(payload);
}

export function createApplication(): (request: IncomingMessage, response: ServerResponse) => void {
  return (_request, response) => {
    const requestUrl = _request.url ?? "/";

    if (requestUrl === "/health") {
      writeJson(response, 200, { status: "ok" });
      return;
    }

    if (requestUrl === "/ready") {
      writeJson(response, 200, { status: "ready" });
      return;
    }

    writeJson(response, 404, { error: "not_found" });
  };
}
