"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InterceptorConfig } from "@/shared/lib/components/providers/InterceptorConfig";
import { Toaster } from "sonner";
import { LoadingProvider } from "@/shared/lib/context/LoadingContext";
import { SidebarProvider } from "@/shared/lib/context/SidebarContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <LoadingProvider>
          <SidebarProvider>
            {/* The Interceptor can now see the Session because it's a child of SessionProvider */}
            <InterceptorConfig />
            {children}
            <Toaster position="top-right" richColors className="font-sans" />
          </SidebarProvider>
        </LoadingProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

// export default function AuthenticatedProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <LoadingProvider>
//       <SidebarProvider>
//         {/* Interceptor handles adding the Auth Token to requests */}
//         <InterceptorConfig />

//         {children}

//         <Toaster position="top-right" richColors className="font-sans" />
//       </SidebarProvider>
//     </LoadingProvider>
//   );
// }
