import Link from "next/link";
import { redirect } from "next/navigation";
import CreateStaffAccountForm from "@/features/users/components/CreateStaffAccountForm";
import { auth } from "@/shared/lib/auth";
import { canCreateStaffAccount } from "@/shared/lib/validations/user-access-validation";

const page = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/staff/create");
  }

  // Only roles allowed to create staff accounts
  // (currently HOTEL_MANAGER, mirroring POST /api/auth/users) may open it.
  if (!canCreateStaffAccount(session.user.role)) {
    return (
      <div className="font-ui min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white px-7 py-10 text-center shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:px-10">
          <h1 className="font-brand text-[24px] leading-tight text-slate-900">
            Access restricted
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Only a Hotel Manager can create staff accounts.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block w-full rounded-md bg-amber-800 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-white shadow-sm transition hover:bg-amber-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateStaffAccountForm />
    </>
  );
};

export default page;
