export type NodeEnvironment = "development" | "test" | "production";

export interface ServerEnvironment {
  readonly nodeEnv: NodeEnvironment;
  readonly port: number;
  readonly host: string;
}

export class EnvironmentConfigurationError extends Error {
  public constructor(
    public readonly variableName: string,
    expected: string,
  ) {
    super(`Invalid environment configuration for ${variableName}: expected ${expected}`);
    this.name = "EnvironmentConfigurationError";
  }
}

const NODE_ENV_VALUES = new Set<NodeEnvironment>(["development", "test", "production"]);
const PORT_PATTERN = /^(0|[1-9][0-9]*)$/;
const HOST_PATTERN = /^[^\s\u0000-\u001f\u007f]+$/;

function parseNodeEnvironment(value: string | undefined): NodeEnvironment {
  const selected = value ?? "development";
  if (!NODE_ENV_VALUES.has(selected as NodeEnvironment)) {
    throw new EnvironmentConfigurationError("NODE_ENV", "development, test, or production");
  }

  return selected as NodeEnvironment;
}

function parsePort(value: string | undefined): number {
  const selected = value ?? "3000";
  if (!PORT_PATTERN.test(selected)) {
    throw new EnvironmentConfigurationError("PORT", "a base-10 integer from 0 through 65535");
  }

  const port = Number(selected);
  if (!Number.isSafeInteger(port) || port > 65535) {
    throw new EnvironmentConfigurationError("PORT", "a base-10 integer from 0 through 65535");
  }

  return port;
}

function parseHost(value: string | undefined): string {
  const selected = value ?? "127.0.0.1";
  if (selected.length === 0 || !HOST_PATTERN.test(selected)) {
    throw new EnvironmentConfigurationError("HOST", "a non-empty hostname or IP literal without whitespace");
  }

  return selected;
}

export function loadServerEnvironment(environment: NodeJS.ProcessEnv = process.env): ServerEnvironment {
  return {
    nodeEnv: parseNodeEnvironment(environment.NODE_ENV),
    port: parsePort(environment.PORT),
    host: parseHost(environment.HOST),
  };
}
