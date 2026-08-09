import { createServer, type Server } from "node:http";

import { createApplication, type ApplicationDependencies } from "./create-application.js";
import { createLocalMvpComposition } from "../infrastructure/postgres/composition-root.js";
import { loadServerEnvironment, type ServerEnvironment } from "../config/environment.js";

export interface ServerOptions {
  readonly host?: string;
  readonly port?: number;
  readonly application?: ApplicationDependencies;
  readonly closeResources?: () => Promise<void>;
}

export interface RunningServer {
  readonly server: Server;
  readonly close: () => Promise<void>;
}

function resolvePort(port: number | undefined, environment: ServerEnvironment): number {
  const selectedPort = port ?? environment.port;

  if (!Number.isInteger(selectedPort) || selectedPort < 0 || selectedPort > 65535) {
    throw new Error(`API startup failed: invalid PORT value "${selectedPort}"`);
  }

  return selectedPort;
}

function resolveHost(host: string | undefined, environment: ServerEnvironment): string {
  return host ?? environment.host;
}

export function startServer(options: ServerOptions = {}): Promise<RunningServer> {
  const environment = loadServerEnvironment();
  const port = resolvePort(options.port, environment);
  const host = resolveHost(options.host, environment);
  const composition = options.application || !process.env.DATABASE_URL ? undefined : createLocalMvpComposition();
  const application = options.application ?? { localMvp: composition?.localMvp.createPort(), authentication: composition?.authentication, uat: composition?.uat, nonProductionOnly: environment.nodeEnv === "production" };
  const server = createServer(createApplication(application));

  return new Promise((resolve, reject) => {
    const onError = (error: Error): void => {
      server.removeListener("listening", onListening);
      reject(new Error(`API startup failed: ${error.message}`, { cause: error }));
    };

    const onListening = (): void => {
      server.removeListener("error", onError);
      resolve({ server, close: async () => { await closeServer(server); await options.closeResources?.(); await composition?.pool.end(); } });
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

function closeServer(server: Server): Promise<void> {
  if (!server.listening) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(new Error(`API shutdown failed: ${error.message}`, { cause: error }));
        return;
      }

      resolve();
    });
  });
}
