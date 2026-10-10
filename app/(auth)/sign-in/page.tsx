import SignIn from "@/features/auth/components/SignIn";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <>
      <SignIn />
    </>
  );
};

export default page;
