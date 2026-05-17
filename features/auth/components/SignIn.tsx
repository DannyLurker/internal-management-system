"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignIn() {
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="font-ui min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white px-7 py-10 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:px-10">
        <div className="text-center mb-8">
          <h1 className="font-brand text-[28px] leading-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please enter your details to sign in to your account.
          </p>
        </div>
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
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
              name="email"
              placeholder="Enter your email"
              required
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-slate-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-200"
              />
              <span className="text-[13px]">Remember me</span>
            </label>
            <Link
              href="#"
              className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-amber-800 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-white shadow-sm transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
