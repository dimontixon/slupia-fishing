"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { updateBookingSettings } from "@/lib/admin";
import type { BookingSettingsShape } from "@/lib/booking";

export function BookingSettingsForm({ settings }: { settings: BookingSettingsShape }) {
  const router = useRouter();
  const [times, setTimes] = useState<string[]>(settings.slotStartTimes);
  const [slotStepHours, setSlotStepHours] = useState(String(settings.slotStepHours));
  const [minSlots, setMinSlots] = useState(String(settings.minSlots));
  const [maxSlots, setMaxSlots] = useState(String(settings.maxSlots));
  const [cancellationHoursBefore, setCancellationHoursBefore] = useState(String(settings.cancellationHoursBefore));
  const [requireManualConfirmation, setRequireManualConfirmation] = useState(settings.requireManualConfirmation);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateTime(index: number, value: string) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function removeTime(index: number) {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }

  function addTime() {
    setTimes((prev) => [...prev, "12:00"]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateBookingSettings({
        slotStartTimes: times,
        slotStepHours: Number(slotStepHours),
        minSlots: Number(minSlots),
        maxSlots: Number(maxSlots),
        cancellationHoursBefore: Number(cancellationHoursBefore),
        requireManualConfirmation,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Ustawienia zapisane.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        <Label>Godziny startu</Label>
        <div className="flex flex-wrap items-center gap-2">
          {times.map((time, index) => (
            <div key={index} className="flex items-center gap-1 rounded-md border pl-2 pr-1 py-1">
              <input
                type="time"
                value={time}
                onChange={(event) => updateTime(index, event.target.value)}
                className="w-24 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => removeTime(index)}
                aria-label="Usuń godzinę"
                className="rounded px-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addTime}>
            + Dodaj godzinę
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {times.length === 0
            ? "Brak stałych godzin — klienci będą mogli wybrać dowolną godzinę startu."
            : "Rezerwacje będą mogły zaczynać się tylko o wskazanych godzinach."}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="slot-step-hours">Długość slotu (godziny)</Label>
        <Input
          id="slot-step-hours"
          type="number"
          min={1}
          value={slotStepHours}
          onChange={(event) => setSlotStepHours(event.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min-slots">Min. sloty</Label>
          <Input
            id="min-slots"
            type="number"
            min={1}
            value={minSlots}
            onChange={(event) => setMinSlots(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-slots">Max. sloty</Label>
          <Input
            id="max-slots"
            type="number"
            min={1}
            value={maxSlots}
            onChange={(event) => setMaxSlots(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cancellation-hours">Anulowanie możliwe do (godzin przed przyjazdem)</Label>
        <Input
          id="cancellation-hours"
          type="number"
          min={0}
          value={cancellationHoursBefore}
          onChange={(event) => setCancellationHoursBefore(event.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="require-manual-confirmation"
          checked={requireManualConfirmation}
          onCheckedChange={(value) => setRequireManualConfirmation(value === true)}
        />
        <Label htmlFor="require-manual-confirmation">Wymagaj ręcznego potwierdzenia rezerwacji</Label>
      </div>
      <Button type="submit" disabled={pending}>
        Zapisz
      </Button>
    </form>
  );
}
