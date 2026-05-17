import { cn } from "@/shared/lib/utils";
import { navAmbient } from "../sidebar-link.styles";
import Link from "next/link";

export default function InventorySubLink({
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
      className={cn(
        "relative block rounded-lg py-2 ps-3 pe-2 text-[#eaf1ff]/85 outline-none",
        navAmbient,
        active &&
          "bg-[#894d0d]/28 font-medium text-[#eaf1ff] shadow-[inset_0_0_0_1px_rgba(137,77,13,0.4)]",
      )}
    >
      {label}
    </Link>
  );
}
