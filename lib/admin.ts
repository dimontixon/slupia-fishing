"use server";

import { BookingStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Brak uprawnień administratora.");
  }
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function updateSector(
  id: string,
  data: {
    name: string;
    basePrice: number;
    isActive: boolean;
    notes: string;
    polygonJson: string;
  },
): Promise<ActionResult> {
  await requireAdminSession();

  if (!data.name.trim()) {
    return { ok: false, error: "Nazwa nie może być pusta." };
  }
  if (!Number.isFinite(data.basePrice) || data.basePrice <= 0) {
    return { ok: false, error: "Cena musi być liczbą dodatnią." };
  }

  let polygon: unknown;
  try {
    polygon = JSON.parse(data.polygonJson);
  } catch {
    return { ok: false, error: "Polygon musi być poprawnym JSON-em." };
  }
  const isValidPolygon =
    Array.isArray(polygon) &&
    polygon.length >= 3 &&
    polygon.every(
      (p) =>
        p &&
        typeof p.x === "number" &&
        typeof p.y === "number" &&
        p.x >= 0 &&
        p.x <= 100 &&
        p.y >= 0 &&
        p.y <= 100,
    );
  if (!isValidPolygon) {
    return {
      ok: false,
      error: "Polygon musi być tablicą min. 3 punktów {x,y} w zakresie 0-100.",
    };
  }

  await prisma.sector.update({
    where: { id },
    data: {
      name: data.name.trim(),
      basePrice: data.basePrice,
      isActive: data.isActive,
      notes: data.notes.trim() || null,
      polygon: polygon as Prisma.InputJsonValue,
    },
  });

  return { ok: true };
}

export async function updateBookingSettings(data: {
  slotStartTimesText: string;
  slotStepHours: number;
  minSlots: number;
  maxSlots: number;
  cancellationHoursBefore: number;
  requireManualConfirmation: boolean;
}): Promise<ActionResult> {
  await requireAdminSession();

  const slotStartTimes = data.slotStartTimesText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (slotStartTimes.length === 0 || !slotStartTimes.every((t) => TIME_REGEX.test(t))) {
    return { ok: false, error: "Godziny startu muszą być w formacie HH:mm, oddzielone przecinkami." };
  }
  if (!Number.isInteger(data.slotStepHours) || data.slotStepHours <= 0) {
    return { ok: false, error: "Krok slotu musi być dodatnią liczbą całkowitą godzin." };
  }
  if (!Number.isInteger(data.minSlots) || !Number.isInteger(data.maxSlots) || data.minSlots < 1 || data.minSlots > data.maxSlots) {
    return { ok: false, error: "Min. sloty muszą być >= 1 i <= max. sloty." };
  }
  if (!Number.isInteger(data.cancellationHoursBefore) || data.cancellationHoursBefore < 0) {
    return { ok: false, error: "Okres anulowania musi być nieujemną liczbą godzin." };
  }

  await prisma.bookingSettings.upsert({
    where: { id: "default" },
    update: {
      slotStartTimes,
      slotStepHours: data.slotStepHours,
      minSlots: data.minSlots,
      maxSlots: data.maxSlots,
      cancellationHoursBefore: data.cancellationHoursBefore,
      requireManualConfirmation: data.requireManualConfirmation,
    },
    create: {
      id: "default",
      slotStartTimes,
      slotStepHours: data.slotStepHours,
      minSlots: data.minSlots,
      maxSlots: data.maxSlots,
      cancellationHoursBefore: data.cancellationHoursBefore,
      requireManualConfirmation: data.requireManualConfirmation,
    },
  });

  return { ok: true };
}

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateBookingStatus(bookingId: string, nextStatus: BookingStatus): Promise<ActionResult> {
  await requireAdminSession();

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return { ok: false, error: "Rezerwacja nie istnieje." };
  }
  if (!ALLOWED_TRANSITIONS[booking.status].includes(nextStatus)) {
    return { ok: false, error: `Nie można zmienić statusu z ${booking.status} na ${nextStatus}.` };
  }

  await prisma.booking.update({ where: { id: bookingId }, data: { status: nextStatus } });

  return { ok: true };
}

export async function toggleClientBlocked(clientId: string): Promise<ActionResult> {
  await requireAdminSession();

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { ok: false, error: "Klient nie istnieje." };
  }

  await prisma.client.update({ where: { id: clientId }, data: { isBlocked: !client.isBlocked } });

  return { ok: true };
}
