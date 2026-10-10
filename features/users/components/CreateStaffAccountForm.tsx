"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { userApi } from "@/features/users/user.api";
import {
  userCreateSchema,
  type UserCreateSchema,
} from "@/shared/lib/zods/user.zod";
import { cn } from "@/shared/lib/utils";

// Staff-only options. The schema itself allows every Role, but this form
// never offers GUEST.
const STAFF_ROLE_OPTIONS = [
  "HOTEL_MANAGER",
  "SUPERVISOR",
  "ACCOUNTANT",
  "HOUSEKEEPING",
  "FRONT_DESK",
  "ADMIN",
] as const;

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[12px] font-medium text-red-600">{message}</p>;
}

export default function CreateStaffAccountForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserCreateSchema>({
    resolver: zodResolver(userCreateSchema) as Resolver<UserCreateSchema>,
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      creationType: "STAFF",
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await userApi.createStaffAccount(values);
      toast.success(result.message ?? "Staff account created successfully.");
      reset();
    } catch {
      /* API errors are toasted by the global api interceptor */
    }
  });

  return (
    <div className="font-ui min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white px-7 py-10 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:px-10">
        <div className="text-center mb-8">
          <h1 className="font-brand text-[28px] leading-tight text-slate-900">
            Create Staff Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The new staff account is active immediately.
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-[13px] font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter staff full name"
              autoComplete="name"
              disabled={isSubmitting}
              {...register("name")}
              className={cn(inputClassName, errors.name && "border-red-400")}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-slate-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter staff email"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email")}
              className={cn(inputClassName, errors.email && "border-red-400")}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="phoneNumber"
              className="block text-[13px] font-medium text-slate-700"
            >
              Phone number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter staff phone number"
              autoComplete="tel"
              disabled={isSubmitting}
              {...register("phoneNumber")}
              className={cn(
                inputClassName,
                errors.phoneNumber && "border-red-400",
              )}
            />
            <FieldError message={errors.phoneNumber?.message} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-[13px] font-medium text-slate-700"
            >
              Staff role
            </label>
            <select
              id="role"
              disabled={isSubmitting}
              defaultValue=""
              {...register("role")}
              className={cn(inputClassName, errors.role && "border-red-400")}
            >
              <option value="" disabled>
                Select a staff role
              </option>
              {STAFF_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <FieldError message={errors.role?.message} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("password")}
                className={cn(
                  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 pr-16 text-[14px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60",
                  errors.password && "border-red-400",
                )}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-slate-500 hover:text-slate-900 disabled:opacity-50"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-[13px] font-medium text-slate-700"
            >
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Repeat the password"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register("confirmPassword")}
              className={cn(
                inputClassName,
                errors.confirmPassword && "border-red-400",
              )}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-md bg-amber-800 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-white shadow-sm transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create Staff Account"}
          </button>
          <div className="flex items-center justify-center pt-1">
            <Link
              href="/dashboard"
              className="text-[13px] font-medium text-slate-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
