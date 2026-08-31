"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { toggleClientBlocked, updateClientName } from "@/lib/admin";

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
  const [confirmBlockId, setConfirmBlockId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState("");

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

  function startEditName(client: AdminClient) {
    setEditingId(client.id);
    setNameValue(client.name ?? "");
  }

  function saveName(clientId: string, name: string) {
    startTransition(async () => {
      const result = await updateClientName(clientId, name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>, clientId: string) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveName(clientId, nameValue);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditingId(null);
    }
  }

  function renderName(client: AdminClient) {
    if (editingId !== client.id) {
      return (
        <span className="inline-flex items-center gap-1.5">
          {client.name ?? "—"}
          <button
            type="button"
            onClick={() => startEditName(client)}
            aria-label="Edytuj nazwę"
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1">
        <Input
          value={nameValue}
          onChange={(event) => setNameValue(event.target.value)}
          onKeyDown={(event) => handleNameKeyDown(event, client.id)}
          autoFocus
          disabled={pending}
          className="h-7 w-32"
        />
        <button
          type="button"
          onClick={() => saveName(client.id, nameValue)}
          disabled={pending}
          aria-label="Zapisz"
          className="rounded p-1 text-primary hover:bg-accent"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setEditingId(null)}
          disabled={pending}
          aria-label="Anuluj"
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-3.5" />
        </button>
      </span>
    );
  }

  function renderBlockAction(client: AdminClient) {
    if (client.isBlocked) {
      return (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => handleToggle(client.id)}>
          Odblokuj
        </Button>
      );
    }
    return (
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
    );
  }

  return (
    <>
      <div className="hidden md:block">
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
                <TableCell>{renderName(client)}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/rezerwacje?clientId=${client.id}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {client.bookingsCount}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={client.isBlocked ? "destructive" : "outline"}>
                    {client.isBlocked ? "Zablokowany" : "Aktywny"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{renderBlockAction(client)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {clients.map((client) => (
          <div key={client.id} className="rounded-lg border-2 p-4 ring-1 ring-primary/15">
            <div className="flex items-center justify-between">
              <span className="font-medium">{client.phone}</span>
              <Badge variant={client.isBlocked ? "destructive" : "outline"}>
                {client.isBlocked ? "Zablokowany" : "Aktywny"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {renderName(client)} ·{" "}
              <Link
                href={`/admin/rezerwacje?clientId=${client.id}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {client.bookingsCount} {client.bookingsCount === 1 ? "rezerwacja" : "rezerwacji"}
              </Link>
            </p>
            <div className="mt-3 flex justify-end">{renderBlockAction(client)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
