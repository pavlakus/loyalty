import { createConfigurationDraft, type LoyaltyProgramConfigurationDraft } from "./program-configuration.js";

export interface ProgramConfigurationInvariantInput {
  readonly programId: string;
  readonly programConfigurationVersionId: string;
  readonly configuration: LoyaltyProgramConfigurationDraft;
}

export class ProgramInvariantValidationError extends Error {
  constructor(readonly code: "PROGRAM_ID_INVALID" | "VERSION_ID_INVALID" | "VERSION_OWNERSHIP_INVALID" | "CONFIGURATION_INVALID", message: string) {
    super(message);
    this.name = "ProgramInvariantValidationError";
  }
}

function identifier(value: unknown, code: "PROGRAM_ID_INVALID" | "VERSION_ID_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new ProgramInvariantValidationError(code, "identifier must not be empty");
  return value.trim();
}

export function validateProgramConfigurationInvariants(input: ProgramConfigurationInvariantInput): ProgramConfigurationInvariantInput {
  const programId = identifier(input.programId, "PROGRAM_ID_INVALID");
  const versionId = identifier(input.programConfigurationVersionId, "VERSION_ID_INVALID");
  if (!versionId.startsWith(`${programId}:`)) throw new ProgramInvariantValidationError("VERSION_OWNERSHIP_INVALID", "configuration version belongs to another Program");
  if (input.configuration.programId !== programId) throw new ProgramInvariantValidationError("CONFIGURATION_INVALID", "configuration belongs to another Program");
  try {
    return { programId, programConfigurationVersionId: versionId, configuration: createConfigurationDraft(input.configuration) };
  } catch (error) {
    if (error instanceof Error) throw new ProgramInvariantValidationError("CONFIGURATION_INVALID", error.message);
    throw error;
  }
}
