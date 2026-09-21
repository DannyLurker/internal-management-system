import {
  badRequest,
  notFound,
  tooManyRequest,
} from "@/shared/lib/error-handlers";
import { User } from "./user.types";
import { EmailOtpVerification } from "../email-verification/email-verification.type";

export const assertCanCreateUser = (
  user: {
    id: string;
    emailVerified: Date | null;
  } | null,
) => {
  if (user && user.emailVerified)
    throw badRequest("This email has already registered");

  if (user && !user.emailVerified)
    throw badRequest("This email has already used, yet haven't verified yet");
};

export const assertCanRequestEmailOtp = (user: Partial<User>) => {
  if (user?.emailVerified) throw badRequest("This email has already verified.");
};

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

  const resetPeriodic = new Date(emailOtpVerification.updatedAt as Date);
  resetPeriodic.setDate(resetPeriodic.getDate() + 1);

  const isCooldownActive = now <= resetPeriodic;
  if (user.EmailOtpVerification.inputOtpCounter >= 3 && isCooldownActive) {
    throw tooManyRequest(
      "You have reached the maximum limit of OTP attempts. Please wait 24 hours.",
    );
  }
};
