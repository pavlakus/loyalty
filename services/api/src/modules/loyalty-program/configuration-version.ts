import {
  createConfigurationDraft,
  type LoyaltyProgramConfigurationDraft,
} from "./program-configuration.js";

export interface LoyaltyProgramConfigurationVersion {
  readonly version: number;
  readonly versionKey: string;
  readonly programId: string;
  readonly effectiveFrom: string;
  readonly configuration: LoyaltyProgramConfigurationDraft;
}

export interface CreateConfigurationVersionInput {
  readonly version: number;
  readonly programId: string;
  readonly effectiveFrom: string;
  readonly configuration: LoyaltyProgramConfigurationDraft;
}

export class LoyaltyProgramConfigurationVersionError extends Error {
  constructor(readonly code: "VERSION_INVALID" | "VERSION_PROGRAM_MISMATCH" | "VERSION_TIMESTAMP_INVALID" | "VERSION_HISTORY_INVALID", message: string) {
    super(message);
    this.name = "LoyaltyProgramConfigurationVersionError";
  }
}

function timestamp(value: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || Number.isNaN(new Date(value).getTime()) || new Date(value).toISOString() !== value) throw new LoyaltyProgramConfigurationVersionError("VERSION_TIMESTAMP_INVALID", "effectiveFrom must be canonical UTC ISO-8601");
  return value;
}

function id(value: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new LoyaltyProgramConfigurationVersionError("VERSION_PROGRAM_MISMATCH", "Program identifier must not be empty");
  return value.trim();
}

export function createConfigurationVersion(input: CreateConfigurationVersionInput): LoyaltyProgramConfigurationVersion {
  if (!Number.isInteger(input.version) || input.version < 1) throw new LoyaltyProgramConfigurationVersionError("VERSION_INVALID", "version must be a positive integer");
  const programId = id(input.programId);
  if (input.configuration.programId !== programId) throw new LoyaltyProgramConfigurationVersionError("VERSION_PROGRAM_MISMATCH", "configuration belongs to another Program");
  const effectiveFrom = timestamp(input.effectiveFrom);
  return {
    version: input.version,
    versionKey: `${programId}:${input.version}`,
    programId,
    effectiveFrom,
    configuration: createConfigurationDraft(input.configuration),
  };
}

export function validateConfigurationHistory(versions: readonly LoyaltyProgramConfigurationVersion[]): readonly LoyaltyProgramConfigurationVersion[] {
  const ordered = [...versions].sort((left, right) => left.effectiveFrom.localeCompare(right.effectiveFrom));
  const seenVersions = new Set<number>();
  const seenEffectiveDates = new Set<string>();
  let previousVersion = 0;
  let programId: string | undefined;
  for (const version of ordered) {
    if (programId === undefined) programId = version.programId;
    if (version.programId !== programId || seenVersions.has(version.version) || seenEffectiveDates.has(version.effectiveFrom) || version.version <= previousVersion) throw new LoyaltyProgramConfigurationVersionError("VERSION_HISTORY_INVALID", "configuration history must be one Program with unique, increasing versions and effective dates");
    seenVersions.add(version.version);
    seenEffectiveDates.add(version.effectiveFrom);
    previousVersion = version.version;
  }
  return ordered.map((version) => ({ ...version, configuration: { ...version.configuration, sections: [...version.configuration.sections] } }));
}

export function selectEffectiveConfigurationVersion(versions: readonly LoyaltyProgramConfigurationVersion[], at: string): LoyaltyProgramConfigurationVersion | null {
  const effectiveAt = timestamp(at);
  const history = validateConfigurationHistory(versions);
  return history.filter((version) => version.effectiveFrom <= effectiveAt).at(-1) ?? null;
}
