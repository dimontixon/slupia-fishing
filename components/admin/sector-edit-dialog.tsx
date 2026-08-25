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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { updateSector } from "@/lib/admin";
import type { AdminSector } from "@/components/admin/sectors-table";

export function SectorEditDialog({ sector, onClose }: { sector: AdminSector | null; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState("");
  const [polygonJson, setPolygonJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Populate the form during render when a different sector is opened —
  // no effect needed since the data is already available as a prop.
  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  if (sector && sector.id !== loadedForId) {
    setLoadedForId(sector.id);
    setName(sector.name);
    setBasePrice(String(sector.basePrice));
    setIsActive(sector.isActive);
    setNotes(sector.notes ?? "");
    setPolygonJson(JSON.stringify(sector.polygon, null, 2));
    setError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sector) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSector(sector.id, {
        name,
        basePrice: Number(basePrice.replace(",", ".")),
        isActive,
        notes,
        polygonJson,
      });
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
            <Label htmlFor="sector-name">Nazwa</Label>
            <Input id="sector-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector-price">Cena (zł / 12h)</Label>
            <Input
              id="sector-price"
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="sector-active" checked={isActive} onCheckedChange={(value) => setIsActive(value === true)} />
            <Label htmlFor="sector-active">Aktywny (widoczny na mapie)</Label>
          </div>
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
