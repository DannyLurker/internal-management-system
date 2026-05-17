"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ROLE_LABEL } from "@/shared/lib/constants/roles";
import { AnimatePresence } from "framer-motion"; // HIGHLIGHTED: Moved AnimatePresence here
import UserFlyout from "./UserFlyout";

function roleLabel(role: string | undefined): string {
  if (!role || !(role in ROLE_LABEL)) return "Member";
  return ROLE_LABEL[role as keyof typeof ROLE_LABEL];
}

function hasAvatar(image: string | null | undefined): image is string {
  return Boolean(image?.trim());
}

export default function UserIdentity({
  isExpanded,
  className,
}: {
  isExpanded: boolean;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const name = user?.name?.trim() || "Signed in";
  const image = user?.image;
  const roleLine = roleLabel(user?.role).toUpperCase();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileFlyoutOpen, setProfileFlyoutOpen] = useState(false);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openProfileFlyout = useCallback(() => {
    clearCloseTimer();
    setProfileFlyoutOpen(true);
  }, [clearCloseTimer]);

  const scheduleCloseProfileFlyout = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setProfileFlyoutOpen(false), 140);
  }, [clearCloseTimer]);

  const avatar = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-[#f5d0c8]/25 ring-1 ring-[#eaf1ff]/15",
        isExpanded ? "size-12" : "size-10",
      )}
    >
      {hasAvatar(image) ? (
        <img
          src={image}
          alt={isExpanded ? "" : name}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-[#0f172a]/35 text-[#eaf1ff]/45">
          <User
            className={cn(isExpanded ? "size-6" : "size-5")}
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      )}
    </div>
  );

  if (status === "loading") {
    return (
      <div
        className={cn(
          "shrink-0 border-t border-[#eaf1ff]/10 px-2 pb-3 pt-3",
          className,
        )}
      >
        <div
          className={cn(
            "animate-pulse rounded-lg bg-[#0f172a]/20",
            isExpanded ? "mx-1 h-16" : "mx-auto size-10 rounded-full",
          )}
        />
      </div>
    );
  }

  // === COLLAPSED STATE ===
  if (!isExpanded) {
    return (
      <div
        className={cn(
          "flex shrink-0 justify-center border-t border-[#eaf1ff]/10 px-2 pb-3 pt-3 mb-2",
          className,
        )}
      >
        <div
          className="relative flex flex-col items-center gap-1"
          onMouseEnter={openProfileFlyout}
          onMouseLeave={scheduleCloseProfileFlyout}
          aria-label={`${name}, ${roleLine}`}
        >
          {avatar}
          <AnimatePresence>
            {profileFlyoutOpen && (
              <UserFlyout
                onMouseEnter={openProfileFlyout}
                onMouseLeave={scheduleCloseProfileFlyout}
                className="inset-s-full bottom-0 ms-4"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // === EXPANDED STATE ===
  return (
    <div
      className={cn(
        "shrink-0 border-t border-[#eaf1ff]/10 px-2 pb-3 pt-3",
        className,
      )}
    >
      <div className="relative flex items-center gap-3 rounded-lg bg-[#2a3442] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#eaf1ff]/45">
            {roleLine}
          </p>
          <p className="truncate font-ochre-ui text-base font-semibold leading-snug text-[#eaf1ff]">
            {name}
          </p>
        </div>
        <button
          onClick={() => setProfileFlyoutOpen((prev) => !prev)}
          className="shrink-0 rounded-md p-1.5 text-[#eaf1ff]/45 transition-colors hover:bg-[#894d0d]/20 hover:text-[#ffb77b]"
          aria-label="Settings"
        >
          <Settings className="size-5" strokeWidth={1.5} />
        </button>

        <AnimatePresence>
          {profileFlyoutOpen && (
            <UserFlyout
              onMouseEnter={openProfileFlyout}
              onMouseLeave={scheduleCloseProfileFlyout}
              className="inset-e-0 bottom-full mb-3"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
