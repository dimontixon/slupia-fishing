"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectorEditDialog } from "@/components/admin/sector-edit-dialog";

import { updateAllSectorPrices, updateSector } from "@/lib/admin";

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
    <form onSubmit={handleSubmit} className="flex flex-col items-start gap-2 sm:flex-row sm:items-end">
      <div className="w-full space-y-2 sm:w-auto">
        <Label htmlFor="bulk-price">Cena dla wszystkich sektorów (zł / 12h)</Label>
        <Input
          id="bulk-price"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="w-full sm:w-40"
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        Zastosuj do wszystkich
      </Button>
    </form>
  );
}

type EditableField = "name" | "price";

export function SectorsTable({ sectors }: { sectors: AdminSector[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminSector | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [cellValue, setCellValue] = useState("");
  const [pending, startTransition] = useTransition();

  function startEditCell(sector: AdminSector, field: EditableField) {
    setEditingCell({ id: sector.id, field });
    setCellValue(field === "name" ? sector.name : sector.basePrice);
  }

  function saveField(sector: AdminSector, field: EditableField, value: string) {
    startTransition(async () => {
      const result = await updateSector(
        sector.id,
        field === "name" ? { name: value.trim() } : { basePrice: Number(value.replace(",", ".")) },
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEditingCell(null);
      router.refresh();
    });
  }

  function toggleActive(sector: AdminSector, isActive: boolean) {
    startTransition(async () => {
      const result = await updateSector(sector.id, { isActive });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLInputElement>, sector: AdminSector, field: EditableField) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveField(sector, field, cellValue);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditingCell(null);
    }
  }

  function renderEditableValue(sector: AdminSector, field: EditableField, display: string) {
    const isEditing = editingCell?.id === sector.id && editingCell.field === field;

    if (!isEditing) {
      return (
        <span className="inline-flex items-center gap-1.5">
          {display}
          <button
            type="button"
            onClick={() => startEditCell(sector, field)}
            aria-label={`Edytuj ${field === "name" ? "nazwę" : "cenę"}`}
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
          value={cellValue}
          onChange={(event) => setCellValue(event.target.value)}
          onKeyDown={(event) => handleCellKeyDown(event, sector, field)}
          autoFocus
          disabled={pending}
          className="h-7 w-24"
        />
        <button
          type="button"
          onClick={() => saveField(sector, field, cellValue)}
          disabled={pending}
          aria-label="Zapisz"
          className="rounded p-1 text-primary hover:bg-accent"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setEditingCell(null)}
          disabled={pending}
          aria-label="Anuluj"
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-3.5" />
        </button>
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <BulkPriceForm />

      <div className="hidden md:block">
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
                <TableCell>{renderEditableValue(sector, "name", sector.name)}</TableCell>
                <TableCell>{renderEditableValue(sector, "price", Number(sector.basePrice).toFixed(2))}</TableCell>
                <TableCell>
                  <Switch
                    checked={sector.isActive}
                    onCheckedChange={(checked) => toggleActive(sector, checked)}
                    disabled={pending}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing(sector)}>
                    Edytuj
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {sectors.map((sector) => (
          <div key={sector.id} className="rounded-lg border-2 p-4 ring-1 ring-primary/15">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                {sector.code} · {renderEditableValue(sector, "name", sector.name)}
              </span>
              <Switch
                checked={sector.isActive}
                onCheckedChange={(checked) => toggleActive(sector, checked)}
                disabled={pending}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-medium">
                {renderEditableValue(sector, "price", `${Number(sector.basePrice).toFixed(2)} zł`)}
              </span>
              <Button size="sm" variant="outline" onClick={() => setEditing(sector)}>
                Edytuj
              </Button>
            </div>
          </div>
        ))}
      </div>

      <SectorEditDialog sector={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
