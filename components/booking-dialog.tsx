"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getSectorAvailability, createBooking, type AvailabilitySlot } from "@/lib/booking";
import { requestOtp } from "@/lib/otp";
import type { MapSector } from "@/components/sector-map";

type Step = "pick-slot" | "duration" | "login-phone" | "login-code" | "confirm" | "success";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Oczekuje na potwierdzenie",
  CONFIRMED: "Potwierdzona",
};

function todayISO(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

// Native date/time inputs only open their picker when the small calendar/
// clock icon is clicked — this makes the whole field open it, on desktop
// and mobile alike.
function openPicker(event: React.MouseEvent<HTMLInputElement>) {
  event.currentTarget.showPicker?.();
}

function formatPln(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} zł`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingDialog({
  sector,
  isLoggedIn,
  onClose,
}: {
  sector: MapSector | null;
  isLoggedIn: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pick-slot");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [limits, setLimits] = useState<{
    minSlots: number;
    maxSlots: number;
    slotStepHours: number;
    arbitraryTime: boolean;
  } | null>(null);
  const [customTime, setCustomTime] = useState("12:00");
  const [chosenSlot, setChosenSlot] = useState<AvailabilitySlot | null>(null);
  const [slotsCount, setSlotsCount] = useState(1);
  const [phone, setPhone] = useState("+48");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultBooking, setResultBooking] = useState<{
    status: string;
    totalPrice: string;
    startAt: string;
    endAt: string;
  } | null>(null);
  const [sessionActive, setSessionActive] = useState(isLoggedIn);
  const [pending, startTransition] = useTransition();

  // Reset the whole flow whenever a different sector is opened. Done during
  // render (React's "adjusting state on prop change" pattern) rather than in
  // an effect, since these are plain synchronous resets, not a subscription
  // to an external system.
  const [resetForSectorId, setResetForSectorId] = useState<string | null>(null);
  if (sector && sector.id !== resetForSectorId) {
    setResetForSectorId(sector.id);
    setStep("pick-slot");
    setDate(todayISO());
    setSlots([]);
    setLimits(null);
    setCustomTime("12:00");
    setChosenSlot(null);
    setSlotsCount(1);
    setError(null);
    setResultBooking(null);
    setSessionActive(isLoggedIn);
  }

  useEffect(() => {
    if (sector) loadAvailability(sector.id, todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector?.id]);

  function loadAvailability(sectorId: string, dateISO: string, customStartTime?: string) {
    startTransition(async () => {
      setError(null);
      const result = await getSectorAvailability(sectorId, dateISO, customStartTime);
      if (!result.ok) {
        setError(result.error);
        setSlots([]);
        setLimits(null);
        return;
      }
      setSlots(result.slots);
      setLimits({
        minSlots: result.minSlots,
        maxSlots: result.maxSlots,
        slotStepHours: result.slotStepHours,
        arbitraryTime: result.arbitraryTime,
      });
    });
  }

  function handleDateChange(value: string) {
    setDate(value);
    if (sector) loadAvailability(sector.id, value);
  }

  function handleSelectSlot(slot: AvailabilitySlot) {
    setChosenSlot(slot);
    setSlotsCount(limits?.minSlots ?? 1);
    setStep("duration");
  }

  function handleCheckCustomTime() {
    if (!sector || !customTime) return;
    setError(null);
    startTransition(async () => {
      const result = await getSectorAvailability(sector.id, date, customTime);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLimits({
        minSlots: result.minSlots,
        maxSlots: result.maxSlots,
        slotStepHours: result.slotStepHours,
        arbitraryTime: result.arbitraryTime,
      });
      const slot = result.slots[0];
      if (!slot || slot.maxSlots === 0) {
        setError("Ten termin jest niedostępny. Wybierz inną godzinę.");
        return;
      }
      handleSelectSlot(slot);
    });
  }

  function handleContinueFromDuration() {
    setStep(sessionActive ? "confirm" : "login-phone");
  }

  function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestOtp(phone);
      if (!result.ok) {
        setError(result.error ?? "Nie udało się wysłać kodu.");
        return;
      }
      setStep("login-code");
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
      setSessionActive(true);
      router.refresh();
      setStep("confirm");
    });
  }

  function handleConfirm() {
    if (!sector || !chosenSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        sectorId: sector.id,
        startAt: chosenSlot.startAt,
        slotsCount,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResultBooking(result.booking);
      setStep("success");
    });
  }

  const price = sector ? Number(sector.basePrice) * slotsCount : 0;
  const durationOptions =
    limits && chosenSlot
      ? Array.from(
          { length: Math.max(0, Math.min(limits.maxSlots, chosenSlot.maxSlots) - limits.minSlots + 1) },
          (_, i) => limits.minSlots + i,
        )
      : [];
  const endAtMs =
    chosenSlot && limits ? new Date(chosenSlot.startAt).getTime() + slotsCount * limits.slotStepHours * 60 * 60 * 1000 : null;

  return (
    <Dialog open={sector !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sector?.name}</DialogTitle>
          <DialogDescription>{sector ? formatPln(Number(sector.basePrice)) : ""} / 12h</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {step === "pick-slot" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking-date">Data przyjazdu</Label>
              <Input
                id="booking-date"
                type="date"
                min={todayISO()}
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                onClick={openPicker}
              />
            </div>
            <div className="space-y-2">
              <Label>Godzina startu</Label>
              {limits?.arbitraryTime ? (
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={customTime}
                    onChange={(event) => setCustomTime(event.target.value)}
                    onClick={openPicker}
                    className="w-32"
                  />
                  <Button type="button" onClick={handleCheckCustomTime} disabled={pending || !customTime}>
                    Sprawdź dostępność
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={slot.maxSlots > 0 ? "outline" : "ghost"}
                      disabled={slot.maxSlots === 0 || pending}
                      onClick={() => handleSelectSlot(slot)}
                    >
                      {slot.time}
                      {slot.maxSlots === 0 ? " (zajęte)" : ""}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === "duration" && chosenSlot && limits && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Start: {formatDateTime(chosenSlot.startAt)}</p>
            <div className="space-y-2">
              <Label>Liczba slotów (po 12h)</Label>
              <Select value={String(slotsCount)} onValueChange={(value) => setSlotsCount(Number(value))}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) => `${value} ${value === "1" ? "slot" : "sloty"}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} {count === 1 ? "slot" : "sloty"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {endAtMs && <p className="text-sm text-muted-foreground">Koniec: {formatDateTime(new Date(endAtMs).toISOString())}</p>}
            <p className="font-medium">Cena: {formatPln(price)}</p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setStep("pick-slot")}>
                Wstecz
              </Button>
              <Button type="button" onClick={handleContinueFromDuration} disabled={durationOptions.length === 0}>
                Dalej
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "login-phone" && (
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setStep("duration")}>
                Wstecz
              </Button>
              <Button type="submit" disabled={pending}>
                Wyślij kod SMS
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "login-code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-muted-foreground">Kod wysłany na {phone} (w trybie dev sprawdź konsolę serwera).</p>
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setStep("login-phone")}>
                Wstecz
              </Button>
              <Button type="submit" disabled={pending}>
                Potwierdź
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "confirm" && chosenSlot && (
          <div className="space-y-4">
            <p className="text-sm">
              Sektor <strong>{sector?.name}</strong>, {formatDateTime(chosenSlot.startAt)}, {slotsCount}{" "}
              {slotsCount === 1 ? "slot" : "sloty"}.
            </p>
            <p className="font-medium">Do zapłaty na miejscu: {formatPln(price)}</p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setStep("duration")}>
                Wstecz
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={pending}>
                Zarezerwuj
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && resultBooking && (
          <div className="space-y-3">
            <p className="text-sm">
              Status: <strong>{STATUS_LABELS[resultBooking.status] ?? resultBooking.status}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(resultBooking.startAt)} – {formatDateTime(resultBooking.endAt)}
            </p>
            <p className="font-medium">{formatPln(Number(resultBooking.totalPrice))}</p>
            <DialogFooter>
              <Button type="button" onClick={onClose}>
                Zamknij
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
