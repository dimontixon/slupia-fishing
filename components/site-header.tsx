import Link from "next/link";

import { auth } from "@/lib/auth";
import { HeaderNav } from "@/components/header-nav";

export async function SiteHeader() {
  const session = await auth();
  const phone = session?.user?.role === "client" ? (session.user.phone ?? null) : null;

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="font-heading font-semibold">
          Łowisko Słupia
        </Link>
        <HeaderNav phone={phone} />
      </div>
    </header>
  );
}
