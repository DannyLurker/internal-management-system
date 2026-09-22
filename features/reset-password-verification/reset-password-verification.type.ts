import { resetPasswordVerificationRepository } from "./reset-password-verification.reopsitory";

export type ResetPasswordVerificationFindById = Awaited<
  ReturnType<typeof resetPasswordVerificationRepository.findById>
>;
