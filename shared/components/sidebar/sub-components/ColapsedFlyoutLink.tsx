import Link from "next/link";
import { navAmbient } from "../sidebar-link.styles";
import { cn } from "@/shared/lib/utils";

export default function CollapsedFlyoutLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        "block rounded-lg px-2.5 py-2 text-sm text-[#eaf1ff]/90 outline-none",
        navAmbient,
        active &&
          "bg-[#894d0d]/28 font-medium text-[#eaf1ff] shadow-[inset_0_0_0_1px_rgba(137,77,13,0.4)]",
      )}
    >
      {label}
    </Link>
  );
}
