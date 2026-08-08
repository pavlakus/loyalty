export interface ApiResponseMetadata {
  readonly request_id: string;
  readonly timestamp: string;
}

export interface ApiErrorItem {
  readonly code: string;
  readonly message: string;
  readonly field: string | null;
}

export interface ApiSuccessResponse<TData> {
  readonly success: true;
  readonly data: TData;
  readonly metadata: ApiResponseMetadata;
  readonly errors: readonly [];
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly data: null;
  readonly metadata: ApiResponseMetadata;
  readonly errors: readonly ApiErrorItem[];
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

export function createSuccessResponse<TData>(
  data: TData,
  metadata: ApiResponseMetadata,
): ApiSuccessResponse<TData> {
  return { success: true, data, metadata, errors: [] };
}

export function createErrorResponse(
  errors: readonly ApiErrorItem[],
  metadata: ApiResponseMetadata,
): ApiErrorResponse {
  return { success: false, data: null, metadata, errors };
}

export {
  CustomerContractValidationError,
  normalizeCustomerEmail,
  validateAndNormalizeCustomerProfileUpdateRequest,
  validateCustomerProfileUpdateRequest,
  validateCustomerPreferredLanguage,
  type CustomerApiError,
  type CustomerMembershipSummary,
  type CustomerPrivacyState,
  type CustomerProfile,
  type CustomerProfileUpdateRequest,
  type ValidatedCustomerProfileUpdateRequest,
  type CustomerStatus,
} from "./customers.js";

export {
  BusinessContractValidationError,
  validateCreateBusinessRequest,
  validateUpdateBusinessRequest,
  type BusinessContract,
  type BusinessStatus,
  type CreateBusinessRequest,
  type UpdateBusinessRequest,
} from "./business.js";

export {
  LoyaltyProgramContractValidationError,
  validateCreateLoyaltyProgramRequest,
  validateLoyaltyProgramLifecycleCommand,
  validateLoyaltyProgramResponse,
  type CreateLoyaltyProgramRequest,
  type LoyaltyProgramLifecycleCommand,
  type LoyaltyProgramResponse,
  type LoyaltyProgramStatus,
} from "./loyalty-program.js";

export {
  MembershipContractValidationError,
  validateCreateMembershipRequest,
  validateMembershipLifecycleCommand,
  validateMembershipListResponse,
  validateMembershipResponse,
  type CreateMembershipRequest,
  type MembershipLifecycleCommand,
  type MembershipResponse,
  type MembershipListItem,
  type MembershipListResponse,
  type MembershipStatus,
} from "./membership.js";

export { ReceiptContractValidationError, validateRecordReceiptRequest, validateCancelReceiptRequest, type RecordReceiptRequest, type CancelReceiptRequest, type ReceiptStatus } from "./receipt.js";
export { REWARD_DEFINITION_TYPES, RedemptionContractValidationError, validateRewardDefinitionContract, validateReserveRewardPointsRequest, validateRedemptionLifecycleRequest, validateRedemptionReservationResponse, type RewardDefinitionContract, type RewardDefinitionType, type ReserveRewardPointsRequest, type RedemptionLifecycleRequest, type RedemptionReservationResponse } from "./redemption.js";
