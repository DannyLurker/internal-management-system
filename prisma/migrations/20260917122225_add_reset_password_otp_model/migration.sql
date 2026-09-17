-- CreateTable
CREATE TABLE "ResetPasswordOtpVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "requestNewOtpCounter" INTEGER NOT NULL DEFAULT 1,
    "inputOtpCounter" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResetPasswordOtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordOtpVerification_userId_key" ON "ResetPasswordOtpVerification"("userId");

-- AddForeignKey
ALTER TABLE "ResetPasswordOtpVerification" ADD CONSTRAINT "ResetPasswordOtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
