"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { MoneyInput } from "@/components/money-input";
import { getProductos } from "@/lib/client-storage";
import type { ItemDetalle, Producto } from "@/lib/types";

interface ItemsTableProps {
  items: ItemDetalle[];
  onChange: (items: ItemDetalle[]) => void;
  showDescuento?: boolean;
}

const emptyItem: ItemDetalle = {
  nombre: "",
  cantidad: 1,
  precioUnitario: 0,
  montoItem: 0,
};

function calcMontoItem(item: ItemDetalle): number {
  const subtotal = item.cantidad * item.precioUnitario;
  const descuento = item.descuentoPct
    ? Math.round(subtotal * (item.descuentoPct / 100))
    : 0;
  return subtotal - descuento;
}

const ghostInput =
  "bg-transparent border-transparent hover:border-border focus:border-ring focus:bg-input transition-all duration-200 h-9";

export function ItemsTable({
  items,
  onChange,
  showDescuento = true,
}: ItemsTableProps) {
  const [catalogo, setCatalogo] = useState<Producto[]>([]);

  useEffect(() => {
    setCatalogo(getProductos());
  }, []);

  function addRow() {
    onChange([...items, { ...emptyItem }]);
  }

  function removeRow(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof ItemDetalle,
    value: string | number
  ) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      newItem.montoItem = calcMontoItem(newItem);
      return newItem;
    });
    onChange(updated);
  }

  function selectProducto(index: number, productoId: string) {
    const prod = catalogo.find((p) => p.id === productoId);
    if (!prod) return;
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = {
        ...item,
        nombre: prod.nombre,
        precioUnitario: prod.precioUnitario,
      };
      newItem.montoItem = calcMontoItem(newItem);
      return newItem;
    });
    onChange(updated);
  }

  const neto = items.reduce((sum, item) => sum + item.montoItem, 0);
  const iva = Math.round(neto * 0.19);
  const total = neto + iva;

  return (
    <div className="space-y-4">
      {/* Mobile: card layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/50 bg-card p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Item {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {catalogo.length > 0 && (
              <Select
                value=""
                onValueChange={(v) => {
                  if (v) selectProducto(index, v);
                }}
              >
                <SelectTrigger className="h-8 text-xs border-dashed">
                  <Package className="h-3 w-3 mr-1.5 shrink-0 text-[var(--snake)]" />
                  <SelectValue placeholder="Elegir del catálogo..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogo.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.nombre} - ${prod.precioUnitario.toLocaleString("es-CL")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input
              value={item.nombre}
              onChange={(e) => updateItem(index, "nombre", e.target.value)}
              placeholder="Nombre del producto/servicio"
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Cantidad</Label>
                <Input
                  type="number"
                  value={item.cantidad || ""}
                  onChange={(e) => updateItem(index, "cantidad", parseFloat(e.target.value) || 0)}
                  min={1}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Precio Unit.</Label>
                <MoneyInput
                  value={item.precioUnitario}
                  onChange={(v) => updateItem(index, "precioUnitario", v)}
                />
              </div>
            </div>

            {showDescuento && (
              <div className="w-1/2 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Descuento %</Label>
                <Input
                  type="number"
                  value={item.descuentoPct || ""}
                  onChange={(e) => updateItem(index, "descuentoPct", parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="font-bold text-sm text-[var(--snake)]">
                {formatCurrency(item.montoItem)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: billing grid */}
      <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_120px_90px_120px_40px] bg-muted/30 border-b border-border/50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Descripción</span>
          <span className="text-center">Cant.</span>
          <span className="text-right">P. Unit.</span>
          {showDescuento && <span className="text-center">Desc.</span>}
          <span className="text-right">Monto</span>
          <span />
        </div>
        {!showDescuento && (
          <style>{`.billing-grid { grid-template-columns: 1fr 90px 120px 120px 40px !important; }`}</style>
        )}
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "grid px-3 py-1.5 items-center group transition-colors hover:bg-muted/20",
              showDescuento
                ? "grid-cols-[1fr_90px_120px_90px_120px_40px]"
                : "grid-cols-[1fr_90px_120px_120px_40px]"
            )}
          >
            <div className="flex flex-col gap-0.5 pr-2">
              {catalogo.length > 0 && !item.nombre && (
                <Select
                  value=""
                  onValueChange={(v) => {
                    if (v) selectProducto(index, v);
                  }}
                >
                  <SelectTrigger className="h-7 text-[11px] text-muted-foreground border-dashed">
                    <Package className="h-3 w-3 mr-1 text-[var(--snake)]" />
                    <SelectValue placeholder="Catálogo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogo.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.nombre} - ${prod.precioUnitario.toLocaleString("es-CL")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                value={item.nombre}
                onChange={(e) => updateItem(index, "nombre", e.target.value)}
                placeholder="Producto o servicio..."
                className={ghostInput}
              />
            </div>
            <Input
              type="number"
              value={item.cantidad || ""}
              onChange={(e) => updateItem(index, "cantidad", parseFloat(e.target.value) || 0)}
              min={1}
              className={cn(ghostInput, "text-center")}
            />
            <Input
              type="number"
              value={item.precioUnitario || ""}
              onChange={(e) => updateItem(index, "precioUnitario", parseInt(e.target.value) || 0)}
              min={0}
              className={cn(ghostInput, "text-right")}
            />
            {showDescuento && (
              <Input
                type="number"
                value={item.descuentoPct || ""}
                onChange={(e) => updateItem(index, "descuentoPct", parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                className={cn(ghostInput, "text-center")}
              />
            )}
            <span className="text-right text-sm font-medium tabular-nums pr-1">
              {formatCurrency(item.montoItem)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
              onClick={() => removeRow(index)}
              disabled={items.length === 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <div className="border-t border-border/50 px-3 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addRow}
            className="text-muted-foreground hover:text-[var(--snake)] w-full justify-start gap-2 h-9"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar item
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full md:w-72 rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Neto</span>
            <span className="font-medium tabular-nums">{formatCurrency(neto)}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm border-t border-border/30">
            <span className="text-muted-foreground">IVA (19%)</span>
            <span className="font-medium tabular-nums">{formatCurrency(iva)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 bg-[var(--snake-muted)] border-t border-[var(--snake)]/20">
            <span className="font-bold text-[var(--snake)]">Total</span>
            <span className="font-bold text-lg text-[var(--snake)] tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile add button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full md:hidden border-dashed"
      >
        <Plus className="mr-2 h-4 w-4" />
        Agregar Item
      </Button>
    </div>
  );
}
