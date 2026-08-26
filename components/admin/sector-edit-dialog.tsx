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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateSector } from "@/lib/admin";
import type { AdminSector } from "@/components/admin/sectors-table";

// Nazwa, cena i status aktywności są edytowalne bezpośrednio w tabeli —
// ten dialog obsługuje tylko to, co jeszcze nie ma tam swojego miejsca:
// notatki i pozycję sektora na mapie (polygon).
export function SectorEditDialog({ sector, onClose }: { sector: AdminSector | null; onClose: () => void }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [polygonJson, setPolygonJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  if (sector && sector.id !== loadedForId) {
    setLoadedForId(sector.id);
    setNotes(sector.notes ?? "");
    setPolygonJson(JSON.stringify(sector.polygon, null, 2));
    setError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sector) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSector(sector.id, { notes, polygonJson });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Sektor zaktualizowany.");
      router.refresh();
      onClose();
    });
  }

  return (
    <Dialog open={sector !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sektor {sector?.code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="sector-notes">Notatki</Label>
            <Textarea id="sector-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector-polygon">Polygon (JSON, punkty {"{x,y}"} 0-100)</Label>
            <Textarea
              id="sector-polygon"
              value={polygonJson}
              onChange={(event) => setPolygonJson(event.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
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
