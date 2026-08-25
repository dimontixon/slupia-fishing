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
  const [slotStartTimesText, setSlotStartTimesText] = useState(settings.slotStartTimes.join(", "));
  const [slotStepHours, setSlotStepHours] = useState(String(settings.slotStepHours));
  const [minSlots, setMinSlots] = useState(String(settings.minSlots));
  const [maxSlots, setMaxSlots] = useState(String(settings.maxSlots));
  const [cancellationHoursBefore, setCancellationHoursBefore] = useState(String(settings.cancellationHoursBefore));
  const [requireManualConfirmation, setRequireManualConfirmation] = useState(settings.requireManualConfirmation);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateBookingSettings({
        slotStartTimesText,
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
        <Label htmlFor="slot-start-times">Godziny startu (oddzielone przecinkami)</Label>
        <Input
          id="slot-start-times"
          value={slotStartTimesText}
          onChange={(event) => setSlotStartTimesText(event.target.value)}
          placeholder="12:00, 18:00"
          required
        />
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
