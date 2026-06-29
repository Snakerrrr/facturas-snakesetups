"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
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
    <div className="space-y-3">
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Nombre</TableHead>
              <TableHead className="w-[100px]">Cantidad</TableHead>
              <TableHead className="w-[130px]">Precio Unit.</TableHead>
              {showDescuento && (
                <TableHead className="w-[90px]">Desc. %</TableHead>
              )}
              <TableHead className="w-[130px] text-right">Monto</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {catalogo.length > 0 && (
                      <Select
                        value=""
                        onValueChange={(v) => {
                          if (v) selectProducto(index, v);
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs text-muted-foreground">
                          <SelectValue placeholder="Elegir del catálogo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogo.map((prod) => (
                            <SelectItem key={prod.id} value={prod.id}>
                              {prod.nombre} - $
                              {prod.precioUnitario.toLocaleString("es-CL")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      value={item.nombre}
                      onChange={(e) =>
                        updateItem(index, "nombre", e.target.value)
                      }
                      placeholder="Nombre del producto/servicio"
                      className="h-9"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.cantidad || ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "cantidad",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min={1}
                    className="h-9"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.precioUnitario || ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "precioUnitario",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min={0}
                    className="h-9"
                  />
                </TableCell>
                {showDescuento && (
                  <TableCell>
                    <Input
                      type="number"
                      value={item.descuentoPct || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "descuentoPct",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={100}
                      className="h-9"
                    />
                  </TableCell>
                )}
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.montoItem)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeRow(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={showDescuento ? 4 : 3}
                className="text-right font-medium"
              >
                Neto
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(neto)}
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={showDescuento ? 4 : 3}
                className="text-right font-medium"
              >
                IVA (19%)
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(iva)}
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={showDescuento ? 4 : 3}
                className="text-right font-medium text-lg"
              >
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(total)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Item
      </Button>
    </div>
  );
}
