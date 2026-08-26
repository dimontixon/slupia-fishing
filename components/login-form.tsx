"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { requestOtp } from "@/lib/otp";

type Step = "phone" | "code";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+48");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestOtp(phone);
      if (!result.ok) {
        setError(result.error ?? "Nie udało się wysłać kodu.");
        return;
      }
      setStep("code");
    });
  }

  function handleVerifyCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("client-otp", { phone, code, redirect: false });
      if (!result || result.error) {
        setError("Nieprawidłowy kod. Spróbuj ponownie.");
        return;
      }
      router.push("/moje-rezerwacje");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Zaloguj się</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {step === "phone" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numer telefonu</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+48123456789"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              Wyślij kod SMS
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kod wysłany na {phone} (w trybie dev sprawdź konsolę serwera).
            </p>
            <div className="space-y-2">
              <Label htmlFor="code">Kod SMS</Label>
              <Input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep("phone")}>
                Wstecz
              </Button>
              <Button type="submit" className="flex-1" disabled={pending}>
                Potwierdź
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
