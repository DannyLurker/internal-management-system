import z from "zod";
import { userRoleEnum } from "./general.zod";

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(3),
    email: z.email(),
    password: z.string().trim().min(8),
    confirmPassowrd: z.string().trim().min(8),
    role: userRoleEnum.optional(),
    phoneNumber: z.string(),
    creationType: z.enum(["GUEST", "STAFF"]),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassowrd) {
      ctx.addIssue({
        code: "invalid_value" as any,
        path: ["confirmPassword"],
        message: "password and confirm password are different",
      });
    }

    if (val.creationType !== "STAFF" && val.role) {
      ctx.addIssue({
        code: "invalid_value" as any,
        path: ["role"],
        message: "Role field is only fillable for staff creation.",
      });
    }

    if (val.creationType === "STAFF" && !val.role) {
      ctx.addIssue({
        code: "invalid_value" as any,
        path: ["role"],
        message: "Role field is required for staff creation.",
      });
    }
  });

export type UserCreateSchema = z.infer<typeof userCreateSchema>;

export const userVerifySchema = z.object({
  email: z.email(),
  otpCode: z.string().trim().length(6),
});

export type UserVerifySchema = z.infer<typeof userVerifySchema>;

export const userRequestOtpSchema = z.object({
  email: z.email(),
});

export type UserRequestOtpSchema = z.infer<typeof userRequestOtpSchema>;
