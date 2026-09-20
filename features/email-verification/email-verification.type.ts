import { emailVerificationRepository } from "./email-verification.repository";

export type EmailOtpVerification = Awaited<
  ReturnType<typeof emailVerificationRepository.findById>
>;
