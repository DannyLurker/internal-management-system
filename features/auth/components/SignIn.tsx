"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignIn() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Handling login execution wrapped in a throwing Promise
    const loginPromise = (async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // Handling NextAuth response error inspection
      if (res?.error) {
        // NextAuth v5 passes custom codes in res.code or via URL search params
        const urlParams = res.url ? new URL(res.url).searchParams : null;
        const errorCode = res.code || urlParams?.get("code") || res.error;

        // Explicitly throwing an error so toast.promise catches it
        throw new Error(errorCode);
      }

      return res;
    })();

    // Handling toast notifications bound to the custom promise
    toast.promise(loginPromise, {
      loading: "Signing you in...",
      success: () => {
        // Handling post-login redirection on success
        window.location.href = "/dashboard";
        return "Welcome back! Redirecting...";
      },
      error: (err: unknown) => {
        console.error("Caught login error:", err);

        const errorMsg = err instanceof Error ? err.message : String(err);

        if (
          errorMsg.includes("email_not_verified") ||
          errorMsg.includes("EmailNotVerified")
        ) {
          return "Your email address has not been verified yet. Please check your inbox / click the verify link.";
        }

        return "Invalid email or password.";
      },
    });
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
          <div className="flex items-center border-b-2 pt-1">
            <Link
              href="#"
              className="text-[13px] font-medium text-slate-900 hover:black mb-2"
            >
              Forgot password?
            </Link>
          </div>
          <div className="flex items-center justify-center pt-1">
            <p className="text-[13px] font-medium text-slate-600">
              Haven't gotten an account yet?&nbsp;
            </p>
            <Link
              href="#"
              className="text-[13px] font-medium text-slate-900 hover:black"
            >
              {" "}
              Sign Up
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
