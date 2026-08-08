export const LOYALTY_PROGRAM_CONFIGURATION_SECTIONS = [
  "REWARD_RULES",
  "REWARD_EXPERIENCE",
  "PENDING_AND_EXPIRATION",
  "XP_RULES",
  "STATUS_LEVELS",
  "BENEFIT_DEFINITIONS",
  "STRATEGY",
] as const;

export type LoyaltyProgramConfigurationSection = (typeof LOYALTY_PROGRAM_CONFIGURATION_SECTIONS)[number];

export interface ConfigurationSectionValue {
  readonly section: LoyaltyProgramConfigurationSection;
  readonly value: unknown;
}

export interface LoyaltyProgramConfigurationDraft {
  readonly programId: string;
  readonly sections: readonly ConfigurationSectionValue[];
}

export class LoyaltyProgramConfigurationValidationError extends Error {
  constructor(readonly code: "PROGRAM_ID_INVALID" | "CONFIGURATION_SECTION_INVALID" | "CONFIGURATION_DUPLICATE_SECTION", message: string) {
    super(message);
    this.name = "LoyaltyProgramConfigurationValidationError";
  }
}

function identifier(value: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new LoyaltyProgramConfigurationValidationError("PROGRAM_ID_INVALID", "Program identifier must not be empty");
  return value.trim();
}

function validateSection(section: ConfigurationSectionValue): ConfigurationSectionValue {
  if (!LOYALTY_PROGRAM_CONFIGURATION_SECTIONS.includes(section.section)) throw new LoyaltyProgramConfigurationValidationError("CONFIGURATION_SECTION_INVALID", "configuration section is not approved");
  if (section.value === null || typeof section.value !== "object" || Array.isArray(section.value)) throw new LoyaltyProgramConfigurationValidationError("CONFIGURATION_SECTION_INVALID", "configuration section value must be an object");
  return { section: section.section, value: { ...(section.value as Record<string, unknown>) } };
}

export function createConfigurationDraft(input: LoyaltyProgramConfigurationDraft): LoyaltyProgramConfigurationDraft {
  const programId = identifier(input.programId);
  if (!Array.isArray(input.sections)) throw new LoyaltyProgramConfigurationValidationError("CONFIGURATION_SECTION_INVALID", "sections must be an array");
  const sections = input.sections.map(validateSection);
  const seen = new Set<string>();
  for (const section of sections) {
    if (seen.has(section.section)) throw new LoyaltyProgramConfigurationValidationError("CONFIGURATION_DUPLICATE_SECTION", "a configuration section may occur only once in a draft");
    seen.add(section.section);
  }
  return { programId, sections };
}
