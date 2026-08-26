"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { BookingStatus } from "@prisma/client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "PENDING", label: "Oczekuje" },
  { value: "CONFIRMED", label: "Potwierdzona" },
  { value: "COMPLETED", label: "Zakończona" },
  { value: "CANCELLED", label: "Anulowana" },
];

// Native date inputs only open their picker when the small calendar icon is
// clicked — make the whole field open it, matching the fix already applied
// to the booking dialog's date field.
function openPicker(event: React.MouseEvent<HTMLInputElement>) {
  event.currentTarget.showPicker?.();
}

export function BookingsFilterBar({
  sectors,
  clients,
}: {
  sectors: { id: string; name: string }[];
  clients: { id: string; phone: string; name: string | null }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const sectorId = searchParams.get("sectorId") ?? "all";
  const clientId = searchParams.get("clientId") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilters = sectorId !== "all" || clientId !== "all" || status !== "all" || from || to;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label>Sektor</Label>
        <Select value={sectorId} onValueChange={(value) => setParam("sectorId", value === "all" ? null : value)}>
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string) => sectors.find((sector) => sector.id === value)?.name ?? "Wszystkie sektory"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie sektory</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Klient</Label>
        <Select value={clientId} onValueChange={(value) => setParam("clientId", value === "all" ? null : value)}>
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) => {
                const client = clients.find((c) => c.id === value);
                if (!client) return "Wszyscy klienci";
                return client.name ? `${client.phone} (${client.name})` : client.phone;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy klienci</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name ? `${client.phone} (${client.name})` : client.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Status</Label>
        <Select value={status} onValueChange={(value) => setParam("status", value === "all" ? null : value)}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: string) => STATUS_OPTIONS.find((option) => option.value === value)?.label ?? "Wszystkie statusy"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="filter-from">Od</Label>
        <Input
          id="filter-from"
          type="date"
          value={from}
          onChange={(event) => setParam("from", event.target.value || null)}
          onClick={openPicker}
          className="w-36"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="filter-to">Do</Label>
        <Input
          id="filter-to"
          type="date"
          value={to}
          onChange={(event) => setParam("to", event.target.value || null)}
          onClick={openPicker}
          className="w-36"
        />
      </div>

      <Button type="button" variant="destructive" size="sm" disabled={!hasFilters} onClick={() => router.push(pathname)}>
        Reset
      </Button>
    </div>
  );
}
