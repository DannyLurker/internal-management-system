/*
  Warnings:

  - You are about to drop the column `requestCounter` on the `EmailOtpVerification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailOtpVerification" DROP COLUMN "requestCounter",
ADD COLUMN     "inputOtpCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requestNewOtpCounter" INTEGER NOT NULL DEFAULT 1;
