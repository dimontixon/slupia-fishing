import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "client") {
    redirect("/moje-rezerwacje");
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-1 items-center justify-center px-4 py-10">
      <LoginForm />
    </main>
  );
}
