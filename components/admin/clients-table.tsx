"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

import { toggleClientBlocked } from "@/lib/admin";

export type AdminClient = {
  id: string;
  phone: string;
  name: string | null;
  isBlocked: boolean;
  bookingsCount: number;
};

export function ClientsTable({ clients }: { clients: AdminClient[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleToggle(clientId: string) {
    startTransition(async () => {
      const result = await toggleClientBlocked(clientId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Telefon</TableHead>
          <TableHead>Nazwa</TableHead>
          <TableHead>Liczba rezerwacji</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>{client.phone}</TableCell>
            <TableCell>{client.name ?? "—"}</TableCell>
            <TableCell>{client.bookingsCount}</TableCell>
            <TableCell>
              <Badge variant={client.isBlocked ? "destructive" : "outline"}>
                {client.isBlocked ? "Zablokowany" : "Aktywny"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => handleToggle(client.id)}>
                {client.isBlocked ? "Odblokuj" : "Zablokuj"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
