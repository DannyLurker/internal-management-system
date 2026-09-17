import { ApiResponse } from "@/shared/lib/api-client";

export type UserGuestCreateApiResponse = ApiResponse<{
  userId: string;
  emailVerificationId: string;
}>;

export type UserStaffCreateApiResponse = ApiResponse<{
  userId: string;
}>;

export type UserVerifyEmailApiResponse = ApiResponse<{
  success: boolean;
}>;

export type UserRequestEmailOtpApiResponse = ApiResponse<null>;
