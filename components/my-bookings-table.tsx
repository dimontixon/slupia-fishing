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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { cancelMyBooking, type MyBooking } from "@/lib/booking";

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Oczekuje na potwierdzenie",
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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MyBookingsTable({ bookings }: { bookings: MyBooking[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleCancel(bookingId: string) {
    startTransition(async () => {
      const result = await cancelMyBooking(bookingId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych rezerwacji.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sektor</TableHead>
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
            <TableCell>
              {formatDateTime(booking.startAt)} – {formatDateTime(booking.endAt)}
            </TableCell>
            <TableCell>{booking.slotsCount}</TableCell>
            <TableCell>{Number(booking.totalPrice).toFixed(2)} zł</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
            </TableCell>
            <TableCell>
              {booking.cancellable ? (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button size="sm" variant="destructive" disabled={pending}>
                        Anuluj rezerwację
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anulować rezerwację sektora {booking.sectorName}?</AlertDialogTitle>
                      <AlertDialogDescription>Tej operacji nie można cofnąć.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Wróć</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => handleCancel(booking.id)}>
                        Anuluj rezerwację
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                booking.status !== "CANCELLED" &&
                booking.status !== "COMPLETED" && (
                  <span className="text-xs text-muted-foreground">Nie można już anulować</span>
                )
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
