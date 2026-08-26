import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CalendarSector = { id: string; code: string; name: string };

const ROW_HEIGHT = 26;
const DAY_COL_WIDTH = 28;
const LABEL_COL_WIDTH = 110;

export function AvailabilityCalendar({
  year,
  month,
  daysInMonth,
  sectors,
  occupancy,
  basePath = "/kalendarz",
}: {
  year: number;
  month: number;
  daysInMonth: number;
  sectors: CalendarSector[];
  occupancy: Record<string, boolean[]>;
  basePath?: string;
}) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  const rawLabel = new Date(year, month - 1, 1).toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });
  const monthLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const prevHref = `${basePath}?month=${prev.year}-${String(prev.month).padStart(2, "0")}`;
  const nextHref = `${basePath}?month=${next.year}-${String(next.month).padStart(2, "0")}`;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function isWeekend(day: number) {
    const dow = new Date(year, month - 1, day).getDay();
    return dow === 0 || dow === 6;
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href={prevHref}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Poprzedni
        </Link>
        <h2 className="font-heading text-lg font-semibold">{monthLabel}</h2>
        <Link
          href={nextHref}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Następny <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-background ring-1 ring-inset ring-border" /> Wolny
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary/70" /> Zajęty
        </span>
      </div>

      {/* Two panels side by side: a fixed (never-scrolling) sector-label
          column, and the day grid in its own overflow-x-auto container.
          Deliberately not relying on `position: sticky` inside the
          scrolling grid — it wouldn't stay put reliably nested this many
          layers deep, this way the label column simply never moves. */}
      <div className="flex min-w-0 overflow-hidden rounded-lg border">
        <div className="shrink-0 border-r" style={{ width: LABEL_COL_WIDTH }}>
          <div className="grid text-xs" style={{ gridAutoRows: ROW_HEIGHT }}>
            <div className="flex items-center border-b bg-card px-2 font-medium">Sektor</div>
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="flex items-center truncate border-b bg-card px-2 font-medium"
                title={sector.name}
              >
                Sektor {sector.code}
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div
            className="grid text-xs"
            style={{ gridTemplateColumns: `repeat(${daysInMonth}, ${DAY_COL_WIDTH}px)`, gridAutoRows: ROW_HEIGHT }}
          >
            {days.map((day) => (
              <div
                key={day}
                className={cn(
                  "flex items-center justify-center border-b border-l font-medium",
                  isWeekend(day) && "bg-muted/60",
                  isCurrentMonth && day === todayDate && "bg-accent-warm text-accent-warm-foreground",
                )}
              >
                {day}
              </div>
            ))}

            {sectors.map((sector) => (
              <Fragment key={sector.id}>
                {days.map((day) => {
                  const occupied = occupancy[sector.id]?.[day - 1] ?? false;
                  return (
                    <div
                      key={day}
                      title={`${sector.name} · ${day}.${String(month).padStart(2, "0")}.${year} · ${occupied ? "Zajęty" : "Wolny"}`}
                      className={cn(
                        "border-b border-l",
                        occupied ? "bg-primary/70" : isWeekend(day) ? "bg-muted/40" : "bg-background",
                        isCurrentMonth && day === todayDate && "ring-1 ring-inset ring-accent-warm-foreground/50",
                      )}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
