"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardManager from "./DashboardManager";
import { useGlobalLoading } from "@/shared/lib/context/LoadingContext";

const DashboardClient = () => {
  const { data: session, status } = useSession();
  const { setIsLoading } = useGlobalLoading();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    // 2. Safely redirect unauthenticated users
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }

    // Cleanup when component unmounts
    return () => setIsLoading(false);
  }, [status, setIsLoading, router]);

  // Don't render anything while auth status is being resolved
  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  // Render role-specific views once authenticated
  switch (session?.user?.role) {
    case "HOTEL_MANAGER":
      return <DashboardManager />;
    default:
      return <div>Unauthorized role</div>;
  }
};

export default DashboardClient;
