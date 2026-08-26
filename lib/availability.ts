import { prisma } from "@/lib/prisma";

export type MonthAvailability = {
  year: number;
  month: number;
  daysInMonth: number;
  sectors: { id: string; code: string; name: string }[];
  occupancy: Record<string, boolean[]>;
};

function parseMonthParam(monthParam: string | undefined): { year: number; month: number } {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// Shared by the public (/kalendarz) and admin (/admin/kalendarz) calendar
// pages — both show the same read-only sector × day occupancy grid.
export async function getMonthAvailability(monthParam: string | undefined): Promise<MonthAvailability> {
  const { year, month } = parseMonthParam(monthParam);

  const monthStart = new Date(year, month - 1, 1);
  const monthEndExclusive = new Date(year, month, 1);
  const daysInMonth = Math.round((monthEndExclusive.getTime() - monthStart.getTime()) / 86400000);

  const [sectors, bookings] = await Promise.all([
    prisma.sector.findMany({ where: { isActive: true } }),
    prisma.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
        startAt: { lt: monthEndExclusive },
        endAt: { gt: monthStart },
      },
      select: { sectorId: true, startAt: true, endAt: true },
    }),
  ]);

  // Sector codes are strings ("1".."32"), so a DB-level sort would put
  // "10" before "2" — sort numerically (same fix as the admin Sektory tab).
  sectors.sort((a, b) => Number(a.code) - Number(b.code));

  const occupancy: Record<string, boolean[]> = {};
  for (const sector of sectors) {
    occupancy[sector.id] = new Array(daysInMonth).fill(false);
  }
  for (const booking of bookings) {
    const days = occupancy[booking.sectorId];
    if (!days) continue;
    for (let day = 0; day < daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day + 1);
      const dayEnd = new Date(year, month - 1, day + 2);
      if (booking.startAt < dayEnd && booking.endAt > dayStart) {
        days[day] = true;
      }
    }
  }

  return {
    year,
    month,
    daysInMonth,
    sectors: sectors.map((sector) => ({ id: sector.id, code: sector.code, name: sector.name })),
    occupancy,
  };
}
