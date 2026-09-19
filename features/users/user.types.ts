import { ApiResponse } from "@/shared/lib/api-client";

export type UserGuestCreateApiResponse = ApiResponse<{
  userId: string;
  emailVerificationId: string;
}>;

export type UserStaffCreateApiResponse = ApiResponse<{
  userId: string;
}>;

export type UserVerifyEmailApiResponse = ApiResponse<{
  userId: string;
  success: boolean;
}>;

export type UserRequestEmailOtpApiResponse = ApiResponse<{
  emailOtpVerificationId: string | null;
}>;

export type UserRequestPasswordOtpApiResponse = ApiResponse<{
  resetPasswordOtpVerificationId: string | null;
}>;

export type UserVerifPasswordApiResponse = ApiResponse<{
  userId: string;
  success: boolean;
}>;
