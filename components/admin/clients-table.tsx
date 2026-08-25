"use client";

import { useState, useTransition } from "react";
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
import { ClientEditDialog } from "@/components/admin/client-edit-dialog";

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
  const [editing, setEditing] = useState<AdminClient | null>(null);
  const [confirmBlockId, setConfirmBlockId] = useState<string | null>(null);

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
    <>
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
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(client)}>
                  Edytuj
                </Button>
                {client.isBlocked ? (
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => handleToggle(client.id)}>
                    Odblokuj
                  </Button>
                ) : (
                  <AlertDialog
                    open={confirmBlockId === client.id}
                    onOpenChange={(open) => setConfirmBlockId(open ? client.id : null)}
                  >
                    <AlertDialogTrigger
                      render={
                        <Button size="sm" variant="destructive" disabled={pending}>
                          Zablokuj
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Zablokować klienta {client.phone}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Zablokowany klient nie będzie mógł dokonywać nowych rezerwacji.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => {
                            handleToggle(client.id);
                            setConfirmBlockId(null);
                          }}
                        >
                          Zablokuj
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ClientEditDialog client={editing} onClose={() => setEditing(null)} />
    </>
  );
}
