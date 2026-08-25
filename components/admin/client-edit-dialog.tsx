"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateClientName } from "@/lib/admin";
import type { AdminClient } from "@/components/admin/clients-table";

export function ClientEditDialog({ client, onClose }: { client: AdminClient | null; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  // Populate the form during render when a different client is opened —
  // no effect needed since the data is already available as a prop.
  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  if (client && client.id !== loadedForId) {
    setLoadedForId(client.id);
    setName(client.name ?? "");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!client) return;
    startTransition(async () => {
      const result = await updateClientName(client.id, name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Dane klienta zaktualizowane.");
      router.refresh();
      onClose();
    });
  }

  return (
    <Dialog open={client !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Klient {client?.phone}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Nazwa kontaktu</Label>
            <Input id="client-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={pending}>
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
