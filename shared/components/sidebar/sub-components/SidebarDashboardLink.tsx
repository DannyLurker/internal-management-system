"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { navAmbient } from "../sidebar-link.styles";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
}

export default function SidebarDashboardLink({
  href,
  icon: Icon,
  label,
  isActive,
  isExpanded,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#eaf1ff]/90 outline-none",
        navAmbient,
        isActive &&
          "bg-[#894d0d]/25 text-[#eaf1ff] shadow-[inset_0_0_0_1px_rgba(137,77,13,0.35)]",
        !isExpanded && "justify-center px-0",
      )}
      title={!isExpanded ? label : undefined}
    >
      <Icon className="size-5.5 shrink-0 opacity-90" strokeWidth={1.5} />
      {isExpanded && <span>{label}</span>}
    </Link>
  );
}
