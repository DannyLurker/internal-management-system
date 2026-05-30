import { cn } from "@/shared/lib/utils";

export const sharedButtonClasses = cn(
  "inline-flex items-center justify-center rounded-md bg-transparent p-2 text-[#565e74] outline-none transition-all duration-200 ease-out",
  "hover:-translate-y-0.5 active:translate-y-0",
  "hover:shadow-[0_8px_16px_-6px_rgba(15,23,42,0.08)]",
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#894d0d]",
);

export const infoButtonClasses = cn(
  sharedButtonClasses,
  "bg-[#eef4ff] text-[#121c28] hover:bg-[#e5eeff] hover:text-[#894d0d]",
);
