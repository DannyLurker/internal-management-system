"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface UserFlyoutProps {
  className?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function UserFlyout({
  className,
  onMouseEnter,
  onMouseLeave,
}: UserFlyoutProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "-4px", scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: "-4px", scale: 0.97 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 260,
        mass: 0.8,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "absolute z-9999 w-44 rounded-[10px] border border-white/[0.07] bg-[#1e2733] p-2 shadow-2xl",
        className,
      )}
    >
      <p className="px-2.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-[#eaf1ff]/35">
        Account
      </p>

      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#eaf1ff]/90 transition-colors hover:bg-[#ba1a1a]/15 hover:text-[#ffdad6]"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          <span>Sign out</span>
        </button>
      </div>
    </motion.div>
  );
}
