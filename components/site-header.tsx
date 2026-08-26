import Link from "next/link";
import { Fish } from "lucide-react";

import { auth } from "@/lib/auth";
import { HeaderNav } from "@/components/header-nav";

export async function SiteHeader() {
  const session = await auth();
  const phone = session?.user?.role === "client" ? (session.user.phone ?? null) : null;

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl items-center gap-8 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <Fish className="size-6 shrink-0 text-accent-warm" strokeWidth={2.25} />
          Łowisko Słupia
        </Link>
        <HeaderNav phone={phone} />
      </div>
    </header>
  );
}
