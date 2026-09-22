// User rule validation utilities
import {
  badRequest,
  notFound,
  tooManyRequest,
} from "@/shared/lib/error-handlers";
import { User } from "./user.types";
import { EmailOtpVerification } from "../email-verification/email-verification.type";
import { ResetPasswordOtpVerification } from "@prisma/client";
import { ResetPasswordVerificationFindById } from "../reset-password-verification/reset-password-verification.type";
import { UserVerifyResetPasswordSchema } from "@/shared/lib/zods/user.zod";

// ---------------------------------------------------------------------
// USER CREATION
// ---------------------------------------------------------------------
export const assertCanCreateUser = (
  user: { id: string; emailVerified: Date | null } | null,
) => {
  if (user && user.emailVerified) {
    throw badRequest("This email has already registered");
  }
  if (user && !user.emailVerified) {
    throw badRequest("This email has already used, yet haven't verified yet");
  }
};

// ---------------------------------------------------------------------
// REQUEST EMAIL OTP
// ---------------------------------------------------------------------
export const assertCanRequestEmailOtp = (
  user: Partial<User>,
  lastRequestNewOtp: Date | null,
  now: Date,
  requestNewOtpCounter: number | undefined,
) => {
  if (user?.emailVerified) {
    throw badRequest("This email has already verified.");
  }

  // Rate‑limit: max 3 requests in a rolling 12‑hour window
  if (
    lastRequestNewOtp &&
    lastRequestNewOtp > now &&
    requestNewOtpCounter &&
    requestNewOtpCounter >= 3
  ) {
    throw tooManyRequest("You've already reached the limit of the requests");
  }
};

// ---------------------------------------------------------------------
// VERIFY EMAIL OTP
// ---------------------------------------------------------------------
export const assertCanVerifyEmail = (
  user: Partial<User>,
  emailOtpVerification: Partial<EmailOtpVerification> | null,
  now: Date,
) => {
  if (!user) throw notFound("User not found");
  if (user.emailVerified) throw badRequest("Email has already been verified");
  if (!emailOtpVerification || !user.EmailOtpVerification) {
    throw notFound("Email OTP not found");
  }
  if (user.EmailOtpVerification.id !== emailOtpVerification.id) {
    throw badRequest(
      "The verification ID is incorrect. Try requesting a new OTP code.",
    );
  }
  if (emailOtpVerification.expiresAt && emailOtpVerification.expiresAt < now) {
    throw badRequest("OTP code has expired. Request a new one.");
  }
  // Cool‑down after 3 failed attempts within 10 minutes
  const lastInput = emailOtpVerification.lastInputOtp
    ? new Date(emailOtpVerification.lastInputOtp)
    : null;
  if (lastInput) {
    const cooldownUntil = new Date(lastInput);
    cooldownUntil.setMinutes(cooldownUntil.getMinutes() + 10);
    if (
      user.EmailOtpVerification.inputOtpCounter >= 3 &&
      now <= cooldownUntil
    ) {
      throw tooManyRequest(
        "You have reached the maximum limit of OTP attempts. Please wait 10 minutes.",
      );
    }
  }
};

// ---------------------------------------------------------------------
// REQUEST RESET PASSWORD OTP
// ---------------------------------------------------------------------
export const assertCanRequestResetPasswordOtp = (
  user: {
    id: string;
    name: string;
    resetPasswordOtpVerification: ResetPasswordOtpVerification | null;
    emailVerified: Date | null;
    lastPasswordChangedAt: Date | null;
  } | null,
) => {
  // If the user does not exist we silently return – route will send generic message.
  if (!user) return;

  const allowedPeriod = user.lastPasswordChangedAt
    ? new Date(user.lastPasswordChangedAt)
    : null;
  if (allowedPeriod) {
    allowedPeriod.setHours(allowedPeriod.getHours() + 12);
    if (allowedPeriod > new Date()) {
      throw tooManyRequest(
        "you've reached your limit of changing password. Next available changed at " +
          allowedPeriod,
      );
    }
  }
};

// ---------------------------------------------------------------------
// RESET PASSWORD VALIDATION
// ---------------------------------------------------------------------
export function assertCanResetPassword(
  resetPasswordOtpVerification: ResetPasswordVerificationFindById,
  data: UserVerifyResetPasswordSchema,
  resetPasswordPeriodic: Date | null,
  now: Date,
): asserts resetPasswordOtpVerification is NonNullable<ResetPasswordVerificationFindById> {
  if (!resetPasswordOtpVerification)
    throw badRequest("Reset password OTP not found");
  if (!resetPasswordOtpVerification.user) throw badRequest("user is missing");
  if (resetPasswordOtpVerification.user.email !== data.email)
    throw badRequest("The email is different");
  if (
    resetPasswordOtpVerification.inputOtpCounter === 3 &&
    resetPasswordPeriodic &&
    now < resetPasswordPeriodic
  ) {
    throw tooManyRequest("You've reached the input limit");
  }
  if (resetPasswordOtpVerification.expiresAt < now) {
    throw badRequest("OTP has already expired");
  }
}
