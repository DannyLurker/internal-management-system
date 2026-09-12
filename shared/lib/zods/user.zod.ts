import z from "zod";

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(3),
    email: z.email(),
    password: z.string().trim().min(8),
    confirmPassowrd: z.string().trim().min(8),
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
  });

export type UserCreateSchema = z.infer<typeof userCreateSchema>;
