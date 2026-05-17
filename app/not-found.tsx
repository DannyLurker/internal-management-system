import { LocateOff } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="relative inline-block mb-8">
          <span className="text-[112px] font-semibold tracking-[0.2em] text-slate-200 select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-600 bg-amber-50">
              <LocateOff className="h-8 w-8 text-amber-700" />
            </span>
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm md:text-base text-slate-500 mb-10 max-w-md mx-auto">
          We&apos;re sorry, the page you&apos;re looking for doesn&apos;t exist
          or has been moved. Please return to our homepage for further
          assistance.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-amber-700 px-6 py-2.5 text-sm font-medium tracking-wide text-white shadow-sm transition hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
