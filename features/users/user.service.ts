import { UserCreateSchema, UserVerifySchema } from "@/shared/lib/zods/user.zod";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { createUserSelect, userRepository } from "./user.repository";
import {
  badRequest,
  notFound,
  tooManyRequest,
} from "@/shared/lib/error-handlers";
import bcrypt from "bcryptjs";
import { emailVerificationRepository } from "../email-verification/email-verification.repository";
import { Resend } from "resend";
import EmailOtpTemplate from "@/shared/emails/EmailOtp";
import { Session } from "next-auth";
import { canCreateStaffAccount } from "@/shared/lib/validations/user-access-validation";

export const userService = {
  create: async (
    session: Session["user"] | null,
    data: UserCreateSchema,
    prisma: Prisma.TransactionClient | PrismaClient,
  ) => {
    const userSelect = createUserSelect({
      id: true,
      emailVerified: true,
    });

    const findUser = await userRepository.findUserByEmail(
      data.email,
      userSelect,
      prisma,
    );

    if (findUser && findUser.emailVerified)
      throw badRequest("This email has already registered");

    if (findUser && !findUser.emailVerified)
      throw badRequest("This email has already used, yet haven't verified yet");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const transaction = await prisma.$transaction(async (tx) => {
      const createdUser = await userRepository.create(
        {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: data.creationType === "STAFF" ? (data.role as Role) : "GUEST",
          emailVerified: data.creationType === "STAFF" ? new Date() : null,
        },
        tx,
      );

      const emailVerificationExpiersDate = new Date();
      emailVerificationExpiersDate.setMinutes(
        emailVerificationExpiersDate.getMinutes() + 15,
      );

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const hashedOtpCode = await bcrypt.hash(otpCode, 10);

      const createdEmailVerification = await emailVerificationRepository.create(
        {
          code: hashedOtpCode,
          expiresAt: emailVerificationExpiersDate,
          user: {
            connect: {
              id: createdUser.id,
            },
          },
          requestNewOtpCounter: 1,
        },
        tx,
      );

      const resend = new Resend(process.env.RESEND_API_KEY);

      if (
        data.creationType === "STAFF" &&
        session &&
        canCreateStaffAccount(session.role)
      ) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: data.email,
          subject: `Verify your BIZ Hotel account (Expires in 15 mins)`,
          react: EmailOtpTemplate({
            expirationMinutes: 15,
            hotelName: "BIZ Hotel",
            otpCode: otpCode,
            userName: data.name,
            supportEmail: "www.bizhotelbatam.com",
            verificationUrl:
              process.env.NEXT_PUBLIC_BASE_URL +
              "/users/verify/" +
              createdEmailVerification.id,
          }),
        });
      }

      return {
        userId: createdUser.id,
        emailVerificationId: createdEmailVerification.id,
      };
    });

    return {
      message:
        "Account created successfully. Next step is to verify your account. Check your email, please!",
      userId: transaction.userId,
      emailVerificationId: transaction.emailVerificationId,
    };
  },

  verify: async (
    verificationId: string,
    data: UserVerifySchema,
    prisma: Prisma.TransactionClient | PrismaClient,
  ) => {
    const userSelect = createUserSelect({
      id: true,
      emailVerified: true,
      EmailOtpVerification: true,
    });

    const user = await userRepository.findUserByEmail(
      data.email,
      userSelect,
      prisma,
    );

    const emailOtpVerification = await emailVerificationRepository.findById(
      verificationId,
      {
        code: true,
        id: true,
      },
      prisma,
    );

    if (!user) throw notFound("user not found");

    if (!user?.emailVerified) throw badRequest("Email has already verified");

    if (!user.EmailOtpVerification?.id) throw badRequest("OTP Code not found");

    const isVerificationIdExact =
      user.EmailOtpVerification.id === emailOtpVerification?.id;

    if (!isVerificationIdExact)
      throw badRequest(
        "The verification id is wrong. Try to request a new OTP code again.",
      );

    if (user.EmailOtpVerification.inputOtpCounter >= 3)
      throw tooManyRequest(
        "You have already reached your maximum limit of inputting OTP",
      );

    const isOtpExact = await bcrypt.compare(
      data.otpCode,
      user.EmailOtpVerification.code,
    );

    if (isOtpExact) {
      await userRepository.update(
        user.id,
        {
          emailVerified: new Date(),
        },
        prisma,
      );

      return {
        message: "Email verified successfully",
        success: true,
      };
    } else {
      await userRepository.update(
        user.id,
        {
          EmailOtpVerification: {
            update: {
              inputOtpCounter: {
                increment: 1,
              },
            },
          },
        },
        prisma,
      );

      return {
        message: "The OTP code is wrong",
        success: false,
      };
    }
  },
};
