"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AccountNav({ phone, stacked = false }: { phone: string | null; stacked?: boolean }) {
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
      <Link
        href="/logowanie"
        className={
          stacked
            ? "text-sm font-medium text-muted-foreground hover:text-foreground"
            : "text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground"
        }
      >
        Zaloguj się
      </Link>
    );
  }

  // The header this lives in no longer shows the client's phone number —
  // just the account actions.
  if (stacked) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <Link href="/moje-rezerwacje" className="text-muted-foreground hover:text-foreground">
          Moje rezerwacje
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={handleSignOut}
          className="w-full justify-center"
        >
          Wyloguj się
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/moje-rezerwacje" className="font-medium text-primary-foreground/85 hover:text-primary-foreground">
        Moje rezerwacje
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={handleSignOut}
        className="text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground"
      >
        Wyloguj się
      </Button>
    </div>
  );
}
