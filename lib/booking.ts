"use server";

import { Prisma, BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type BookingSettingsShape = {
  slotStartTimes: string[];
  slotStepHours: number;
  minSlots: number;
  maxSlots: number;
  cancellationHoursBefore: number;
  requireManualConfirmation: boolean;
};

const DEFAULT_SETTINGS: BookingSettingsShape = {
  slotStartTimes: ["12:00", "18:00"],
  slotStepHours: 12,
  minSlots: 1,
  maxSlots: 4,
  cancellationHoursBefore: 24,
  requireManualConfirmation: true,
};

export async function getBookingSettingsOrDefault(): Promise<BookingSettingsShape> {
  const settings = await prisma.bookingSettings.findFirst();
  return settings ?? DEFAULT_SETTINGS;
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function computeMaxConsecutiveSlots(
  startAt: Date,
  settings: Pick<BookingSettingsShape, "maxSlots" | "slotStepHours">,
  bookings: { startAt: Date; endAt: Date }[],
): number {
  if (startAt.getTime() < Date.now()) return 0;

  let maxSlots = 0;
  for (let k = 1; k <= settings.maxSlots; k++) {
    const candidateEnd = new Date(startAt.getTime() + k * settings.slotStepHours * 60 * 60 * 1000);
    const hasOverlap = bookings.some((b) => b.startAt < candidateEnd && b.endAt > startAt);
    if (hasOverlap) break;
    maxSlots = k;
  }
  return maxSlots;
}

export type AvailabilitySlot = {
  startAt: string;
  time: string;
  maxSlots: number;
};

export type AvailabilityResult =
  | {
      ok: true;
      minSlots: number;
      maxSlots: number;
      slotStepHours: number;
      // true when the owner hasn't fixed any start times (BookingSettings.slotStartTimes
      // is empty) — clients may then request an arbitrary start time instead of
      // picking from a preset list.
      arbitraryTime: boolean;
      slots: AvailabilitySlot[];
    }
  | { ok: false; error: string };

export async function getSectorAvailability(
  sectorId: string,
  dateISO: string,
  customTime?: string,
): Promise<AvailabilityResult> {
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Nieprawidłowa data." };
  }

  const sector = await prisma.sector.findUnique({ where: { id: sectorId } });
  if (!sector || !sector.isActive) {
    return { ok: false, error: "Sektor niedostępny." };
  }

  const settings = await getBookingSettingsOrDefault();

  const horizonEnd = new Date(date.getTime() + (24 + settings.maxSlots * settings.slotStepHours) * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      sectorId,
      status: { not: BookingStatus.CANCELLED },
      startAt: { lt: horizonEnd },
      endAt: { gt: date },
    },
    select: { startAt: true, endAt: true },
  });

  const arbitraryTime = settings.slotStartTimes.length === 0;

  let slots: AvailabilitySlot[];
  if (arbitraryTime) {
    slots =
      customTime && TIME_REGEX.test(customTime)
        ? [
            {
              startAt: combineDateAndTime(date, customTime).toISOString(),
              time: customTime,
              maxSlots: computeMaxConsecutiveSlots(combineDateAndTime(date, customTime), settings, bookings),
            },
          ]
        : [];
  } else {
    slots = settings.slotStartTimes.map((time) => {
      const startAt = combineDateAndTime(date, time);
      return {
        startAt: startAt.toISOString(),
        time,
        maxSlots: computeMaxConsecutiveSlots(startAt, settings, bookings),
      };
    });
  }

  return {
    ok: true,
    minSlots: settings.minSlots,
    maxSlots: settings.maxSlots,
    slotStepHours: settings.slotStepHours,
    arbitraryTime,
    slots,
  };
}

class BookingConflictError extends Error {}

function isSerializationConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export type CreateBookingResult =
  | {
      ok: true;
      booking: {
        id: string;
        status: BookingStatus;
        totalPrice: string;
        startAt: string;
        endAt: string;
      };
    }
  | { ok: false; error: string };

export async function createBooking(input: {
  sectorId: string;
  startAt: string;
  slotsCount: number;
}): Promise<CreateBookingResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "client") {
    return { ok: false, error: "Zaloguj się, aby dokonać rezerwacji." };
  }
  const clientId = session.user.id;

  const startAt = new Date(input.startAt);
  if (Number.isNaN(startAt.getTime()) || startAt.getTime() < Date.now()) {
    return { ok: false, error: "Nieprawidłowy termin." };
  }

  const settings = await getBookingSettingsOrDefault();

  if (input.slotsCount < settings.minSlots || input.slotsCount > settings.maxSlots) {
    return { ok: false, error: `Liczba slotów musi być między ${settings.minSlots} a ${settings.maxSlots}.` };
  }
  if (settings.slotStartTimes.length > 0 && !settings.slotStartTimes.includes(formatTime(startAt))) {
    return { ok: false, error: "Nieprawidłowa godzina startu." };
  }

  const [sector, client] = await Promise.all([
    prisma.sector.findUnique({ where: { id: input.sectorId } }),
    prisma.client.findUnique({ where: { id: clientId } }),
  ]);
  if (!sector || !sector.isActive) {
    return { ok: false, error: "Sektor niedostępny." };
  }
  if (!client || client.isBlocked) {
    return { ok: false, error: "Konto zablokowane. Skontaktuj się z właścicielem łowiska." };
  }

  const endAt = new Date(startAt.getTime() + input.slotsCount * settings.slotStepHours * 60 * 60 * 1000);
  const totalPrice = sector.basePrice.times(input.slotsCount);
  const status = settings.requireManualConfirmation ? BookingStatus.PENDING : BookingStatus.CONFIRMED;

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const overlap = await tx.booking.findFirst({
          where: {
            sectorId: input.sectorId,
            status: { not: BookingStatus.CANCELLED },
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          },
        });
        if (overlap) throw new BookingConflictError();

        return tx.booking.create({
          data: {
            sectorId: input.sectorId,
            clientId,
            startAt,
            endAt,
            slotsCount: input.slotsCount,
            status,
            totalPrice,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return {
      ok: true,
      booking: {
        id: booking.id,
        status: booking.status,
        totalPrice: booking.totalPrice.toString(),
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof BookingConflictError || isSerializationConflict(error)) {
      return { ok: false, error: "Ten termin został właśnie zarezerwowany. Wybierz inny termin." };
    }
    throw error;
  }
}
