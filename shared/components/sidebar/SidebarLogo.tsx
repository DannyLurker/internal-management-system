import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React from "react";

interface SidebarLogoProps {
  isExpanded: boolean;
  toggle: () => void;
  /** When set, shows full title + close control for the mobile overlay drawer. */
  onCloseDrawer?: () => void;
}

const SidebarLogo = ({
  isExpanded,
  toggle,
  onCloseDrawer,
}: SidebarLogoProps) => {
  if (onCloseDrawer) {
    return (
      <div className="flex items-center gap-2 border-b border-[#0f172a]/25 px-3 py-4">
        <span
          className="min-w-0 flex-1 font-ochre-brand text-2xl font-semibold leading-8 tracking-tight text-[#eaf1ff]"
          style={{ fontFeatureSettings: '"lnum" 1' }}
        >
          E-Cashier
        </span>
        <button
          type="button"
          onClick={onCloseDrawer}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border border-[#eaf1ff]/10",
            "bg-[#0f172a]/15 text-[#eaf1ff]/90 transition-[color,background-color,box-shadow] duration-300",
            "hover:bg-[#0f172a]/25 hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.12)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          )}
          aria-label="Close navigation menu"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-[#0f172a]/25 px-3 py-4 transition-[padding] duration-300",
        !isExpanded && "flex-col gap-3",
      )}
    >
      <div
        className={cn(
          "min-w-0 flex-1 transition-opacity duration-300",
          !isExpanded && "flex w-full justify-center",
        )}
      >
        {isExpanded ? (
          <span
            className="font-ochre-brand text-2xl font-semibold leading-8 tracking-tight text-[#eaf1ff]"
            style={{ fontFeatureSettings: '"lnum" 1' }}
          >
            E-Cashier
          </span>
        ) : (
          <>
            <span className="sr-only">E-Cashier</span>
            <span
              className="font-ochre-brand text-xl font-semibold leading-none text-[#eaf1ff]"
              aria-hidden
            >
              E
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border border-[#eaf1ff]/10",
          "bg-[#0f172a]/15 text-[#eaf1ff]/90 transition-[color,background-color,box-shadow] duration-300",
          "hover:bg-[#0f172a]/25 hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.12)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
        )}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        ) : (
          <ChevronRight className="size-4" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
};

export default SidebarLogo;
