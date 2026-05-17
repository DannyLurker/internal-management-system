"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { internalServerError } from "../error-handlers";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);

  return (
    <>
      <SidebarContext.Provider
        value={{
          isOpen,
          setIsOpen,
          toggle,
          isMobileDrawerOpen,
          openMobileDrawer,
          closeMobileDrawer,
        }}
      >
        {children}
      </SidebarContext.Provider>
    </>
  );
};

export const useGlobalSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw internalServerError(
      "useGlobalSidebar must be used within SidebarProvider",
    );
  return context;
};
