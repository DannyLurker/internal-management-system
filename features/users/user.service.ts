import {
  UserCreateSchema,
  UserRequestEmailOtpSchema,
  UserRequestResetPasswordSchema,
  UserVerifyEmailSchema,
  UserVerifyResetPasswordSchema,
} from "@/shared/lib/zods/user.zod";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { createUserSelect, userRepository } from "./user.repository";
import { badRequest, tooManyRequest } from "@/shared/lib/error-handlers";
import bcrypt from "bcryptjs";
import { emailVerificationRepository } from "../email-verification/email-verification.repository";
import { Resend } from "resend";
import EmailOtpTemplate from "@/shared/emails/EmailOtp";
import { Session } from "next-auth";
import { resetPasswordVerificationRepository } from "../reset-password-verification/reset-password-verification.reopsitory";
import { ResetPasswordOtpTemplate } from "@/shared/emails/ResetPasswordOtp";
import {
  assertCanCreateUser,
  assertCanRequestEmailOtp,
  assertCanVerifyEmail,
} from "./user.rule";

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

    assertCanCreateUser(findUser);

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

  requestEmailOtp: async (
    data: UserRequestEmailOtpSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const user = await userRepository.findUserByEmail(
      data.email,
      {
        id: true,
        name: true,
        EmailOtpVerification: true,
        emailVerified: true,
      },
      prisma,
    );

    if (!user) {
      return {
        message:
          "An email OTP verification sended successfully. Check your email.",
      };
    }

    assertCanRequestEmailOtp(user);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtpCode = await bcrypt.hash(otpCode, 10);

    const otpcodeExpiresAt = new Date();
    otpcodeExpiresAt.setMinutes(otpcodeExpiresAt.getMinutes() + 15);

    const resend = new Resend();

    let emailVerificationOtp;

    if (!user.EmailOtpVerification) {
      emailVerificationOtp = await emailVerificationRepository.create(
        {
          code: hashedOtpCode,
          expiresAt: otpcodeExpiresAt,
          user: {
            connect: {
              id: user.id,
            },
          },
          inputOtpCounter: 0,
          requestNewOtpCounter: 1,
        },
        prisma,
      );

      const hashedEmailVerificationOtp = await bcrypt.hash(
        emailVerificationOtp.id,
        10,
      );

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: data.email,
        subject: `Verify your BIZ Hotel account (Expires in 15 mins)`,
        react: EmailOtpTemplate({
          expirationMinutes: 15,
          hotelName: "BIZ Hotel",
          otpCode: otpCode,
          userName: user.name,
          supportEmail: "www.bizhotelbatam.com",
          verificationUrl:
            process.env.NEXT_PUBLIC_BASE_URL +
            "/users/verify/" +
            hashedEmailVerificationOtp,
        }),
      });

      return {
        message:
          "An email OTP verification sended successfully. Check your email.",
        emailOtpVerificationId: emailVerificationOtp.id,
      };
    }

    const emailOtpLastRequest = user.EmailOtpVerification?.updatedAt;
    emailOtpLastRequest?.setDate(emailOtpLastRequest.getDate() + 1);

    if (
      emailOtpLastRequest > new Date() &&
      user.EmailOtpVerification.requestNewOtpCounter >= 3
    ) {
      throw tooManyRequest("You've already reached the limit of the requests");
    }

    // if requestOtpCounter === 3 then current requestNewOtp Counter will be 0
    if (
      user.EmailOtpVerification &&
      user.EmailOtpVerification.id &&
      user.EmailOtpVerification.requestNewOtpCounter === 3
    ) {
      emailVerificationOtp = await emailVerificationRepository.updateById(
        {
          where: {
            id: user.EmailOtpVerification.id,
          },
          data: {
            code: hashedOtpCode,
            requestNewOtpCounter: 0,
            expiresAt: otpcodeExpiresAt,
          },
        },
        prisma,
      );
    }

    // if requestOtpCounter < 3 then increment the current requestNewOtp Counter
    if (
      user.EmailOtpVerification &&
      user.EmailOtpVerification.id &&
      user.EmailOtpVerification.requestNewOtpCounter < 3
    ) {
      emailVerificationOtp = await emailVerificationRepository.updateById(
        {
          where: {
            id: user.EmailOtpVerification.id,
          },
          data: {
            code: hashedOtpCode,
            requestNewOtpCounter: {
              increment: 1,
            },
            expiresAt: otpcodeExpiresAt,
          },
        },
        prisma,
      );
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: `Verify your BIZ Hotel account (Expires in 15 mins)`,
      react: EmailOtpTemplate({
        expirationMinutes: 15,
        hotelName: "BIZ Hotel",
        otpCode: otpCode,
        userName: user.name,
        supportEmail: "www.bizhotelbatam.com",
        verificationUrl:
          process.env.NEXT_PUBLIC_BASE_URL +
          "/users/email-otps/" +
          user.EmailOtpVerification.id,
      }),
    });

    return {
      message:
        "An email OTP verification sended successfully. Check your email.",
      emailOtpVerificationId: emailVerificationOtp!.id,
    };
  },

  verifyEmail: async (
    verificationId: string,
    data: UserVerifyEmailSchema,
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
        id: true,
        code: true,
        expiresAt: true,
        updatedAt: true,
        inputOtpCounter: true,
        userId: true,
      },
      prisma,
    );

    const now = new Date();

    assertCanVerifyEmail(user, emailOtpVerification, now);

    const resetPeriodic = new Date(emailOtpVerification!.updatedAt);
    resetPeriodic.setDate(resetPeriodic.getDate() + 1);

    const isOtpExact = await bcrypt.compare(
      data.otpCode,
      user!.EmailOtpVerification!.code,
    );

    if (isOtpExact) {
      await userRepository.update(
        user!.id,
        {
          emailVerified: new Date(),
        },
        prisma,
      );

      await emailVerificationRepository.deleteById(
        user!.EmailOtpVerification!.id,
        prisma,
      );

      return {
        message: "Email verified successfully",
        success: true,
        userId: emailOtpVerification!.userId,
      };
    } else if (
      now > resetPeriodic &&
      emailOtpVerification!.inputOtpCounter === 3
    ) {
      await userRepository.update(
        user!.id,
        {
          EmailOtpVerification: {
            update: {
              inputOtpCounter: 1,
            },
          },
        },
        prisma,
      );

      return {
        message: "The OTP code is incorrect",
        success: false,
        userId: emailOtpVerification!.userId,
      };
    } else {
      await userRepository.update(
        user!.id,
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
        message: "The OTP code is incorrect",
        success: false,
        userId: emailOtpVerification!.userId,
      };
    }
  },

  requestResetPasswordOtp: async (
    data: UserRequestResetPasswordSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const user = await userRepository.findUserByEmail(
      data.email,
      {
        id: true,
        name: true,
        resetPasswordOtpVerification: true,
        emailVerified: true,
        lastPasswordChangedAt: true,
      },
      prisma,
    );

    if (!user) {
      return {
        message:
          "If this email is existed we will send the OTP. Check you email, please.",
      };
    }

    const allowedPeriodForPasswordChanged = user.lastPasswordChangedAt
      ? new Date(user.lastPasswordChangedAt)
      : null;

    // if there is a record when the user changed password, add twelve hours as a restriction so they can't spam requests
    if (allowedPeriodForPasswordChanged) {
      allowedPeriodForPasswordChanged?.setHours(
        allowedPeriodForPasswordChanged.getHours() + 12,
      );
    }

    const now = new Date();

    if (
      allowedPeriodForPasswordChanged &&
      allowedPeriodForPasswordChanged > now
    ) {
      throw tooManyRequest(
        "you've reached your limit of changing password. Next available changed at " +
          allowedPeriodForPasswordChanged,
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtpCode = await bcrypt.hash(otpCode, 10);

    const otpcodeExpiresAt = new Date();
    otpcodeExpiresAt.setMinutes(otpcodeExpiresAt.getMinutes() + 15);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const transaction = await prisma.$transaction(async (tx) => {
      let resetPasswordOtpVerification;

      // if reset password otp === null (No record), then create a new otp
      if (!user.resetPasswordOtpVerification?.id) {
        resetPasswordOtpVerification =
          await resetPasswordVerificationRepository.create(
            {
              code: hashedOtpCode,
              expiresAt: otpcodeExpiresAt,
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
            tx,
          );
      }

      // if request otp counter === 3, then requestOtpCounter will be reset to 1
      if (
        user.resetPasswordOtpVerification?.requestNewOtpCounter &&
        user.resetPasswordOtpVerification.requestNewOtpCounter === 3
      ) {
        resetPasswordOtpVerification =
          await resetPasswordVerificationRepository.update(
            user.resetPasswordOtpVerification!.id,
            {
              code: hashedOtpCode,
              expiresAt: otpcodeExpiresAt,
              requestNewOtpCounter: 1,
            },
            tx,
          );
      }

      // request otp counter < 3, then increment its value by 1
      resetPasswordOtpVerification =
        await resetPasswordVerificationRepository.update(
          user.resetPasswordOtpVerification!.id,
          {
            code: hashedOtpCode,
            expiresAt: otpcodeExpiresAt,
            requestNewOtpCounter: {
              increment: 1,
            },
          },
          tx,
        );

      return {
        resetPasswordOtpVerification,
      };
    });

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: `Changing Password Request on Your BIZ Hotel Account (Expires in 15 mins)`,
      react: ResetPasswordOtpTemplate({
        expirationMinutes: 15,
        hotelName: "BIZ Hotel",
        otpCode: otpCode,
        userName: user.name,
        supportEmail: "www.bizhotelbatam.com",
        verificationUrl:
          process.env.NEXT_PUBLIC_BASE_URL +
          "/users/password-otps/" +
          transaction.resetPasswordOtpVerification!.id,
      }),
    });

    return {
      message:
        "If this email is existed we will send the OTP. Check you email, please.",
      resetPasswordOtpVerificationId:
        transaction.resetPasswordOtpVerification!.id,
    };
  },

  resetPassword: async (
    id: string,
    data: UserVerifyResetPasswordSchema,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    const resetPasswordOtpVerification =
      await resetPasswordVerificationRepository.findById(
        id,
        { code: true, user: true, expiresAt: true, inputOtpCounter: true },
        prisma,
      );

    if (!resetPasswordOtpVerification)
      throw badRequest("Reset password OTP not found");

    if (resetPasswordOtpVerification.user.email !== data.email)
      throw badRequest("The reset password OTP id is incorrect.");

    const resetPasswordPeriodic = new Date(
      resetPasswordOtpVerification.updatedAt,
    );
    resetPasswordPeriodic.setDate(resetPasswordPeriodic.getDate() + 1);

    const now = new Date();

    if (!resetPasswordOtpVerification.user) throw badRequest("user is missing");

    if (resetPasswordOtpVerification.user.email !== data.email)
      throw badRequest("The email is different");

    if (
      resetPasswordOtpVerification.inputOtpCounter === 3 &&
      now < resetPasswordPeriodic
    ) {
      throw tooManyRequest("You've reached the input limit");
    }

    if (resetPasswordOtpVerification.expiresAt < now)
      throw badRequest("OTP has already expired");

    const isOtpExact = await bcrypt.compare(
      data.otpCode,
      resetPasswordOtpVerification.code,
    );

    const transaction = await prisma.$transaction(async (tx) => {
      if (isOtpExact) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await userRepository.update(
          resetPasswordOtpVerification.user.id,
          {
            password: hashedPassword,
            lastPasswordChangedAt: new Date(),
          },
          tx,
        );

        await resetPasswordVerificationRepository.delete(id, tx);

        return {
          message: "User password changed successfully",
          userId: resetPasswordOtpVerification.userId,
          success: true,
        };
      } else if (
        resetPasswordOtpVerification.inputOtpCounter === 3 &&
        now > resetPasswordPeriodic
      ) {
        await resetPasswordVerificationRepository.update(
          id,
          {
            inputOtpCounter: 1,
          },
          tx,
        );

        return {
          message: "The OTP code is incorrect. Try again.",
          userId: resetPasswordOtpVerification.userId,
          success: false,
        };
      } else {
        await resetPasswordVerificationRepository.update(
          id,
          {
            inputOtpCounter: { increment: 1 },
          },
          tx,
        );

        return {
          message: "The OTP code is incorrect. Try again.",
          userId: resetPasswordOtpVerification.userId,
          success: false,
        };
      }
    });

    return {
      message: transaction.message,
      userId: transaction.userId,
      success: transaction.success,
    };
  },
};
