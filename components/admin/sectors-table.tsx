"use client";

import { useState, useTransition, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectorEditDialog } from "@/components/admin/sector-edit-dialog";

import { updateAllSectorPrices } from "@/lib/admin";

export type AdminSector = {
  id: string;
  code: string;
  name: string;
  basePrice: string;
  isActive: boolean;
  notes: string | null;
  polygon: { x: number; y: number }[];
};

function BulkPriceForm() {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateAllSectorPrices(Number(price.replace(",", ".")));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Cena zaktualizowana dla wszystkich sektorów.");
      setPrice("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="space-y-2">
        <Label htmlFor="bulk-price">Cena dla wszystkich sektorów (zł / 12h)</Label>
        <Input
          id="bulk-price"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="w-40"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        Zastosuj do wszystkich
      </Button>
    </form>
  );
}

export function SectorsTable({ sectors }: { sectors: AdminSector[] }) {
  const [editing, setEditing] = useState<AdminSector | null>(null);

  return (
    <div className="space-y-4">
      <BulkPriceForm />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead>Cena (zł / 12h)</TableHead>
            <TableHead>Aktywny</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell>{sector.code}</TableCell>
              <TableCell>{sector.name}</TableCell>
              <TableCell>{Number(sector.basePrice).toFixed(2)}</TableCell>
              <TableCell>{sector.isActive ? "Tak" : "Nie"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEditing(sector)}>
                  Edytuj
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SectorEditDialog sector={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
