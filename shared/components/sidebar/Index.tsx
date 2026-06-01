"use client";

import { useGlobalSidebar } from "@/shared/lib/context/SidebarContext";
import { cn } from "@/shared/lib/utils";
import { usePathname } from "next/navigation";
import SidebarLogo from "./SidebarLogo";
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { asideShell } from "./sidebar-link.styles";
import SidebarNavContent from "./sub-components/SidebarContent";
import { paths } from "@/shared/lib/constants/url-paths";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserIdentity from "@/shared/components/user-profile/UserIdentity";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    isOpen: isExpanded,
    toggle,
    isMobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
  } = useGlobalSidebar();
  const inventoryFlyoutId = useId();
  const mobileDrawerTitleId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inventoryChildActive =
    pathname === paths.items ||
    pathname === paths.categories ||
    pathname === paths.locations;

  const [inventoryOpen, setInventoryOpen] = useState(
    inventoryChildActive || pathname.startsWith("/inventory"),
  );
  const [inventoryFlyoutOpen, setInventoryFlyoutOpen] = useState(false);

  useEffect(() => {
    if (inventoryChildActive) setInventoryOpen(true);
  }, [inventoryChildActive]);

  useEffect(() => {
    if (isExpanded) setInventoryFlyoutOpen(false);
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    closeMobileDrawer();
  }, [pathname, closeMobileDrawer]);

  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileDrawerOpen, closeMobileDrawer]);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openInventoryFlyout = useCallback(() => {
    if (isExpanded) return;
    clearCloseTimer();
    setInventoryFlyoutOpen(true);
  }, [clearCloseTimer, isExpanded]);

  const scheduleCloseInventoryFlyout = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setInventoryFlyoutOpen(false), 140);
  }, [clearCloseTimer]);

  const onInventoryKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isExpanded && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setInventoryFlyoutOpen((v) => !v);
    }
  };

  const navProps = {
    pathname,
    inventoryOpen,
    setInventoryOpen,
    inventoryFlyoutOpen,
    openInventoryFlyout,
    scheduleCloseInventoryFlyout,
    onInventoryKeyDown,
    inventoryFlyoutId,
  };

  return (
    <>
      <div className="hidden min-h-screen max-h-screen fixed shrink-0 md:flex">
        <aside
          className={cn(asideShell, isExpanded ? "w-65" : "w-18")}
          data-expanded={isExpanded ? "true" : "false"}
        >
          <SidebarLogo isExpanded={isExpanded} toggle={toggle} />
          <SidebarNavContent isExpanded={isExpanded} {...navProps} />
          <UserIdentity isExpanded={isExpanded} />
        </aside>
      </div>

      <button
        type="button"
        className={cn(
          "fixed right-4 top-4 z-40 flex size-11 items-center justify-center rounded-full border border-[#0f172a]/20",
          "bg-[#27313e] text-[#eaf1ff] shadow-lg transition-opacity duration-200 md:hidden",
          "hover:bg-[#2c3644] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          isMobileDrawerOpen && "pointer-events-none opacity-0",
        )}
        aria-expanded={isMobileDrawerOpen}
        aria-controls="mobile-sidebar-drawer"
        onClick={openMobileDrawer}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
            id={mobileDrawerTitleId}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeMobileDrawer}
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(asideShell, "absolute left-0 top-0 w-80")}
            >
              <SidebarLogo
                isExpanded
                toggle={toggle}
                onCloseDrawer={closeMobileDrawer}
              />
              <SidebarNavContent isExpanded {...navProps} />
              <UserIdentity isExpanded />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
