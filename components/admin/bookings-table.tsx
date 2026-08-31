"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BookingStatus } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { updateBookingStatus } from "@/lib/admin";

export type AdminBooking = {
  id: string;
  sectorName: string;
  clientPhone: string;
  startAt: string;
  endAt: string;
  slotsCount: number;
  totalPrice: string;
  status: BookingStatus;
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Oczekuje",
  CONFIRMED: "Potwierdzona",
  COMPLETED: "Zakończona",
  CANCELLED: "Anulowana",
};

const STATUS_VARIANTS: Record<BookingStatus, "secondary" | "default" | "outline" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

const ACTIONS: Record<BookingStatus, { label: string; next: BookingStatus }[]> = {
  PENDING: [
    { label: "Potwierdź", next: "CONFIRMED" as BookingStatus },
    { label: "Anuluj", next: "CANCELLED" as BookingStatus },
  ],
  CONFIRMED: [
    { label: "Zakończ", next: "COMPLETED" as BookingStatus },
    { label: "Anuluj", next: "CANCELLED" as BookingStatus },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(bookingId: string, next: BookingStatus) {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sektor</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Termin</TableHead>
              <TableHead>Sloty</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.sectorName}</TableCell>
                <TableCell>{booking.clientPhone}</TableCell>
                <TableCell>
                  {formatDateTime(booking.startAt)} – {formatDateTime(booking.endAt)}
                </TableCell>
                <TableCell>{booking.slotsCount}</TableCell>
                <TableCell>{Number(booking.totalPrice).toFixed(2)} zł</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {ACTIONS[booking.status].map((action) => (
                    <Button
                      key={action.next}
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => handleAction(booking.id, action.next)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-lg border-2 p-4 ring-1 ring-primary/15">
            <div className="flex items-center justify-between">
              <span className="font-medium">{booking.sectorName}</span>
              <Badge variant={STATUS_VARIANTS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {booking.clientPhone} · {formatDateTime(booking.startAt)} – {formatDateTime(booking.endAt)}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-medium">{Number(booking.totalPrice).toFixed(2)} zł</span>
              <div className="flex gap-2">
                {ACTIONS[booking.status].map((action) => (
                  <Button
                    key={action.next}
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => handleAction(booking.id, action.next)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
