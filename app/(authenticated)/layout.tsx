"use client";

import { useEffect } from "react";
import Sidebar from "@/shared/components/sidebar/Index";
import { useGlobalSidebar } from "@/shared/lib/context/SidebarContext";
import { cn } from "@/shared/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/shared/lib/context/LoadingContext";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isOpen } = useGlobalSidebar();
  const { setIsLoading } = useGlobalLoading();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status, setIsLoading]);

  return (
    <div className="flex min-h-screen min-w-0">
      <Sidebar />
      <main
        className={cn(
          "min-w-0 flex-1 transition-all duration-300",
          isOpen ? "md:pl-65" : "md:pl-18",
        )}
      >
        {children}
      </main>
    </div>
  );
}
