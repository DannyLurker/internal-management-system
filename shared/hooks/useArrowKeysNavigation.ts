// Still has no functionality. Will be implemented in the future.

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const ORDERED_ROUTES = [
  "/dashboard",
  "/inventory/products",
  "/inventory/categories",
] as const;

export function useArrowKeyNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const currentIndex = ORDERED_ROUTES.indexOf(
        pathname as (typeof ORDERED_ROUTES)[number],
      );
      if (currentIndex === -1) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = ORDERED_ROUTES[currentIndex + 1];
        if (next) router.push(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = ORDERED_ROUTES[currentIndex - 1];
        if (prev) router.push(prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);
}
