"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell, BellOff, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { usePushNotifications } from "../PushNotificationSetup";

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
  const { permission, subscribe } = usePushNotifications();

  // Handle sign-out action
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in" });
  };

  // Render button text and icon based on notification permission state
  const renderNotificationButtonContent = () => {
    if (permission === "granted") {
      return (
        <>
          <Check className="size-4 text-emerald-400" strokeWidth={1.5} />
          <span className="text-emerald-400">Notifications On</span>
        </>
      );
    }

    if (permission === "denied") {
      return (
        <>
          <BellOff className="size-4 text-rose-400" strokeWidth={1.5} />
          <span className="text-rose-400">Blocked in Browser</span>
        </>
      );
    }

    return (
      <>
        <Bell className="size-4 opacity-90" strokeWidth={1.5} />
        <span>Enable Notifications</span>
      </>
    );
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
        "absolute z-9999 w-48 rounded-[10px] border border-white/[0.07] bg-[#1e2733] p-2 shadow-2xl",
        className,
      )}
    >
      <p className="px-2.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-[#eaf1ff]/35">
        Account
      </p>

      <div className="flex flex-col gap-0.5">
        {/* Toggle Notification Button */}
        <button
          type="button"
          onClick={subscribe}
          disabled={permission === "granted" || permission === "denied"}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#eaf1ff]/90 transition-colors",
            permission === "default" && "hover:bg-white/10 hover:text-white",
            permission === "granted" && "cursor-default bg-emerald-500/10",
            permission === "denied" &&
              "cursor-not-allowed bg-rose-500/10 opacity-80",
          )}
          title={
            permission === "denied"
              ? "Notifications are blocked. Please allow them in your browser settings."
              : undefined
          }
        >
          {renderNotificationButtonContent()}
        </button>

        {/* Sign Out Button */}
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
