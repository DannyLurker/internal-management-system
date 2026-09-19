/*
  Warnings:

  - You are about to drop the column `last_password_changed_at` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "last_password_changed_at",
ADD COLUMN     "lastPasswordChangedAt" TIMESTAMPTZ(3);
