export interface StatusLevelDefinition {
  readonly id: string;
  readonly name: string;
  readonly rank: number;
  readonly minimumXp: bigint;
  readonly minimumVisits: number;
  readonly benefitDefinitionIds: readonly string[];
}

export interface StatusLevelConfiguration {
  readonly levels: readonly StatusLevelDefinition[];
  readonly maximumDowngradePerYear?: number;
}

export class StatusLevelConfigurationError extends Error {
  constructor(readonly code: "LEVEL_INVALID" | "LEVEL_DUPLICATE" | "LEVEL_ORDER_INVALID" | "THRESHOLD_INVALID" | "BENEFIT_REFERENCE_INVALID" | "DOWNGRADE_INVALID", message: string) {
    super(message);
    this.name = "StatusLevelConfigurationError";
  }
}

function id(value: unknown, code: "LEVEL_INVALID" | "BENEFIT_REFERENCE_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new StatusLevelConfigurationError(code, "identifier must not be empty");
  return value.trim();
}

export function validateStatusLevelConfiguration(value: unknown): StatusLevelConfiguration {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new StatusLevelConfigurationError("LEVEL_INVALID", "configuration must be an object");
  const input = value as Record<string, unknown>;
  if (!Array.isArray(input.levels) || input.levels.length === 0) throw new StatusLevelConfigurationError("LEVEL_INVALID", "at least one Status Level is required");
  const ids = new Set<string>();
  const ranks = new Set<number>();
  const levels = input.levels.map((raw) => {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new StatusLevelConfigurationError("LEVEL_INVALID", "level must be an object");
    const level = raw as Record<string, unknown>;
    const levelId = id(level.id, "LEVEL_INVALID");
    if (ids.has(levelId)) throw new StatusLevelConfigurationError("LEVEL_DUPLICATE", "Status Level identifiers must be unique");
    ids.add(levelId);
    if (typeof level.name !== "string" || level.name.trim() === "") throw new StatusLevelConfigurationError("LEVEL_INVALID", "Status Level name must not be empty");
    if (!Number.isInteger(level.rank) || (level.rank as number) < 1 || ranks.has(level.rank as number)) throw new StatusLevelConfigurationError("LEVEL_ORDER_INVALID", "Status Level ranks must be unique positive integers");
    ranks.add(level.rank as number);
    if (typeof level.minimumXp !== "bigint" || level.minimumXp < 0n || !Number.isInteger(level.minimumVisits) || (level.minimumVisits as number) < 0) throw new StatusLevelConfigurationError("THRESHOLD_INVALID", "XP and visit thresholds must be non-negative");
    if (!Array.isArray(level.benefitDefinitionIds)) throw new StatusLevelConfigurationError("BENEFIT_REFERENCE_INVALID", "Benefit references must be an array");
    const benefitDefinitionIds = level.benefitDefinitionIds.map((benefitId) => id(benefitId, "BENEFIT_REFERENCE_INVALID"));
    if (new Set(benefitDefinitionIds).size !== benefitDefinitionIds.length) throw new StatusLevelConfigurationError("BENEFIT_REFERENCE_INVALID", "Benefit references must be unique");
    return { id: levelId, name: level.name.trim(), rank: level.rank as number, minimumXp: level.minimumXp, minimumVisits: level.minimumVisits as number, benefitDefinitionIds };
  }).sort((left, right) => left.rank - right.rank);
  for (let index = 1; index < levels.length; index += 1) if (levels[index].minimumXp < levels[index - 1].minimumXp || levels[index].minimumVisits < levels[index - 1].minimumVisits) throw new StatusLevelConfigurationError("THRESHOLD_INVALID", "ordered Status Levels cannot lower qualification thresholds");
  if (input.maximumDowngradePerYear !== undefined && (!Number.isInteger(input.maximumDowngradePerYear) || (input.maximumDowngradePerYear as number) < 0)) throw new StatusLevelConfigurationError("DOWNGRADE_INVALID", "maximum downgrade per year must be non-negative");
  return { levels, ...(input.maximumDowngradePerYear === undefined ? {} : { maximumDowngradePerYear: input.maximumDowngradePerYear as number }) };
}
