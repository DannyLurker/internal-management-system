import Sidebar from "@/shared/components/sidebar/Index";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
// import AuthenticatedProvider from "../providers";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user.id) redirect("/sign-in");

  return (
    <div className="flex min-h-screen min-w-0">
      <Sidebar />
      <main className="min-w-0 flex-1 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
