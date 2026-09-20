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
  emailOtpVerification: Partial<EmailOtpVerification>,
  now: Date,
) => {
  if (!user) throw notFound("user not found");

  if (user?.emailVerified) throw badRequest("Email has already verified");

  if (!emailOtpVerification || !user.EmailOtpVerification?.id)
    throw notFound("Email OTP not found");

  const isVerificationIdExact =
    user.EmailOtpVerification.id === emailOtpVerification.id;

  if (!isVerificationIdExact)
    throw badRequest(
      "The verification id is incorrect. Try to request a new OTP code again.",
    );

  if (user.EmailOtpVerification.inputOtpCounter >= 3)
    throw tooManyRequest(
      "You have already reached your maximum limit of inputting OTP",
    );

  if ((emailOtpVerification.expiresAt as Date) < now) {
    throw badRequest("OTP code has already epxired. Request a new one.");
  }
};
