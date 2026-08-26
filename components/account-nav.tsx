"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AccountNav({ phone }: { phone: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    });
  }

  if (!phone) {
    return (
      <Link href="/logowanie" className="text-sm text-muted-foreground hover:text-foreground">
        Zaloguj się
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-muted-foreground">{phone}</span>
      <Link href="/moje-rezerwacje" className="text-muted-foreground hover:text-foreground">
        Moje rezerwacje
      </Link>
      <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={handleSignOut}>
        Wyloguj się
      </Button>
    </div>
  );
}
