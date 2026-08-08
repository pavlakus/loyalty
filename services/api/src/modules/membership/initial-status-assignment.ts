import { validateStatusLevelConfiguration, type StatusLevelConfiguration } from "../loyalty-program/status-levels.js";

export interface InitialStatusAssignmentInput {
  readonly membershipId: string;
  readonly programConfigurationVersionId: string;
  readonly statusLevelConfiguration: StatusLevelConfiguration;
}

export interface InitialStatusAssignment {
  readonly membershipId: string;
  readonly programConfigurationVersionId: string;
  readonly statusLevelId: string;
}

export class InitialStatusAssignmentError extends Error {
  constructor(readonly code: "IDENTIFIER_INVALID" | "CONFIGURATION_INVALID", message: string) {
    super(message);
    this.name = "InitialStatusAssignmentError";
  }
}

function identifier(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new InitialStatusAssignmentError("IDENTIFIER_INVALID", "assignment identifiers must be non-empty");
  return value.trim();
}

export function assignInitialStatus(input: InitialStatusAssignmentInput): InitialStatusAssignment {
  const membershipId = identifier(input.membershipId);
  const programConfigurationVersionId = identifier(input.programConfigurationVersionId);
  let configuration: StatusLevelConfiguration;
  try {
    configuration = validateStatusLevelConfiguration(input.statusLevelConfiguration);
  } catch (error) {
    if (error instanceof Error) throw new InitialStatusAssignmentError("CONFIGURATION_INVALID", error.message);
    throw error;
  }
  const lowest = configuration.levels[0];
  if (lowest === undefined) throw new InitialStatusAssignmentError("CONFIGURATION_INVALID", "at least one Status Level is required");
  return { membershipId, programConfigurationVersionId, statusLevelId: lowest.id };
}
