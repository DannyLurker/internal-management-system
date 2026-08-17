"use client";

import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface SearchSelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: "search" | "chevron";
  error?: boolean;
}

export const SearchSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SearchSelectTriggerProps
>(
  (
    {
      value,
      placeholder = "Search and select...",
      onClear,
      disabled = false,
      className,
      icon = "chevron",
      error = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const hasValue = Boolean(value);

    return (
      <div className="relative w-full">
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={onClick}
          aria-haspopup="dialog"
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded border bg-white px-3 py-1.5 text-left font-ochre-ui text-sm shadow-xs transition-colors",
            "border-[#121c28]/20 focus-visible:border-[#894d0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/15",
            "hover:border-[#894d0d]/40 hover:bg-[#f8f9ff]/50",
            disabled && "cursor-not-allowed opacity-50 bg-[#eef4ff]/50 hover:border-[#121c28]/20 hover:bg-[#eef4ff]/50",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/15",
            className,
          )}
          {...props}
        >
          <span
            className={cn(
              "block min-w-0 flex-1 truncate",
              hasValue ? "font-medium text-[#121c28]" : "text-[#524439]/60",
            )}
          >
            {hasValue ? value : placeholder}
          </span>

          <span className="flex shrink-0 items-center gap-1 text-[#565e74]">
            {icon === "search" ? (
              <Search className="size-4 opacity-70" aria-hidden />
            ) : (
              <ChevronDown className="size-4 opacity-70" aria-hidden />
            )}
          </span>
        </button>

        {hasValue && onClear && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#565e74] hover:bg-[#eef4ff] hover:text-[#121c28]"
            aria-label="Clear selection"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    );
  },
);

SearchSelectTrigger.displayName = "SearchSelectTrigger";

export default SearchSelectTrigger;
