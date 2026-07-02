"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ItemsTable } from "@/components/items-table";
import { ReceptorForm } from "@/components/receptor-form";
import type { Receptor, ItemDetalle } from "@/lib/types";
import { getEmpresa, getLogo } from "@/lib/client-storage";

const emptyReceptor: Receptor = {
  rut: "",
  razonSocial: "",
  contacto: "",
  email: "",
  direccion: "",
  comuna: "",
  ciudad: "",
};

const defaultItems: ItemDetalle[] = [
  { nombre: "", cantidad: 1, precioUnitario: 0, montoItem: 0 },
];

export default function CotizacionesPage() {
  const router = useRouter();
  const [receptor, setReceptor] = useState<Receptor>(emptyReceptor);
  const [items, setItems] = useState<ItemDetalle[]>(defaultItems);
  const [observaciones, setObservaciones] = useState("");
  const [diasValidez, setDiasValidez] = useState(30);
  const [generating, setGenerating] = useState(false);

  async function downloadPdf() {
    const empresa = getEmpresa();
    if (!empresa || !empresa.rut) {
      toast.error("Debe configurar los datos de la empresa primero");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/cotizacion/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receptor, items, observaciones, diasValidez, empresa,
          logoDataUrl: getLogo(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al generar PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setGenerating(false);
    }
  }

  function convertirAFactura() {
    const params = new URLSearchParams({
      from: "cotizacion",
      data: JSON.stringify({ receptor, items }),
    });
    router.push(`/facturas?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--snake-muted)] flex items-center justify-center">
              <FileText className="h-4 w-4 text-[var(--snake)]" />
            </div>
            Nueva Cotización
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-[42px] hidden sm:block">
            Complete los datos y descargue el PDF.
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={convertirAFactura}
            disabled={items.every((i) => !i.nombre)}
          >
            <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
            A Factura
          </Button>
          <Button
            size="sm"
            onClick={downloadPdf}
            disabled={generating}
            className="bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90 shadow-[0_0_16px_var(--snake-muted)]"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {generating ? "Generando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>

      {/* Client */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReceptorForm receptor={receptor} onChange={setReceptor} />
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Detalle de Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items} onChange={setItems} showDescuento />
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Adicional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="diasValidez" className="text-xs text-muted-foreground">
                Validez (días)
              </Label>
              <Input
                id="diasValidez"
                type="number"
                value={diasValidez}
                onChange={(e) => setDiasValidez(parseInt(e.target.value) || 30)}
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="observaciones" className="text-xs text-muted-foreground">
                Observaciones
              </Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Condiciones de pago, notas adicionales..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile actions */}
      <div className="sm:hidden sticky bottom-16 z-40 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-md border-t border-border/50">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={convertirAFactura}
            disabled={items.every((i) => !i.nombre)}
            className="flex-1"
          >
            <ArrowRight className="mr-1.5 h-4 w-4" />
            A Factura
          </Button>
          <Button
            onClick={downloadPdf}
            disabled={generating}
            className="flex-1 bg-[var(--snake)] text-[var(--snake-foreground)] hover:bg-[var(--snake)]/90"
          >
            <Download className="mr-1.5 h-4 w-4" />
            {generating ? "..." : "PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
