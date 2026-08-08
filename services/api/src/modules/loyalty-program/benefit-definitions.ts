export type BenefitType = "REWARD_POINT_MULTIPLIER" | "POINT_EXPIRATION_EXTENSION" | "REDEMPTION_LIMIT_OVERRIDE" | "PROMOTION_ACCESS";

export interface RewardPointMultiplierConfiguration { readonly multiplier: string; }
export interface PointExpirationExtensionConfiguration { readonly extensionDays: number; }
export interface RedemptionLimitOverrideConfiguration { readonly maxRedemptionIncreasePercent: string; }
export interface PromotionAccessConfiguration { readonly promotionKey: string; }
export type BenefitConfiguration = RewardPointMultiplierConfiguration | PointExpirationExtensionConfiguration | RedemptionLimitOverrideConfiguration | PromotionAccessConfiguration;

export interface BenefitDefinition {
  readonly benefitDefinitionId: string;
  readonly type: BenefitType;
  readonly displayName: string;
  readonly description: string | null;
  readonly enabled: boolean;
  readonly configuration: BenefitConfiguration;
  readonly programConfigurationVersionId: string;
}

export class BenefitDefinitionValidationError extends Error {
  constructor(readonly code: "ID_INVALID" | "TYPE_INVALID" | "TEXT_INVALID" | "CONFIGURATION_INVALID" | "DECIMAL_INVALID" | "DURATION_INVALID" | "PROMOTION_KEY_INVALID" | "DUPLICATE_ID", message: string) {
    super(message);
    this.name = "BenefitDefinitionValidationError";
  }
}

function id(value: unknown, code: "ID_INVALID" | "PROMOTION_KEY_INVALID"): string {
  if (typeof value !== "string" || value.trim() === "") throw new BenefitDefinitionValidationError(code, "identifier must not be empty");
  return value.trim();
}
function decimal(value: unknown, minimum: string): string {
  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)(?:\.\d{1,4})?$/u.test(value)) throw new BenefitDefinitionValidationError("DECIMAL_INVALID", "decimal must be a canonical non-negative value with at most four fractional digits");
  const scale = 10_000n;
  const [whole, fraction = ""] = value.split(".");
  const scaled = BigInt(whole) * scale + BigInt((fraction + "0000").slice(0, 4));
  const [minimumWhole, minimumFraction = ""] = minimum.split(".");
  const minimumScaled = BigInt(minimumWhole) * scale + BigInt((minimumFraction + "0000").slice(0, 4));
  if (scaled < minimumScaled) throw new BenefitDefinitionValidationError("DECIMAL_INVALID", "decimal is below the allowed minimum");
  return value;
}

function exactFields(value: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of Object.keys(value)) if (!fields.includes(field)) throw new BenefitDefinitionValidationError("CONFIGURATION_INVALID", `${field} is not allowed for this Benefit type`);
}

function configuration(type: BenefitType, value: unknown): BenefitConfiguration {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new BenefitDefinitionValidationError("CONFIGURATION_INVALID", "configuration must be an object");
  const input = value as Record<string, unknown>;
  if (type === "REWARD_POINT_MULTIPLIER") {
    exactFields(input, ["multiplier"]);
    return { multiplier: decimal(input.multiplier, "1") };
  }
  if (type === "POINT_EXPIRATION_EXTENSION") {
    exactFields(input, ["extensionDays"]);
    if (!Number.isInteger(input.extensionDays) || (input.extensionDays as number) < 1) throw new BenefitDefinitionValidationError("DURATION_INVALID", "extensionDays must be a positive whole number");
    return { extensionDays: input.extensionDays as number };
  }
  if (type === "REDEMPTION_LIMIT_OVERRIDE") {
    exactFields(input, ["maxRedemptionIncreasePercent"]);
    return { maxRedemptionIncreasePercent: decimal(input.maxRedemptionIncreasePercent, "0") };
  }
  exactFields(input, ["promotionKey"]);
  return { promotionKey: id(input.promotionKey, "PROMOTION_KEY_INVALID") };
}

export function validateBenefitDefinitions(values: readonly BenefitDefinition[]): readonly BenefitDefinition[] {
  const ids = new Set<string>();
  return values.map((value) => {
    const benefitDefinitionId = id(value.benefitDefinitionId, "ID_INVALID");
    if (ids.has(benefitDefinitionId)) throw new BenefitDefinitionValidationError("DUPLICATE_ID", "Benefit Definition identifiers must be unique within a configuration");
    ids.add(benefitDefinitionId);
    if (!["REWARD_POINT_MULTIPLIER", "POINT_EXPIRATION_EXTENSION", "REDEMPTION_LIMIT_OVERRIDE", "PROMOTION_ACCESS"].includes(value.type)) throw new BenefitDefinitionValidationError("TYPE_INVALID", "Benefit type is not supported");
    if (typeof value.displayName !== "string" || value.displayName.trim() === "") throw new BenefitDefinitionValidationError("TEXT_INVALID", "display name must not be empty");
    if (value.description !== null && typeof value.description !== "string") throw new BenefitDefinitionValidationError("TEXT_INVALID", "description must be text or null");
    if (typeof value.enabled !== "boolean") throw new BenefitDefinitionValidationError("CONFIGURATION_INVALID", "enabled must be boolean");
    return { ...value, benefitDefinitionId, displayName: value.displayName.trim(), description: value.description?.trim() ?? null, configuration: configuration(value.type, value.configuration), programConfigurationVersionId: id(value.programConfigurationVersionId, "ID_INVALID") };
  });
}
