import { cn } from "@/shared/lib/utils";

export const sharedButtonClasses = cn(
  // Layout & Core: 4px soft corner radius matching the brand standard
  "rounded-md p-2 outline-none inline-flex items-center justify-center transition-all duration-200 ease-out",
  "bg-transparent text-[#565e74]", // Default secondary gray state

  // Tactile Motion: Lift up slightly on hover, sink down flush on press
  "hover:-translate-y-0.5 active:translate-y-0",
  "hover:shadow-[0_8px_16px_-6px_rgba(15,23,42,0.08)]", // Diffused ambient shadow

  // Accessibility: Focused state uses the rich Ochre tone container tracking ring
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#894d0d]",
);
