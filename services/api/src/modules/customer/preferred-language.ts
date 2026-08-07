import { validateCustomerPreferredLanguage } from "@loyalty-platform/api-contracts";

export interface CustomerPreferredLanguageSources {
  readonly preferred_language: string | null;
  readonly application_locale: string | null;
  readonly brand_fallback: string | null;
  readonly platform_fallback: string;
}

/**
 * Resolve the effective Customer language without mutating profile data.
 * The explicit Customer preference always wins over contextual fallbacks.
 */
export function resolveCustomerPreferredLanguage(
  sources: CustomerPreferredLanguageSources,
): string {
  const candidates = [
    sources.preferred_language,
    sources.application_locale,
    sources.brand_fallback,
    sources.platform_fallback,
  ];

  for (const candidate of candidates) {
    if (candidate !== null) {
      return validateCustomerPreferredLanguage(candidate) as string;
    }
  }

  // platform_fallback is required by the input contract, so this is defensive
  // protection for callers that bypass static typing.
  throw new Error("Customer language resolution requires a platform fallback");
}
