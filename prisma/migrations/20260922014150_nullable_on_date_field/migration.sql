/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `EmailOtpVerification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ResetPasswordOtpVerification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailOtpVerification" DROP COLUMN "updatedAt",
ADD COLUMN     "lastInputOtp" TIMESTAMP(3),
ADD COLUMN     "lastRequestNewOtp" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ResetPasswordOtpVerification" DROP COLUMN "updatedAt",
ADD COLUMN     "lastInputOtp" TIMESTAMP(3),
ADD COLUMN     "lastRequestNewOtp" TIMESTAMP(3);
