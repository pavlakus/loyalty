import { pathToFileURL } from "node:url";

import { startServer, type RunningServer } from "./bootstrap/start-server.js";

function isMainModule(): boolean {
  const entrypoint = process.argv[1];
  return entrypoint !== undefined && import.meta.url === pathToFileURL(entrypoint).href;
}

function registerShutdownHandlers(runningServer: RunningServer): void {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    try {
      await runningServer.close();
      console.info(`API server stopped after ${signal}`);
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

if (isMainModule()) {
  startServer()
    .then((runningServer) => {
      registerShutdownHandlers(runningServer);
      const address = runningServer.server.address();
      console.info(
        `API server listening on ${typeof address === "string" ? address : `${address?.address}:${address?.port}`}`,
      );
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
